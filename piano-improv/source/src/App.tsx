import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Coffee,
  Headphones,
  House,
  Leaf,
  Lightbulb,
  ListMusic,
  Menu,
  Music2,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { PianoAudio } from './audio';
import { EmptyState, Notes, PianoArtwork, StyleSwitch, Week } from './components';
import {
  explorePrompts,
  formatTime,
  missions,
  settings,
  stageAt,
  stageLengths,
  stages,
  type Difficulty,
  type Duration,
  type Style,
} from './music';
import {
  initialState,
  localDateKey,
  parseState,
  practiceDays,
  recommendedMission,
  STORAGE_KEY,
  weekDates,
  type SavedState,
  type SessionRecord,
} from './storage';

type Page = 'today' | 'practice' | 'explore' | 'progress';
interface Session {
  id: string;
  missionId: string;
  style: Style;
  duration: Duration;
  elapsed: number;
  seconds: number;
  running: boolean;
  done: boolean;
}

const navItems = [
  { id: 'today' as Page, label: 'Today', icon: House },
  { id: 'practice' as Page, label: 'Practice', icon: ListMusic },
  { id: 'explore' as Page, label: 'Explore', icon: Sparkles },
  { id: 'progress' as Page, label: 'My practice', icon: BookOpen },
];

export default function App() {
  const [saved, setSaved] = useState<SavedState>(() => {
    try {
      return parseState(localStorage.getItem(STORAGE_KEY));
    } catch {
      return { ...initialState };
    }
  });
  const [storageError, setStorageError] = useState(false);
  const [page, setPage] = useState<Page>('today');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [reflection, setReflection] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [pendingPage, setPendingPage] = useState<Page | null>(null);
  const [hints, setHints] = useState(true);
  const [tempo, setTempo] = useState(72);
  const [volume, setVolume] = useState(0.65);
  const [backing, setBacking] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const [currentChord, setCurrentChord] = useState('C');
  const [exploreId, setExploreId] = useState(settings[0].id);
  const [exploring, setExploring] = useState(false);
  const [promptIndex, setPromptIndex] = useState(-1);
  const [audio] = useState(() => new PianoAudio());
  const dialogRef = useRef<HTMLDialogElement>(null);
  const playbackRequest = useRef(0);
  const recommended = recommendedMission(saved.sessions, saved.style);
  const mission = missions.find((m) => m.id === session?.missionId) ?? recommended;
  const sessionStyle = session?.style ?? saved.style;
  const stage = stageAt(session?.elapsed ?? 0, session?.duration ?? saved.duration);
  const currentStage = stages[stage.index];
  const setting = settings.find((s) => s.id === exploreId)!;
  const isSaved = session?.id === savedId;
  const active = !!session && !isSaved;
  const audioActive =
    page === 'practice' ? !!session?.running && !session.done : page === 'explore' && exploring;
  const harmony = page === 'explore' ? setting.harmony : mission.harmony[sessionStyle];
  const audioStyle = page === 'explore' ? setting.style : sessionStyle;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [saved]);

  useEffect(() => () => audio.dispose(), [audio]);
  useEffect(() => {
    audio.setVolume(volume);
  }, [audio, volume]);

  useEffect(() => {
    if (!unlocked || !audioActive || !backing || demoPlaying) {
      audio.stopBacking();
      return;
    }
    audio.startBacking({
      style: audioStyle,
      harmony,
      tempo,
      onBeat: (next, chord) => {
        setBeat(next);
        setCurrentChord(chord);
      },
    });
    return () => audio.stopBacking();
  }, [audio, unlocked, audioActive, backing, demoPlaying, audioStyle, harmony, tempo]);

  useEffect(() => {
    if (!session?.running || session.done) return;
    let last = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const delta = (now - last) / 1000;
      last = now;
      setSession((previous) => {
        if (!previous?.running || previous.done) return previous;
        const added = Math.min(delta, previous.duration * 60 - previous.elapsed);
        const elapsed = previous.elapsed + added;
        const done = elapsed >= previous.duration * 60;
        return { ...previous, elapsed, seconds: previous.seconds + added, done, running: !done };
      });
    }, 200);
    return () => clearInterval(interval);
  }, [session?.id, session?.running, session?.done]);

  const stopSound = useCallback(() => {
    playbackRequest.current++;
    audio.stop();
    setDemoPlaying(false);
  }, [audio]);

  useEffect(() => {
    const onHidden = () => {
      if (!document.hidden) return;
      setSession((previous) => (previous ? { ...previous, running: false } : null));
      setExploring(false);
      stopSound();
    };
    document.addEventListener('visibilitychange', onHidden);
    return () => document.removeEventListener('visibilitychange', onHidden);
  }, [stopSound]);

  useEffect(() => {
    if (!active) return;
    const onUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [active]);

  useEffect(() => {
    if (pendingPage) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [pendingPage]);

  useEffect(() => {
    if (session?.done) stopSound();
  }, [session?.done, stopSound]);

  async function unlockAudio() {
    try {
      await audio.ready();
      setUnlocked(true);
      setAudioError('');
      return true;
    } catch (error) {
      setAudioError(
        error instanceof Error
          ? error.message
          : 'Sound could not start. You can still practice without it.',
      );
      return false;
    }
  }

  function changeStyle(style: Style) {
    setSaved((previous) => ({ ...previous, style }));
  }
  function changeDuration(duration: Duration) {
    setSaved((previous) => ({ ...previous, duration }));
  }

  function goTo(target: Page) {
    setMobileMenu(false);
    if (target === page) return;
    if (active) {
      setSession((previous) => (previous ? { ...previous, running: false } : null));
      stopSound();
      setPendingPage(target);
      return;
    }
    stopSound();
    setExploring(false);
    if (target === 'practice') setSession(null);
    if (target === 'explore') setTempo(setting.tempo);
    setPage(target);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function startSession(
    missionId = recommended.id,
    duration = saved.duration,
    style = saved.style,
  ) {
    stopSound();
    setExploring(false);
    setReflection('');
    setDifficulty(null);
    setSavedId(null);
    setBacking(true);
    setHints(true);
    setTempo(style === 'jazz' ? 84 : 72);
    setSession({
      id: crypto.randomUUID(),
      missionId,
      style,
      duration,
      elapsed: 0,
      seconds: 0,
      running: true,
      done: false,
    });
    setPage('practice');
    setCurrentChord(missions.find((m) => m.id === missionId)!.harmony[style][0].name);
    void unlockAudio();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function toggleSession() {
    if (session?.running) stopSound();
    else void unlockAudio();
    setSession((previous) => (previous ? { ...previous, running: !previous.running } : null));
  }

  function nextStage() {
    playbackRequest.current++;
    audio.stopDemo();
    setDemoPlaying(false);
    setSession((previous) => {
      if (!previous) return null;
      const current = stageAt(previous.elapsed, previous.duration);
      if (current.index === stages.length - 1) return { ...previous, done: true, running: false };
      return {
        ...previous,
        elapsed: stageLengths(previous.duration)
          .slice(0, current.index + 1)
          .reduce((a, b) => a + b, 0),
      };
    });
  }

  function previousStage() {
    playbackRequest.current++;
    audio.stopDemo();
    setDemoPlaying(false);
    setSession((previous) => {
      if (!previous) return null;
      const current = stageAt(previous.elapsed, previous.duration);
      const index = Math.max(0, current.index - 1);
      return {
        ...previous,
        elapsed: stageLengths(previous.duration)
          .slice(0, index)
          .reduce((a, b) => a + b, 0),
      };
    });
  }

  async function playDemo() {
    if (demoPlaying) {
      audio.stopDemo();
      setDemoPlaying(false);
      return;
    }
    const request = ++playbackRequest.current;
    if (!(await unlockAudio())) return;
    if (request !== playbackRequest.current) return;
    setDemoPlaying(true);
    audio.playDemo(mission.demo[sessionStyle], tempo, () => setDemoPlaying(false));
  }

  function saveSession() {
    if (!session || isSaved) return;
    stopSound();
    const record: SessionRecord = {
      id: session.id,
      missionId: session.missionId,
      style: session.style,
      duration: session.duration,
      seconds: Math.round(session.seconds),
      finishedAt: new Date().toISOString(),
      reflection: reflection.trim(),
      difficulty,
    };
    setSaved((previous) => ({
      ...previous,
      sessions: [record, ...previous.sessions].slice(0, 500),
    }));
    setSavedId(session.id);
  }

  const completedIds = new Set(
    saved.sessions.filter((s) => s.style === saved.style).map((s) => s.missionId),
  );
  const weekCount = weekDates().filter((date) =>
    practiceDays(saved.sessions).has(localDateKey(date)),
  ).length;
  const totalMinutes = Math.round(
    saved.sessions.reduce((sum, record) => sum + record.seconds, 0) / 60,
  );

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <aside className={`sidebar ${mobileMenu ? 'mobile-open' : ''}`}>
        <button className="brand" onClick={() => goTo('today')} aria-label="Interlude home">
          <span className="brand-mark">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>
            interlude<span className="brand-period">.</span>
          </span>
        </button>
        <div className="sidebar-intro">
          A little structure.
          <br />A little freedom.
        </div>
        <nav aria-label="Main navigation">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? 'active' : ''}`}
              aria-label={label}
              title={label}
              aria-current={page === id ? 'page' : undefined}
              onClick={() => goTo(id)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {page === id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Week sessions={saved.sessions} compact />
          <div className="acoustic-note">
            <span className="tiny-piano">♮</span>
            <div>
              Your piano. Your pace.<small>Made for acoustic playing.</small>
            </div>
          </div>
          <span className="sidebar-version">A small space to make music.</span>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-toggle icon-button"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label={mobileMenu ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileMenu}
            >
              {mobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>
            <span>Your piano companion</span>
            <span className="breadcrumb-divider">/</span>
            <span>{navItems.find((n) => n.id === page)?.label}</span>
          </div>
          <div className="private-label">
            <span /> Just you and the keys
          </div>
        </header>
        {storageError && (
          <div className="notice" role="alert">
            Your browser cannot save progress. Practice still works, but your notes may not stay
            after you close this page. Try allowing site storage.
          </div>
        )}
        {audioError && (
          <div className="notice" role="alert">
            {audioError} <button onClick={() => void unlockAudio()}>Try sound again</button>
          </div>
        )}
        <main id="main" tabIndex={-1}>
          {page === 'today' && (
            <>
              <section className="page-heading">
                <div>
                  <div className="eyebrow">
                    <span className="small-line" /> MAKE ROOM FOR YOUR MUSIC
                  </div>
                  <h1>
                    You know the keys.
                    <br />
                    Now find <em>your voice.</em>
                  </h1>
                  <p>No score to follow. No perfect take. Just a little time at the piano.</p>
                </div>
                <span className="date-label">
                  {new Date().toLocaleDateString('en', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </section>
              <section className="hero-card" aria-labelledby="mission-title">
                <div className="hero-copy">
                  <div className="hero-kicker">
                    <span className="pill light">
                      <Leaf size={13} /> YOUR NEXT LITTLE STEP
                    </span>
                    <span className="mission-count">{recommended.number} / 06</span>
                  </div>
                  <h2 id="mission-title">{recommended.title}</h2>
                  <p>{recommended.description}</p>
                  <div className="hero-meta">
                    <span>
                      <Clock3 size={15} /> {saved.duration} minutes
                    </span>
                    <span className="meta-dot" />
                    <span>{recommended.skill}</span>
                  </div>
                  <div className="hero-actions">
                    <button className="button primary" onClick={() => startSession()}>
                      Let’s play <ArrowRight size={18} />
                    </button>
                    <button className="text-button" onClick={() => startSession(recommended.id, 2)}>
                      Just 2 minutes <ArrowUpRight size={15} />
                    </button>
                  </div>
                  <div className="hero-style">
                    <span>Make it feel like you</span>
                    <StyleSwitch value={saved.style} onChange={changeStyle} />
                  </div>
                </div>
                <PianoArtwork />
                <span className="hero-caption">A few notes can be enough.</span>
              </section>

              <section className="today-lower">
                <div className="journey-panel">
                  <div className="section-title">
                    <div>
                      <div className="eyebrow">LESS THINKING, MORE PLAYING</div>
                      <h2>A small ritual. A new possibility.</h2>
                    </div>
                  </div>
                  <div className="ritual">
                    {[
                      {
                        icon: Headphones,
                        title: 'Hear an idea',
                        text: 'A short example to get you started.',
                      },
                      {
                        icon: Music2,
                        title: 'Make it yours',
                        text: 'Copy, change, and follow your ears.',
                      },
                      {
                        icon: BookOpen,
                        title: 'Keep a little',
                        text: 'Notice an idea you want to revisit.',
                      },
                    ].map(({ icon: Icon, title, text }, i) => (
                      <div className="ritual-step" key={title}>
                        <span className="ritual-icon">
                          <Icon size={19} />
                        </span>
                        <span className="ritual-number">0{i + 1}</span>
                        <h3>{title}</h3>
                        <p>{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="permission-card">
                  <span className="eyebrow">
                    <Coffee size={15} /> A FRIENDLY REMINDER
                  </span>
                  <blockquote>
                    “You don’t need more notes. <br />
                    You need a little room <br />
                    to play.”
                  </blockquote>
                  <p>
                    Eight minutes is a good start. <br />
                    Two minutes counts, too.
                  </p>
                </div>
              </section>
              <section className="browse-strip">
                <div>
                  <span className="browse-icon">
                    <Sparkles size={20} />
                  </span>
                  <div>
                    <h3>Not in the mood for a lesson?</h3>
                    <p>Pick a sound. See where it takes you.</p>
                  </div>
                </div>
                <button className="text-button" onClick={() => goTo('explore')}>
                  Explore freely <ArrowRight size={17} />
                </button>
              </section>
              <footer className="page-footer">
                <span>
                  <span className="footer-dot" /> No microphone. No scores. No rush.
                </span>
                <span>
                  {weekCount > 0
                    ? `${weekCount} practice ${weekCount === 1 ? 'day' : 'days'} this week. Nice to have you here.`
                    : 'A fresh start, whenever you need one.'}
                </span>
              </footer>
            </>
          )}

          {page === 'practice' && !session && (
            <>
              <section className="page-heading compact-heading">
                <div>
                  <div className="eyebrow">
                    <span className="small-line" /> YOUR PRACTICE ROOM
                  </div>
                  <h1>
                    Small steps.
                    <br />
                    <em>Real music.</em>
                  </h1>
                  <p>One idea at a time. Repeat anything. Skip nothing you enjoy.</p>
                </div>
                <StyleSwitch value={saved.style} onChange={changeStyle} />
              </section>
              <div className="library-toolbar">
                <span>Six musical skills · two ways to explore each</span>
                <div className="duration-picker" role="group" aria-label="Session length">
                  {([2, 8] as Duration[]).map((d) => (
                    <button
                      key={d}
                      className={saved.duration === d ? 'selected' : ''}
                      aria-pressed={saved.duration === d}
                      onClick={() => changeDuration(d)}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>
              <div className="mission-grid">
                {missions.map((m) => (
                  <article
                    className={`mission-card ${completedIds.has(m.id) ? 'completed' : ''}`}
                    key={m.id}
                  >
                    <div className="mission-card-top">
                      <span className="mission-number">{m.number}</span>
                      {completedIds.has(m.id) ? (
                        <span className="completed-label">
                          <Check size={13} /> Visited
                        </span>
                      ) : (
                        <span className="skill-label">{m.skill}</span>
                      )}
                    </div>
                    <h2>{m.title}</h2>
                    <p>{m.description}</p>
                    <Notes notes={m.notes[saved.style].slice(0, 5)} />
                    <button className="text-button" onClick={() => startSession(m.id)}>
                      Play this mission <ArrowRight size={16} />
                    </button>
                  </article>
                ))}
              </div>
              <div className="quiet-tip">
                <Lightbulb size={17} />
                <p>Knowing how to read music is a strength. Here, give your ears a turn to lead.</p>
              </div>
            </>
          )}

          {page === 'practice' && session && !session.done && (
            <>
              <section className="session-heading">
                <div>
                  <button
                    className="back-link"
                    onClick={() => {
                      setSession((previous) => (previous ? { ...previous, running: false } : null));
                      stopSound();
                      setPendingPage('practice');
                    }}
                  >
                    <ArrowLeft size={14} /> All missions
                  </button>
                  <h1>{mission.title}</h1>
                  <p>
                    {sessionStyle === 'classical' ? 'Classical' : 'Jazz'} · {session.duration}
                    -minute session · {mission.skill}
                  </p>
                </div>
                <div className="session-time">
                  <Clock3 size={17} />
                  <span>{formatTime(session.duration * 60 - session.elapsed)}</span>
                  <small>remaining</small>
                </div>
              </section>
              <div className="stage-track" aria-label="Session steps">
                {stages.map((s, i) => (
                  <div
                    className={`stage-item ${i === stage.index ? 'current' : ''} ${i < stage.index ? 'past' : ''}`}
                    key={s.id}
                    aria-current={i === stage.index ? 'step' : undefined}
                  >
                    <span>{i < stage.index ? <Check size={14} /> : `0${i + 1}`}</span>
                    <span>{s.short}</span>
                    <div className="stage-line">
                      <i
                        style={{
                          width:
                            i < stage.index
                              ? '100%'
                              : i === stage.index
                                ? `${100 * (1 - stage.remaining / stageLengths(session.duration)[stage.index])}%`
                                : '0%',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <section className="practice-card">
                <div className="practice-card-top">
                  <span className="eyebrow">STEP {stage.index + 1} OF 5</span>
                  <span className="stage-time">{formatTime(stage.remaining)} in this step</span>
                </div>
                <div className="practice-focus-icon">
                  {stage.index === 0 ? (
                    <Headphones size={28} />
                  ) : stage.index === 4 ? (
                    <BookOpen size={28} />
                  ) : (
                    <Music2 size={28} />
                  )}
                </div>
                <h2 aria-live="polite">{currentStage.label}</h2>
                <p className="practice-instruction">
                  {mission.prompts[sessionStyle][currentStage.id]}
                </p>
                {currentStage.id !== 'reflect' ? (
                  <>
                    <div className="suggested-notes">
                      <span className="eyebrow">YOUR NOTE PALETTE</span>
                      <button className="subtle-button" onClick={() => setHints(!hints)}>
                        {hints ? 'Hide hints' : 'Show hints'}
                      </button>
                    </div>
                    <Notes notes={mission.notes[sessionStyle]} hidden={!hints} />
                    <button
                      className={`button demo-button ${demoPlaying ? 'playing' : ''}`}
                      onClick={() => void playDemo()}
                    >
                      {demoPlaying ? <Square size={15} /> : <Play size={15} fill="currentColor" />}
                      {demoPlaying ? 'Stop example' : 'Hear the example'}
                    </button>
                  </>
                ) : (
                  <label className="reflection-field">
                    One idea to take with you <span>(optional)</span>
                    <textarea
                      maxLength={1000}
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="A phrase, a feeling, something to try again…"
                    />
                  </label>
                )}
                <div className="practice-tip">
                  <Leaf size={15} />
                  <span>{mission.tip}</span>
                </div>
              </section>
              <div className="session-controls">
                <button
                  className="text-button"
                  onClick={previousStage}
                  disabled={stage.index === 0}
                >
                  <ArrowLeft size={16} /> Previous
                </button>
                <button className="button primary" onClick={toggleSession}>
                  {session.running ? <Pause size={17} /> : <Play size={17} />}{' '}
                  {session.running ? 'Pause session' : 'Resume session'}
                </button>
                <button className="text-button" onClick={nextStage}>
                  {stage.index === 4 ? 'Finish session' : 'Next step'}
                  <ArrowRight size={16} />
                </button>
              </div>
              {!session.running && (
                <div className="paused-note" role="status">
                  Paused. Take your time. Sound and timer will resume when you are ready.
                </div>
              )}
              <SoundControls
                backing={backing}
                setBacking={setBacking}
                tempo={tempo}
                setTempo={setTempo}
                volume={volume}
                setVolume={setVolume}
                beat={beat}
                chord={currentChord}
                playing={audioActive && backing && !demoPlaying}
              />
              <p className="audio-footnote">
                Built-in piano-style synth · no microphone or note detection · pauses when you leave
                this tab
              </p>
            </>
          )}

          {page === 'practice' && session?.done && (
            <section className="completion">
              <div className="completion-mark">
                {isSaved ? <Check size={32} /> : <Leaf size={32} />}
              </div>
              <div className="eyebrow">A LITTLE TIME, WELL SPENT</div>
              <h1>{isSaved ? 'A little progress, kept.' : 'That was your music.'}</h1>
              <p>You made room to play. Take one small idea with you.</p>
              <div className="completion-meta">
                <span>{mission.title}</span>
                <span>·</span>
                <span>{session.style === 'classical' ? 'Classical' : 'Jazz'}</span>
                <span>·</span>
                <span>{formatTime(session.seconds)} practiced</span>
              </div>
              {!isSaved ? (
                <div className="reflection-card">
                  <fieldset>
                    <legend>How did that feel?</legend>
                    <div className="difficulty-options">
                      {(
                        [
                          { id: 'hard', label: 'A little hard' },
                          { id: 'right', label: 'About right' },
                          { id: 'easy', label: 'Ready for more' },
                        ] as { id: Difficulty; label: string }[]
                      ).map((option) => (
                        <button
                          key={option.id}
                          aria-pressed={difficulty === option.id}
                          className={difficulty === option.id ? 'selected' : ''}
                          onClick={() => setDifficulty(option.id)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <label className="reflection-field">
                    Something worth remembering <span>(optional)</span>
                    <textarea
                      maxLength={1000}
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="I liked the phrase where…"
                    />
                  </label>
                  <p className="save-note">
                    {difficulty === 'hard'
                      ? 'We will suggest this mission again. You can use fewer notes or a slower tempo.'
                      : 'Your note and practice time stay in this browser.'}
                  </p>
                  <button className="button primary" onClick={saveSession}>
                    Save my session <Check size={17} />
                  </button>
                </div>
              ) : (
                <div className="saved-actions">
                  <p role="status">
                    {storageError
                      ? 'Kept for this visit. Browser storage is not available.'
                      : 'Saved on this device. No perfect take required.'}
                  </p>
                  <button className="button primary" onClick={() => goTo('progress')}>
                    See my practice <ArrowRight size={17} />
                  </button>
                  <button
                    className="text-button"
                    onClick={() => {
                      setSession(null);
                      goTo('today');
                    }}
                  >
                    Back to today
                  </button>
                </div>
              )}
            </section>
          )}

          {page === 'explore' && (
            <>
              <section className="page-heading compact-heading">
                <div>
                  <div className="eyebrow">
                    <span className="small-line" /> NO LESSON. JUST POSSIBILITY.
                  </div>
                  <h1>
                    Where will the
                    <br />
                    <em>music take you?</em>
                  </h1>
                  <p>Choose a setting. Find a few notes. Stay as long as you like.</p>
                </div>
                <span className="open-play-label">
                  <Leaf size={15} /> No timer here
                </span>
              </section>
              <div className="settings-grid">
                {settings.map((s) => (
                  <button
                    key={s.id}
                    className={`setting-card ${s.color} ${exploreId === s.id ? 'selected' : ''}`}
                    aria-pressed={exploreId === s.id}
                    onClick={() => {
                      setExploreId(s.id);
                      setTempo(s.tempo);
                      setPromptIndex(-1);
                      setCurrentChord(s.harmony[0].name);
                    }}
                  >
                    <span className="setting-art" aria-hidden="true">
                      {s.id === 'evening' ? (
                        <span className="moon-art" />
                      ) : s.id === 'prelude' ? (
                        <span className="wave-art">
                          <i />
                          <i />
                          <i />
                          <i />
                          <i />
                        </span>
                      ) : (
                        <span className="jazz-art">
                          <i />
                          <i />
                          <i />
                        </span>
                      )}
                    </span>
                    <span className="setting-style">
                      {s.style === 'classical' ? 'Classical' : 'Jazz'} · {s.tempo} bpm
                    </span>
                    <h2>{s.name}</h2>
                    <p>{s.subtitle}</p>
                    <span className="setting-select">
                      {exploreId === s.id ? (
                        <>
                          <Check size={15} /> Your setting
                        </>
                      ) : (
                        <>
                          Choose this setting <ArrowUpRight size={15} />
                        </>
                      )}
                    </span>
                  </button>
                ))}
              </div>
              <section className="explore-room">
                <div className="explore-room-top">
                  <div>
                    <div className="eyebrow">YOUR STARTING POINT</div>
                    <h2>{setting.name}</h2>
                  </div>
                  <button
                    className="button primary"
                    onClick={() => {
                      if (exploring) stopSound();
                      else {
                        setBacking(true);
                        void unlockAudio();
                      }
                      setExploring(!exploring);
                    }}
                  >
                    {exploring ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
                    {exploring ? 'Pause backing' : 'Play backing'}
                  </button>
                </div>
                <Notes notes={setting.notes} />
                <p className="palette-note">
                  A starting palette, not a rule. Listen to how each note feels over the chords.
                </p>
                <div className="idea-prompt">
                  <Lightbulb size={20} />
                  <p aria-live="polite">
                    {promptIndex < 0
                      ? 'Start with a short idea. Repeat it, then change one thing.'
                      : explorePrompts[promptIndex]}
                  </p>
                  <button
                    className="text-button"
                    onClick={() =>
                      setPromptIndex((previous) => (previous + 1) % explorePrompts.length)
                    }
                  >
                    Give me an idea <RotateCcw size={15} />
                  </button>
                </div>
              </section>
              <SoundControls
                backing={backing}
                setBacking={setBacking}
                tempo={tempo}
                setTempo={setTempo}
                volume={volume}
                setVolume={setVolume}
                beat={beat}
                chord={currentChord}
                playing={exploring && backing}
              />
              <p className="audio-footnote">
                Free play is not timed or added to your practice history. Enjoy the space.
              </p>
            </>
          )}

          {page === 'progress' && (
            <>
              <section className="page-heading compact-heading">
                <div>
                  <div className="eyebrow">
                    <span className="small-line" /> LITTLE MOMENTS ADD UP
                  </div>
                  <h1>
                    A practice that
                    <br />
                    feels <em>like you.</em>
                  </h1>
                  <p>Not a scorecard. A record of showing up and making something.</p>
                </div>
                <span className="local-label">
                  <span /> Saved on this device
                </span>
              </section>
              <div className="progress-overview">
                <Week sessions={saved.sessions} />
                <div className="stat-card">
                  <span className="eyebrow">ROOM YOU MADE</span>
                  <strong>
                    {totalMinutes}
                    <small>min</small>
                  </strong>
                  <p>at the piano</p>
                </div>
                <div className="stat-card">
                  <span className="eyebrow">LITTLE MOMENTS</span>
                  <strong>
                    {saved.sessions.length}
                    <small>sessions</small>
                  </strong>
                  <p>each one counts</p>
                </div>
              </div>
              <div className="section-title history-heading">
                <div>
                  <div className="eyebrow">YOUR PRACTICE NOTEBOOK</div>
                  <h2>Ideas worth coming back to.</h2>
                </div>
                <BookOpen size={21} />
              </div>
              {!saved.sessions.length ? (
                <EmptyState onStart={() => startSession()} />
              ) : (
                <div className="history-list">
                  {saved.sessions.map((record) => {
                    const m = missions.find((m) => m.id === record.missionId)!;
                    return (
                      <article className="history-card" key={record.id}>
                        <div className="history-icon">
                          <Music2 size={21} />
                        </div>
                        <div className="history-content">
                          <div className="history-meta">
                            {new Date(record.finishedAt).toLocaleDateString('en', {
                              month: 'short',
                              day: 'numeric',
                            })}
                            <span>·</span>
                            {record.style === 'classical' ? 'Classical' : 'Jazz'}
                            <span>·</span>
                            {formatTime(record.seconds)} practiced
                          </div>
                          <h3>{m.title}</h3>
                          {record.reflection ? (
                            <p className="saved-reflection">“{record.reflection}”</p>
                          ) : (
                            <p>You made room to play.</p>
                          )}
                          {record.difficulty && (
                            <span className="feeling-label">
                              {record.difficulty === 'hard'
                                ? 'A little hard · worth another visit'
                                : record.difficulty === 'easy'
                                  ? 'Ready for more'
                                  : 'About right'}
                            </span>
                          )}
                        </div>
                        <button
                          className="icon-button revisit-button"
                          aria-label={`Revisit ${m.title} in ${record.style}`}
                          onClick={() => {
                            changeStyle(record.style);
                            startSession(record.missionId, saved.duration, record.style);
                          }}
                        >
                          <ArrowUpRight size={19} />
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
              <div className="quiet-tip">
                <Leaf size={17} />
                <p>There is no streak to break. Your next session is always a fresh start.</p>
              </div>
            </>
          )}
        </main>
      </div>
      <dialog
        ref={dialogRef}
        className="leave-dialog"
        onCancel={(event) => {
          event.preventDefault();
          setPendingPage(null);
        }}
      >
        <div className="dialog-icon">
          <Pause size={24} />
        </div>
        <h2>Leave this session?</h2>
        <p>
          Your session is paused. If you leave now, this session and its note will not be saved.
          Earlier sessions are safe.
        </p>
        <div className="dialog-actions">
          <button className="button secondary" onClick={() => setPendingPage(null)}>
            Keep practicing
          </button>
          <button
            className="button primary"
            onClick={() => {
              const target = pendingPage!;
              stopSound();
              setSession(null);
              if (target === 'explore') setTempo(setting.tempo);
              setPage(target);
              setPendingPage(null);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          >
            Leave session
          </button>
        </div>
      </dialog>
    </div>
  );
}

function SoundControls({
  backing,
  setBacking,
  tempo,
  setTempo,
  volume,
  setVolume,
  beat,
  chord,
  playing,
}: {
  backing: boolean;
  setBacking: (value: boolean) => void;
  tempo: number;
  setTempo: (value: number) => void;
  volume: number;
  setVolume: (value: number) => void;
  beat: number;
  chord: string;
  playing: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section className="sound-controls" aria-label="Accompaniment controls">
      <div className="sound-main">
        <button
          className={`sound-toggle ${backing ? 'on' : ''}`}
          aria-pressed={backing}
          onClick={() => setBacking(!backing)}
        >
          {backing ? <Volume2 size={18} /> : <VolumeX size={18} />}
          <span>
            Accompaniment <small>{backing ? 'on' : 'off'}</small>
          </span>
        </button>
        <div
          className="chord-pulse"
          aria-label={playing ? `Current chord ${chord}` : 'Accompaniment stopped'}
        >
          <span className="chord-name">{playing ? chord : '—'}</span>
          <div className="beat-dots" aria-hidden="true">
            {[0, 1, 2, 3].map((b) => (
              <i key={b} className={playing && beat === b ? 'lit' : ''} />
            ))}
          </div>
        </div>
        <button
          className="sound-settings"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          <SlidersHorizontal size={16} />
          <span>{tempo} bpm</span>
          <ChevronRight size={15} className={expanded ? 'rotated' : ''} />
        </button>
      </div>
      {expanded && (
        <div className="sound-sliders">
          <label>
            <span>
              Tempo <strong>{tempo} bpm</strong>
            </span>
            <input
              aria-label="Tempo"
              type="range"
              min="48"
              max="120"
              step="2"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
            />
          </label>
          <label>
            <span>
              Volume <strong>{Math.round(volume * 100)}%</strong>
            </span>
            <input
              aria-label="Volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </label>
          <p>Keep the backing quiet enough to hear your own piano.</p>
        </div>
      )}
    </section>
  );
}
