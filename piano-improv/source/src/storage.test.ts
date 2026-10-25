import { describe, expect, it } from 'vitest';
import {
  initialState,
  localDateKey,
  parseState,
  practiceDays,
  recommendedMission,
  weekDates,
  type SessionRecord,
} from './storage';
import { missions, missionsFor } from './music';

const record: SessionRecord = {
  id: 'test',
  missionId: missions[0].id,
  style: 'classical',
  duration: 2,
  seconds: 120,
  finishedAt: '2026-10-25T12:00:00.000Z',
  reflection: 'A phrase I liked.',
  difficulty: 'right',
};

describe('saved progress', () => {
  it.each([null, '', '{broken', '[]', '{"version":2}'])(
    'handles missing or invalid storage: %s',
    (raw) => {
      expect(parseState(raw)).toEqual(initialState);
    },
  );
  it('round-trips valid state', () => {
    const state = { ...initialState, sessions: [record] };
    expect(parseState(JSON.stringify(state))).toEqual(state);
  });
  it('filters invalid session records without losing valid ones', () => {
    const raw = JSON.stringify({
      version: 1,
      style: 'jazz',
      duration: 2,
      sessions: [
        record,
        null,
        { ...record, seconds: -1 },
        { ...record, finishedAt: 'not-a-date' },
        { ...record, missionId: 'unknown' },
      ],
    });
    expect(parseState(raw)).toEqual({ version: 1, style: 'jazz', duration: 2, sessions: [record] });
  });
  it('bounds stored history', () => {
    expect(
      parseState(JSON.stringify({ version: 1, sessions: Array(550).fill(record) })).sessions,
    ).toHaveLength(500);
  });
  it('falls back on invalid preferences', () => {
    expect(parseState('{"version":1,"style":"unknown","duration":999}')).toEqual(initialState);
  });
});

describe('practice calendar', () => {
  it('starts the week on Monday, including when today is Sunday', () => {
    const dates = weekDates(new Date(2026, 9, 25));
    expect(dates).toHaveLength(7);
    expect(localDateKey(dates[0])).toBe('2026-10-19');
    expect(localDateKey(dates[6])).toBe('2026-10-25');
  });
  it('handles month and year boundaries', () => {
    const dates = weekDates(new Date(2027, 0, 1));
    expect(localDateKey(dates[0])).toBe('2026-12-28');
    expect(localDateKey(dates[6])).toBe('2027-01-03');
  });
  it('counts multiple sessions on the same day once', () => {
    expect(practiceDays([record, { ...record, id: 'second' }]).size).toBe(1);
  });
});

describe('mission recommendation', () => {
  it('does not recommend jazz-only blues studies in classical mode', () => {
    const completed = missionsFor('classical').map((m) => ({ ...record, missionId: m.id }));
    expect(recommendedMission(completed, 'classical')).toEqual(missions[0]);
  });
  it('can retain source-based progress alongside older foundation history', () => {
    const newer = {
      ...record,
      id: 'source-session',
      missionId: 'ode-answer',
      difficulty: 'hard' as const,
    };
    const state = parseState(JSON.stringify({ ...initialState, sessions: [newer, record] }));
    expect(state.sessions).toEqual([newer, record]);
    expect(recommendedMission(state.sessions, 'classical').id).toBe('ode-answer');
  });
  it('starts with the first mission', () => {
    expect(recommendedMission([], 'classical')).toEqual(missions[0]);
  });
  it('moves to an unvisited mission in the selected style', () => {
    expect(recommendedMission([record], 'classical')).toEqual(missions[1]);
    expect(recommendedMission([record], 'jazz')).toEqual(missions[0]);
  });
  it('suggests repetition if the last mission was difficult', () => {
    expect(recommendedMission([{ ...record, difficulty: 'hard' }], 'classical')).toEqual(
      missions[0],
    );
  });
  it('offers a fresh first mission after all six have been visited', () => {
    expect(
      recommendedMission(
        missions.map((m) => ({ ...record, missionId: m.id })),
        'classical',
      ),
    ).toEqual(missions[0]);
  });
});
