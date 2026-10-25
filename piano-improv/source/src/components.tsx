import { ArrowUpRight, Check, Music2 } from 'lucide-react';
import { localDateKey, practiceDays, weekDates, type SessionRecord } from './storage';
import type { Style } from './music';

export function StyleSwitch({
  value,
  onChange,
}: {
  value: Style;
  onChange: (style: Style) => void;
}) {
  return (
    <div className="segmented" aria-label="Musical style" role="group">
      {(['classical', 'jazz'] as Style[]).map((style) => (
        <button
          key={style}
          aria-pressed={value === style}
          className={value === style ? 'selected' : ''}
          onClick={() => onChange(style)}
        >
          {style === 'classical' ? 'Classical' : 'Jazz'}
        </button>
      ))}
    </div>
  );
}

export function Week({
  sessions,
  compact = false,
}: {
  sessions: SessionRecord[];
  compact?: boolean;
}) {
  const dates = weekDates();
  const days = practiceDays(sessions);
  const today = localDateKey(new Date());
  const count = dates.filter((date) => days.has(localDateKey(date))).length;
  return (
    <div className={`week-card ${compact ? 'compact' : ''}`}>
      <div className="week-top">
        <span className="eyebrow">A little, often</span>
        <span>
          <strong>{count}</strong> / 3 days
        </span>
      </div>
      <div className="week-days">
        {dates.map((date) => {
          const key = localDateKey(date);
          const done = days.has(key);
          return (
            <div
              key={key}
              className={`week-day ${key === today ? 'today' : ''}`}
              aria-label={`${date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}${done ? ', practiced' : ''}${key === today ? ', today' : ''}`}
            >
              <span>{date.toLocaleDateString('en', { weekday: 'narrow' })}</span>
              <div className={done ? 'day-circle done' : 'day-circle'}>
                {done ? (
                  <Check size={14} strokeWidth={2.5} />
                ) : key === today ? (
                  <span className="day-dot" />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {!compact && <p>Small sessions count. Miss a day? Just come back.</p>}
    </div>
  );
}

export function PianoArtwork({ small = false }: { small?: boolean }) {
  return (
    <div className={`piano-art ${small ? 'small-art' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 500 380" fill="none">
        <defs>
          <linearGradient
            id={small ? 'wood-small' : 'wood'}
            x1="100"
            y1="0"
            x2="430"
            y2="360"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#466051" />
            <stop offset="1" stopColor="#1f332a" />
          </linearGradient>
          <linearGradient
            id={small ? 'key-small' : 'key'}
            x1="0"
            y1="130"
            x2="0"
            y2="290"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#f8f3df" />
            <stop offset="1" stopColor="#d8d5bd" />
          </linearGradient>
          <filter
            id={small ? 'shadow-small' : 'shadow'}
            x="-30%"
            y="-30%"
            width="170%"
            height="180%"
          >
            <feDropShadow dx="0" dy="18" stdDeviation="15" floodOpacity="0.13" />
          </filter>
        </defs>
        <circle cx="286" cy="160" r="141" stroke="#8d9e83" strokeOpacity=".23" />
        <circle cx="286" cy="160" r="113" stroke="#8d9e83" strokeOpacity=".18" />
        <path
          d="M44 283c99-30 211-18 339 24"
          stroke="#758772"
          strokeOpacity=".25"
          strokeWidth="1.5"
        />
        <g
          transform="translate(36 35) rotate(-17 220 160)"
          filter={`url(#${small ? 'shadow-small' : 'shadow'})`}
        >
          <path
            d="M90 130V64c0-13 9-23 23-23h229c13 0 23 10 23 23v166H90V130Z"
            fill={`url(#${small ? 'wood-small' : 'wood'})`}
          />
          <rect x="103" y="57" width="249" height="96" rx="3" fill="#253c30" />
          <path d="M111 65h233v80H111z" stroke="#809077" strokeOpacity=".3" />
          <path d="M89 157h277l16 89H73l16-89Z" fill="#21382c" />
          {Array.from({ length: 14 }, (_, i) => (
            <path
              key={i}
              d={`M${96 + i * 18.6} 163h17l6 69h-19z`}
              fill={`url(#${small ? 'key-small' : 'key'})`}
              stroke="#b9bba3"
              strokeWidth=".7"
            />
          ))}
          {[0, 1, 3, 4, 5, 7, 8, 10, 11, 12].map((i) => (
            <path
              key={i}
              d={`M${108 + i * 18.6} 162h11l3 42h-12z`}
              fill="#20342b"
              stroke="#101f18"
              strokeWidth="1"
            />
          ))}
          <path d="M73 240h309v17H73z" fill="#344e3f" />
          <path d="M89 257h15l-6 55H86l3-55Zm262 0h15l3 55h-12l-6-55Z" fill="#2a4134" />
          <rect x="198" y="93" width="62" height="4" rx="2" fill="#b6b596" fillOpacity=".55" />
          <path
            d="M203 257v16m20-16v16m20-16v16"
            stroke="#b8b498"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
        <path d="M421 77v27m0-22 16-4v22" stroke="#6e816b" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="417" cy="105" rx="5" ry="3.5" transform="rotate(-20 417 105)" fill="#6e816b" />
        <ellipse cx="433" cy="101" rx="5" ry="3.5" transform="rotate(-20 433 101)" fill="#6e816b" />
        <path d="m71 124 4-8 4 8 8 4-8 4-4 8-4-8-8-4 8-4Z" fill="#a4ad8b" />
        <circle cx="398" cy="289" r="3" fill="#a4ad8b" />
      </svg>
    </div>
  );
}

export function Notes({ notes, hidden = false }: { notes: string[]; hidden?: boolean }) {
  return (
    <div
      className={`note-pills ${hidden ? 'notes-hidden' : ''}`}
      aria-label={hidden ? 'Note hints are hidden' : `Suggested notes: ${notes.join(', ')}`}
    >
      {hidden ? (
        <span className="hint-copy">Trust your ears. The hints are here if you need them.</span>
      ) : (
        notes.map((note) => (
          <span className="note-pill" key={note}>
            {note}
          </span>
        ))
      )}
    </div>
  );
}

export function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Music2 size={26} />
      </div>
      <h2>Your music starts with a moment.</h2>
      <p>Finish a session to save a note, see your practice, and find ideas worth returning to.</p>
      <button className="button primary" onClick={onStart}>
        Try your first session <ArrowUpRight size={17} />
      </button>
    </div>
  );
}
