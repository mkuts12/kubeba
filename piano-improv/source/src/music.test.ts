import { describe, expect, it } from 'vitest';
import { formatTime, missions, settings, stageAt, stageLengths, stages } from './music';

describe('session structure', () => {
  it.each([2, 8] as const)('has exactly %i minutes of practice steps', (duration) => {
    expect(stageLengths(duration).reduce((sum, seconds) => sum + seconds, 0)).toBe(duration * 60);
    expect(stageLengths(duration)).toHaveLength(stages.length);
  });
  it('moves to the next step at the exact boundary', () => {
    expect(stageAt(14.9, 2).index).toBe(0);
    expect(stageAt(15, 2)).toEqual({ index: 1, remaining: 20, start: 15 });
    expect(stageAt(35, 2).index).toBe(2);
    expect(stageAt(65, 2).index).toBe(3);
    expect(stageAt(110, 2).index).toBe(4);
  });
  it('keeps the final step at completion', () => {
    expect(stageAt(120, 2)).toEqual({ index: 4, remaining: 0, start: 110 });
    expect(stageAt(600, 8).remaining).toBe(0);
  });
  it.each([
    [0, '0:00'],
    [1.2, '0:02'],
    [60, '1:00'],
    [479.9, '8:00'],
    [-3, '0:00'],
  ])('formats %i seconds', (seconds, formatted) => {
    expect(formatTime(seconds as number)).toBe(formatted);
  });
});

describe('curriculum', () => {
  it('has six unique missions', () => {
    expect(missions).toHaveLength(6);
    expect(new Set(missions.map((m) => m.id)).size).toBe(missions.length);
  });
  it.each(missions)('$title has a complete classical and jazz version', (mission) => {
    for (const style of ['classical', 'jazz'] as const) {
      expect(mission.notes[style].length).toBeGreaterThanOrEqual(3);
      for (const stage of stages)
        expect(mission.prompts[style][stage.id].length).toBeGreaterThan(20);
      expect(mission.harmony[style].length).toBeGreaterThan(0);
      for (const note of mission.demo[style]) {
        expect(note.midi).toBeGreaterThanOrEqual(21);
        expect(note.midi).toBeLessThanOrEqual(108);
        expect(note.beat).toBeGreaterThanOrEqual(0);
        expect(note.length).toBeGreaterThan(0);
      }
    }
  });
  it('uses a 12-bar form for the blues mission and setting', () => {
    expect(missions[5].harmony.jazz).toHaveLength(12);
    expect(settings.find((s) => s.id === 'blue')!.harmony).toHaveLength(12);
  });
});
