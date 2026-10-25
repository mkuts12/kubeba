import { useState } from 'react';
import { BookOpen, ExternalLink, Play, Square } from 'lucide-react';
import type { ExampleKind, StudyMaterial, Style } from './music';
import Notation from './Notation';

export default function StudyPanel({
  material,
  style,
  playing,
  onPlay,
}: {
  material: StudyMaterial;
  style: Style;
  playing: ExampleKind | null;
  onPlay: (kind: ExampleKind) => void;
}) {
  const [showNotation, setShowNotation] = useState(false);
  const [selected, setSelected] = useState<ExampleKind>('original');
  const example = selected === 'original' ? material.original : material.variation[style];
  const sourceLabel = material.kind === 'study' ? 'Starting riff' : 'Source phrase';
  return (
    <section className="study-panel" aria-label="Musical source and variation">
      <div className="study-heading">
        <span className="eyebrow">
          {material.kind === 'study'
            ? 'FIRST BLUES · ORIGINAL STUDY'
            : 'THEME & VARIATIONS · PUBLIC-DOMAIN MUSIC'}
        </span>
        <h3>{material.title}</h3>
        <p>{material.composer}</p>
      </div>
      <div className="example-options">
        {(['original', 'variation'] as ExampleKind[]).map((kind) => (
          <button
            className={`button demo-button ${playing === kind ? 'playing' : ''}`}
            key={kind}
            onClick={() => {
              setSelected(kind);
              onPlay(kind);
            }}
          >
            {playing === kind ? <Square size={14} /> : <Play size={14} fill="currentColor" />}
            {playing === kind
              ? `Stop ${kind === 'original' ? 'source' : 'variation'}`
              : kind === 'original'
                ? `Hear ${material.kind === 'study' ? 'starting riff' : 'source phrase'}`
                : 'Hear one variation'}
          </button>
        ))}
      </div>
      <p className="listen-for">{material.listenFor[style]}</p>
      <div className="notation-toolbar">
        <button
          className="subtle-button"
          aria-expanded={showNotation}
          onClick={() => setShowNotation(!showNotation)}
        >
          <BookOpen size={13} />
          {showNotation ? 'Hide notation' : 'Show optional notation'}
        </button>
        {showNotation && (
          <div className="score-selector" role="group" aria-label="Notation example">
            {(['original', 'variation'] as ExampleKind[]).map((kind) => (
              <button
                key={kind}
                aria-pressed={selected === kind}
                className={selected === kind ? 'selected' : ''}
                onClick={() => setSelected(kind)}
              >
                {kind === 'original' ? sourceLabel : 'Our variation'}
              </button>
            ))}
          </div>
        )}
      </div>
      {showNotation && (
        <>
          <p className="score-caption">{example.caption}</p>
          <Notation example={example} />
        </>
      )}
      <details className="source-details">
        <summary>About the source and what we changed</summary>
        <p>{material.adaptation}</p>
        <p>{material.rights}</p>
        <a href={material.sourceUrl} target="_blank" rel="noreferrer">
          {material.kind === 'study' ? 'Read about the blues form' : 'View the source edition'}
          <ExternalLink size={12} />
        </a>
        <p className="method-note">
          Lesson design: hear, copy, change, then improvise with less help. See the{' '}
          <a
            href="https://www.berklee.edu/berklee-today/summer-2011/five-levels-of-improvisation"
            target="_blank"
            rel="noreferrer"
          >
            Berklee melody-variation guide
          </a>
          . Instructions and example variations in this app are newly written, not copied lessons.
        </p>
      </details>
    </section>
  );
}
