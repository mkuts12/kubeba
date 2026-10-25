import { missionsFor, type Mission, type Style } from './music';

export const courseUnits = [
  {
    id: 'phrases',
    number: '01',
    title: 'Pulse & phrases',
    description: 'Make a short musical sentence, leave a breath, and find an ending.',
    outcome: 'I can make a phrase instead of filling every beat.',
    lessons: ['three-notes', 'question-answer', 'ode-answer'],
  },
  {
    id: 'variation',
    number: '02',
    title: 'Repeat & vary',
    description: 'Keep an idea recognizable while changing its notes or rhythm.',
    outcome: 'I can develop one idea instead of searching for a new one.',
    lessons: ['motif'],
  },
  {
    id: 'harmony',
    number: '03',
    title: 'Hear the chord',
    description: 'Understand chord tones and use them as places to arrive.',
    outcome: 'I can choose a melody note because of the chord I hear.',
    lessons: ['harmony', 'bach-melody'],
  },
  {
    id: 'connections',
    number: '04',
    title: 'Connect the notes',
    description: 'Use passing and neighbor notes without losing the melody.',
    outcome: 'I can add a small decoration and hear where it leads.',
    lessons: ['mozart-variation'],
  },
  {
    id: 'accompaniment',
    number: '05',
    title: 'Support the melody',
    description: 'Give the left hand a simple job so the right hand can explore.',
    outcome: 'I can support a phrase without using all my attention.',
    lessons: ['left-hand'],
  },
  {
    id: 'form',
    number: '06',
    title: 'Shape a whole piece',
    description:
      'Apply the earlier ideas to a whole piece. Explore blues and an optional rhythm challenge.',
    outcome: 'I can develop an idea and give it a clear ending.',
    lessons: ['blues-conversation', 'blues-space', 'miniature', 'blues-chorus', 'joplin-rhythm'],
  },
] as const;

export type UnitId = (typeof courseUnits)[number]['id'];

export function unitFor(missionId: string) {
  return courseUnits.find((unit) => (unit.lessons as readonly string[]).includes(missionId))!;
}

export function courseMissions(style: Style, unitId?: UnitId): Mission[] {
  const available = new Map(missionsFor(style).map((m) => [m.id, m]));
  return courseUnits
    .filter((unit) => !unitId || unit.id === unitId)
    .flatMap((unit) => unit.lessons)
    .map((id) => available.get(id))
    .filter((mission): mission is Mission => !!mission);
}
