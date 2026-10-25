import { useEffect, useRef, useState } from 'react';
import type { MusicalExample } from './music';
import { pitchName, scoreMeasures } from './score-model';

export default function Notation({ example }: { example: MusicalExample }) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const target = container.current!;
    target.replaceChildren();
    void (async () => {
      try {
        // Notation is optional. Keep the engraving library out of the first load.
        const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, Dot } =
          await import('vexflow/bravura');
        await Promise.all([
          document.fonts.load('16px Bravura'),
          document.fonts.load('16px Academico'),
        ]);
        if (cancelled) return;
        const bars = scoreMeasures(example);
        const widths = bars.map((bar, i) =>
          Math.max(i === 0 ? 225 : 160, bar.length * 25 + (i === 0 ? 85 : 30)),
        );
        const width = widths.reduce((a, b) => a + b, 0) + 24;
        const renderer = new Renderer(target, Renderer.Backends.SVG);
        renderer.resize(width, 160);
        const context = renderer.getContext();
        context.setFillStyle('#3a503d').setStrokeStyle('#3a503d');
        let x = 12;
        const durationKeys: Record<number, string> = {
          4: 'w',
          3: 'h',
          2: 'h',
          1.5: 'q',
          1: 'q',
          0.75: '8',
          0.5: '8',
          0.25: '16',
        };
        bars.forEach((bar, i) => {
          const stave = new Stave(x, 30, widths[i]);
          if (i === 0) stave.addClef('treble').addTimeSignature(`${example.meter}/4`);
          stave.setContext(context).draw();
          const accidentals = new Map<string, string>();
          const notes = bar.map((event) => {
            const names = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];
            const name = event.midi === null ? 'b' : names[event.midi % 12];
            const octave = event.midi === null ? 4 : Math.floor(event.midi / 12) - 1;
            const note = new StaveNote({
              keys: [`${name}/${octave}`],
              duration: `${durationKeys[event.length]}${event.midi === null ? 'r' : ''}`,
              dots: [3, 1.5, 0.75].includes(event.length) ? 1 : 0,
              autoStem: true,
            });
            if ([3, 1.5, 0.75].includes(event.length)) Dot.buildAndAttach([note], { all: true });
            if (event.midi !== null) {
              const key = `${name[0]}${octave}`;
              const accidental = name.length > 1 ? name.slice(1) : 'n';
              const previous = accidentals.get(key) ?? 'n';
              if (accidental !== previous) note.addModifier(new Accidental(accidental), 0);
              accidentals.set(key, accidental);
            }
            return note;
          });
          const voice = new Voice({ numBeats: example.meter, beatValue: 4 });
          voice.addTickables(notes);
          new Formatter().joinVoices([voice]).formatToStave([voice], stave);
          voice.draw(context, stave);
          x += widths[i];
        });
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError('Notation could not load. The audio and note names are still available.');
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      target.replaceChildren();
    };
  }, [example]);

  return (
    <div className="notation-block">
      {loading && (
        <p className="notation-status" role="status">
          Loading the notation…
        </p>
      )}
      {error && (
        <p className="notation-status" role="status">
          {error}
        </p>
      )}
      <div
        ref={container}
        className="notation-scroll"
        tabIndex={0}
        role="img"
        aria-label={`Treble-clef notation in ${example.meter}/4. ${example.caption}. Pitches: ${example.notes.map((n) => pitchName(n.midi)).join(', ')}.`}
      />
      <p className="notation-caption">
        {example.feel === 'swing' ? 'Swing eighths: written evenly, played long–short. ' : ''}C4 is
        middle C. Scroll sideways to see the full phrase.
      </p>
    </div>
  );
}
