import { describe, expect, it } from 'vitest';
import { missions, missionsFor, type MusicalExample } from './music';
import { pitchName, scoreMeasures } from './score-model';
import { performedBeat } from './audio-timing';

describe('source-based collections', () => {
  it('offers four themes in both styles and three jazz-only blues studies', () => {
    expect(missionsFor('classical', 'themes')).toHaveLength(4);
    expect(missionsFor('jazz', 'themes')).toHaveLength(4);
    expect(missionsFor('classical', 'blues')).toHaveLength(0);
    expect(missionsFor('jazz', 'blues')).toHaveLength(3);
    expect(missionsFor('classical')).toHaveLength(10);
    expect(missionsFor('jazz')).toHaveLength(13);
  });
  it('preserves all existing foundation IDs', () => {
    expect(missions.slice(0, 6).map((m) => m.id)).toEqual([
      'three-notes',
      'question-answer',
      'motif',
      'harmony',
      'left-hand',
      'miniature',
    ]);
  });
  it.each(missions.filter((m) => m.material))(
    '$title has provenance and renderable source and variation examples',
    (mission) => {
      const material = mission.material!;
      expect(material.sourceUrl).toMatch(/^https:\/\//);
      expect(material.rights.length).toBeGreaterThan(40);
      expect(material.adaptation.length).toBeGreaterThan(60);
      for (const example of [material.original, ...Object.values(material.variation)]) {
        expect(example.notes.length).toBeGreaterThan(0);
        for (const note of example.notes) {
          expect(Number.isFinite(note.beat)).toBe(true);
          expect(note.length).toBeGreaterThan(0);
        }
        const bars = scoreMeasures(example);
        bars.forEach((bar) =>
          expect(bar.reduce((sum, n) => sum + n.length, 0)).toBe(example.meter),
        );
        // Even at the slowest supported tempo, these short examples fit the listen step.
        expect((Math.max(...example.notes.map((n) => n.beat + n.length)) * 60) / 48).toBeLessThan(
          15,
        );
      }
    },
  );
  it('uses the recognizable Ode to Joy opening and changes only its final note in the classical variation', () => {
    const material = missions.find((m) => m.id === 'ode-answer')!.material!;
    expect(material.original.notes.map((n) => n.midi)).toEqual([64, 64, 65, 67, 67, 65, 64, 62]);
    expect(material.variation.classical.notes.slice(0, 7)).toEqual(
      material.original.notes.slice(0, 7),
    );
    expect(material.variation.classical.notes.at(-1)!.midi).toBe(60);
  });
  it('retains the Mozart theme and clearly identifies the new variation', () => {
    const material = missions.find((m) => m.id === 'mozart-variation')!.material!;
    expect(material.original.notes.map((n) => n.midi)).toEqual([60, 60, 67, 67, 69, 69, 67]);
    expect(material.variation.classical.caption).toContain('not a Mozart variation');
  });
  it('keeps ragtime straight and distinguishes a full blues chorus from the short example', () => {
    const joplin = missions.find((m) => m.id === 'joplin-rhythm')!;
    expect(joplin.backingFeel).toBe('straight');
    expect(joplin.material!.original.feel).toBe('straight');
    expect(joplin.material!.original.notes.map((n) => n.midi)).toEqual([74, 76, 72, 69, 71, 67]);
    const chorus = missions.find((m) => m.id === 'blues-chorus')!;
    expect(chorus.harmony.jazz).toHaveLength(12);
    expect(chorus.material!.variation.jazz.caption).toContain('not a full chorus');
  });
});

describe('score model', () => {
  it('fills beginning, middle, and ending spaces with rests', () => {
    const clip: MusicalExample = {
      meter: 4,
      caption: '',
      notes: [
        { midi: 60, beat: 0.5, length: 0.5 },
        { midi: 63, beat: 2, length: 1 },
      ],
    };
    expect(scoreMeasures(clip)).toEqual([
      [
        { midi: null, length: 0.5 },
        { midi: 60, length: 0.5 },
        { midi: null, length: 1 },
        { midi: 63, length: 1 },
        { midi: null, length: 1 },
      ],
    ]);
  });
  it('does not silently turn sustained notes into repeated notes at a bar line', () => {
    expect(() =>
      scoreMeasures({ meter: 4, caption: '', notes: [{ midi: 60, beat: 3, length: 2 }] }),
    ).toThrow('tie support');
  });
  it('uses scientific pitch notation, including flat names', () => {
    expect(pitchName(60)).toBe('C4');
    expect(pitchName(63)).toBe('E♭4');
    expect(pitchName(74)).toBe('D5');
  });
});

describe('swing playback', () => {
  it('keeps written straight time unchanged', () => {
    expect(performedBeat(1.5, 'straight')).toBe(1.5);
  });
  it('moves eighth-note offbeats to two thirds without moving the next beat', () => {
    expect(performedBeat(0.5, 'swing')).toBeCloseTo(2 / 3);
    expect(performedBeat(1, 'swing')).toBe(1);
    expect(performedBeat(3.5, 'swing')).toBeCloseTo(3 + 2 / 3);
  });
  it('preserves ordering for all subdivisions', () => {
    const beats = [0, 0.25, 0.5, 0.75, 1].map((n) => performedBeat(n, 'swing'));
    expect(beats).toEqual([...beats].sort((a, b) => a - b));
  });
});
