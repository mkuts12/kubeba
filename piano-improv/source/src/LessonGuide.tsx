import { useState } from 'react';
import { ArrowRight, BookOpen, Check, Play, Square } from 'lucide-react';
import type { LessonConcept, PlaybackKind, ConceptExampleKind } from './theory';

export default function LessonGuide({
  concept,
  playing,
  onPlay,
  onStart,
  returning,
}: {
  concept: LessonConcept;
  playing: PlaybackKind | null;
  onPlay: (kind: ConceptExampleKind) => void;
  onStart: () => void;
  returning: boolean;
}) {
  const [answer, setAnswer] = useState<number | null>(null);
  return (
    <section className="lesson-guide" aria-label="Lesson concept">
      <div className="guide-kicker">
        <span className="eyebrow">
          <BookOpen size={14} /> UNTIMED CONCEPT GUIDE
        </span>
        <button className="text-button" onClick={onStart}>
          Go straight to playing <ArrowRight size={14} />
        </button>
      </div>
      <h2>{concept.title}</h2>
      <p className="guide-goal">
        <strong>Your goal</strong> {concept.goal}
      </p>
      <div className="guide-section-title">
        <span className="eyebrow">SOUND FIRST</span>
        <p>
          Compare A and B before reading the explanation. Notice a difference, then try a small
          response at the piano.
        </p>
      </div>
      <div className="concept-examples">
        {concept.examples.map((example, index) => {
          const kind: ConceptExampleKind = index === 0 ? 'concept-a' : 'concept-b';
          const letter = index === 0 ? 'A' : 'B';
          return (
            <article
              className={playing === kind ? 'concept-example playing' : 'concept-example'}
              key={kind}
            >
              <h3>{example.label}</h3>
              <p>{example.explanation}</p>
              <button
                className="button demo-button"
                onClick={() => onPlay(kind)}
                aria-label={`${playing === kind ? 'Stop' : 'Hear'} ${letter}: ${example.label.slice(4)}`}
              >
                {playing === kind ? <Square size={14} /> : <Play size={14} fill="currentColor" />}
                {playing === kind ? `Stop ${letter}` : `Hear ${letter}`}
              </button>
            </article>
          );
        })}
      </div>
      <div className="guide-explanation">
        <span className="eyebrow">NAME WHAT YOU HEARD</span>
        {concept.explanation.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="guide-remember">
        <span className="eyebrow">TAKE THIS WITH YOU</span>
        <p>{concept.remember}</p>
      </div>
      {concept.chordMap && (
        <div className="guide-chord-map" aria-label="Twelve-bar blues chord map">
          {concept.chordMap.map((chord, i) => (
            <div key={i}>
              <small>BAR {i + 1}</small>
              <strong>{chord}</strong>
            </div>
          ))}
        </div>
      )}
      <details className="concept-check">
        <summary>
          Check your understanding <span>optional · not a playing score</span>
        </summary>
        <fieldset>
          <legend>{concept.question.prompt}</legend>
          <div className="concept-answers">
            {concept.question.answers.map((option, i) => (
              <button
                key={option}
                aria-pressed={answer === i}
                className={answer === i ? 'selected' : ''}
                onClick={() => setAnswer(i)}
              >
                {answer === i && i === concept.question.correct && <Check size={14} />}
                {option}
              </button>
            ))}
          </div>
        </fieldset>
        {answer !== null && (
          <p className="concept-feedback" role="status">
            <strong>{answer === concept.question.correct ? 'Yes. ' : 'Not quite. '}</strong>
            {concept.question.explanation} You can continue either way.
          </p>
        )}
      </details>
      <div className="guide-first-task">
        <span className="eyebrow">YOUR FIRST TASK AT THE PIANO</span>
        <p>{concept.try}</p>
      </div>
      <details className="guide-plan">
        <summary>Your plan: hear → try → create → transfer</summary>
        <ol>
          <li>
            <strong>Try with a clear limit</strong>
            <p>{concept.try}</p>
          </li>
          <li>
            <strong>Create a version of your own</strong>
            <p>{concept.create}</p>
          </li>
          <li>
            <strong>Transfer with less help</strong>
            <p>{concept.transfer}</p>
          </li>
        </ol>
      </details>
      <details className="guide-references">
        <summary>Teaching references and limits</summary>
        <p>
          The order and wording were cross-checked against author guides for Create First! / Pattern
          Play, the available outline of Tim Richards’ Improvising Blues Piano, and Open Music
          Theory. This is a source-based self-review, not an endorsement or an assessment by a piano
          teacher.
        </p>
        <a
          href="https://github.com/mkuts12/kubeba/blob/main/piano-improv/source/public/PEDAGOGY_REVIEW.md"
          target="_blank"
          rel="noreferrer"
        >
          Read what was checked and what changed
        </a>
      </details>
      <div className="guide-start">
        <div>
          <p>Listen, read, and play at your own pace.</p>
          <small>
            The check is optional. Practice times are suggestions; only you choose when to move to
            the next step.
          </small>
        </div>
        <button className="button primary" onClick={onStart}>
          {returning ? 'Return to practice' : 'Start practice'}
          <ArrowRight size={17} />
        </button>
      </div>
    </section>
  );
}
