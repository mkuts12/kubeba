import type { MusicalExample } from './music';

export interface ScoreEvent {
  midi: number | null;
  length: number;
}

const durations = [4, 3, 2, 1.5, 1, 0.75, 0.5, 0.25];

/** Fill the spaces with rests and split a short, single-line example into bars. */
export function scoreMeasures(example: MusicalExample): ScoreEvent[][] {
  const end = Math.max(...example.notes.map((n) => n.beat + n.length));
  const total = Math.ceil(end / example.meter) * example.meter;
  const measures: ScoreEvent[][] = Array.from({ length: total / example.meter }, () => []);
  let cursor = 0;
  function append(midi: number | null, length: number) {
    while (length > 0.001) {
      const bar = Math.floor((cursor + 0.00001) / example.meter);
      const available = Math.min(length, example.meter - (cursor % example.meter));
      const duration = durations.find((d) => d <= available + 0.001);
      if (!duration)
        throw new Error('This example contains a rhythm that is not supported by the score.');
      measures[bar].push({ midi, length: duration });
      cursor += duration;
      length -= duration;
    }
  }
  for (const note of example.notes) {
    if (note.beat < cursor - 0.001)
      throw new Error('This score supports one melody line at a time.');
    if (note.beat > cursor) append(null, note.beat - cursor);
    // The authored excerpts do not use notes tied across a bar. Do not silently
    // re-articulate one if a future lesson adds such a note.
    if ((note.beat % example.meter) + note.length > example.meter + 0.001) {
      throw new Error(
        'A note crosses a bar line. Add explicit tie support before using this excerpt.',
      );
    }
    append(note.midi, note.length);
  }
  if (cursor < total) append(null, total - cursor);
  return measures;
}

export function pitchName(midi: number): string {
  const names = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
  return `${names[midi % 12]}${Math.floor(midi / 12) - 1}`;
}
