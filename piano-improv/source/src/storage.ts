import { missions, type Difficulty, type Duration, type Style } from './music';

export interface SessionRecord {
  id: string;
  missionId: string;
  style: Style;
  duration: Duration;
  seconds: number;
  finishedAt: string;
  reflection: string;
  difficulty: Difficulty | null;
}

export interface SavedState {
  version: 1;
  style: Style;
  duration: Duration;
  sessions: SessionRecord[];
}

export const STORAGE_KEY = 'interlude.practice.v1';
export const initialState: SavedState = {
  version: 1,
  style: 'classical',
  duration: 8,
  sessions: [],
};

function validSession(value: unknown): value is SessionRecord {
  if (!value || typeof value !== 'object') return false;
  const s = value as Partial<SessionRecord>;
  return (
    typeof s.id === 'string' &&
    missions.some((m) => m.id === s.missionId) &&
    (s.style === 'classical' || s.style === 'jazz') &&
    (s.duration === 2 || s.duration === 8) &&
    typeof s.seconds === 'number' &&
    Number.isFinite(s.seconds) &&
    s.seconds >= 0 &&
    s.seconds <= 3600 &&
    typeof s.finishedAt === 'string' &&
    Number.isFinite(Date.parse(s.finishedAt)) &&
    typeof s.reflection === 'string' &&
    (s.difficulty === null || ['hard', 'right', 'easy'].includes(s.difficulty ?? ''))
  );
}

export function parseState(raw: string | null): SavedState {
  try {
    const value = JSON.parse(raw ?? 'null');
    if (!value || value.version !== 1) return { ...initialState, sessions: [] };
    return {
      version: 1,
      style: value.style === 'jazz' ? 'jazz' : 'classical',
      duration: value.duration === 2 ? 2 : 8,
      sessions: Array.isArray(value.sessions)
        ? value.sessions.filter(validSession).slice(0, 500)
        : [],
    };
  } catch {
    return { ...initialState, sessions: [] };
  }
}

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function weekDates(now = new Date()): Date[] {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(date.getDate() + i);
    return date;
  });
}

export function practiceDays(sessions: SessionRecord[]): Set<string> {
  return new Set(sessions.map((s) => localDateKey(new Date(s.finishedAt))));
}

export function recommendedMission(sessions: SessionRecord[], style: Style) {
  const completed = new Set(sessions.filter((s) => s.style === style).map((s) => s.missionId));
  const last = sessions.find((s) => s.style === style);
  if (last?.difficulty === 'hard') return missions.find((m) => m.id === last.missionId)!;
  return missions.find((m) => !completed.has(m.id)) ?? missions[0];
}
