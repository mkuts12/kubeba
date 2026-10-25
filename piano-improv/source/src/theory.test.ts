import { describe, expect, it } from 'vitest';
import { courseMissions, courseUnits, unitFor } from './course';
import { missions, missionsFor, stageForStep, stageLengths } from './music';
import { conceptFor, guidedPrompt } from './theory';

describe('teaching coverage and sequence', () => {
  it('covers every mission exactly once without changing saved mission IDs', () => {
    const ids = courseUnits.flatMap((unit) => unit.lessons);
    expect(new Set(ids).size).toBe(missions.length);
    expect([...ids].sort()).toEqual(missions.map((m) => m.id).sort());
    missions.forEach((m) => expect(unitFor(m.id)).toBeDefined());
  });
  it.each(['classical', 'jazz'] as const)(
    'offers every available lesson in the %s path',
    (style) => {
      expect(
        courseMissions(style)
          .map((m) => m.id)
          .sort(),
      ).toEqual(
        missionsFor(style)
          .map((m) => m.id)
          .sort(),
      );
    },
  );
  it('introduces chord tones before the dedicated blues tension and keeps Joplin as a later challenge', () => {
    const ids = courseMissions('jazz').map((m) => m.id);
    expect(ids.indexOf('harmony')).toBeLessThan(ids.indexOf('blues-conversation'));
    expect(ids.indexOf('left-hand')).toBeLessThan(ids.indexOf('blues-chorus'));
    expect(ids.at(-1)).toBe('joplin-rhythm');
  });
  it.each(missions)('$title has a complete concept and a gentle practice plan', (mission) => {
    for (const style of mission.styles ?? (['classical', 'jazz'] as const)) {
      const concept = conceptFor(mission, style);
      expect(concept.title.length).toBeGreaterThan(10);
      expect(concept.goal.length).toBeGreaterThan(20);
      expect(concept.explanation).toHaveLength(2);
      expect(concept.examples).toHaveLength(2);
      expect(concept.question.answers[0]).not.toBe(concept.question.answers[1]);
      expect([0, 1]).toContain(concept.question.correct);
      for (const example of concept.examples) {
        expect(example.label).toMatch(/^[AB] · /);
        expect(example.audio.notes.length).toBeGreaterThan(0);
        example.audio.notes.forEach((note) => {
          expect(Number.isFinite(note.midi)).toBe(true);
          expect(note.midi).toBeGreaterThanOrEqual(21);
          expect(note.midi).toBeLessThanOrEqual(108);
          expect(Number.isFinite(note.beat)).toBe(true);
          expect(note.beat).toBeGreaterThanOrEqual(0);
          expect(note.length).toBeGreaterThan(0);
        });
      }
      expect(guidedPrompt(concept, 'listen')).toBeNull();
      expect(guidedPrompt(concept, 'copy')).toBe(concept.try);
      expect(guidedPrompt(concept, 'change')).toBe(concept.create);
      expect(guidedPrompt(concept, 'play')).toBe(concept.transfer);
      expect(guidedPrompt(concept, 'reflect')).toBe(concept.reflect);
    }
  });
});

describe('reviewed musical comparisons', () => {
  it('does not introduce new pitch classes while teaching the first complete blues miniature', () => {
    const mission = missions.find((m) => m.id === 'miniature')!;
    const permitted = new Set([0, 3, 5, 7]);
    expect(mission.notes.jazz).toEqual(['C', 'E♭', 'F', 'G']);
    const examples = conceptFor(mission, 'jazz').examples;
    [...mission.demo.jazz, ...examples.flatMap((e) => e.audio.notes)].forEach((note) =>
      expect(permitted.has(note.midi % 12)).toBe(true),
    );
  });
  it.each(['classical', 'jazz'] as const)('isolates phrase spacing in %s', (style) => {
    const mission = missions.find((m) => m.id === 'three-notes')!;
    expect(mission.notes[style]).toEqual(['C', 'E', 'G']);
    expect(mission.harmony[style][0].name).toBe('C');
    const [a, b] = conceptFor(mission, style).examples.map((e) => e.audio.notes);
    expect(a.map((n) => [n.midi, n.length])).toEqual(b.map((n) => [n.midi, n.length]));
    expect(b[3].beat - (b[2].beat + b[2].length)).toBe(2);
  });
  it.each(['classical', 'jazz'] as const)(
    'establishes C and changes only the final note in the %s tonic comparison',
    (style) => {
      const [a, b] = conceptFor(
        missions.find((m) => m.id === 'ode-answer')!,
        style,
      ).examples.map((e) => e.audio.notes);
      expect(a.slice(0, 3).map((n) => n.midi)).toEqual([60, 64, 67]);
      expect(a.slice(0, -1)).toEqual(b.slice(0, -1));
      expect(a.at(-1)!.midi).toBe(62);
      expect(b.at(-1)!.midi).toBe(60);
      expect(a.at(-1)!.beat).toBe(b.at(-1)!.beat);
    },
  );
  it('changes only feel in the straight/swing comparison', () => {
    const [a, b] = conceptFor(
      missions.find((m) => m.id === 'blues-space')!,
      'jazz',
    ).examples.map((e) => e.audio);
    expect(a.notes).toEqual(b.notes);
    expect(a.feel).toBe('straight');
    expect(b.feel).toBe('swing');
  });
  it('keeps the melody identical while simplifying accompaniment', () => {
    const [a, b] = conceptFor(
      missions.find((m) => m.id === 'left-hand')!,
      'jazz',
    ).examples.map((e) => e.audio.notes);
    expect(a.filter((n) => n.midi >= 72)).toEqual(b.filter((n) => n.midi >= 72));
  });
});

describe('advisory step timing', () => {
  it.each([2, 8] as const)(
    'holds the chosen step after its suggested time for a %i-minute plan',
    (duration) => {
      const lengths = stageLengths(duration);
      let start = 0;
      lengths.forEach((length, index) => {
        expect(stageForStep(start + length + 30, duration, index)).toEqual({
          index,
          start,
          remaining: 0,
        });
        start += length;
      });
    },
  );
});
