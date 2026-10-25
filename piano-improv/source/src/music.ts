import { repertoireMissions } from './repertoire';

export type Style = 'classical' | 'jazz';
export type Duration = 2 | 8;
export type Difficulty = 'hard' | 'right' | 'easy';
export type StageId = 'listen' | 'copy' | 'change' | 'play' | 'reflect';

export interface Chord {
  name: string;
  bass: number;
  notes: number[];
}

export interface Note {
  midi: number;
  beat: number;
  length: number;
}

export type Collection = 'foundations' | 'themes' | 'blues';
export type ExampleKind = 'original' | 'variation';
export type Feel = 'straight' | 'swing';

export interface MusicalExample {
  notes: Note[];
  meter: 2 | 4;
  caption: string;
  feel?: Feel;
}

export interface StudyMaterial {
  title: string;
  composer: string;
  sourceUrl: string;
  rights: string;
  adaptation: string;
  kind: 'composition' | 'study';
  original: MusicalExample;
  variation: Record<Style, MusicalExample>;
  listenFor: Record<Style, string>;
}

export interface Mission {
  id: string;
  number: string;
  title: string;
  description: string;
  skill: string;
  notes: Record<Style, string[]>;
  demo: Record<Style, Note[]>;
  prompts: Record<Style, Record<StageId, string>>;
  harmony: Record<Style, Chord[]>;
  tip: string;
  collection?: Collection;
  styles?: Style[];
  tempo?: number;
  backingFeel?: Feel;
  material?: StudyMaterial;
}

const C: Chord = { name: 'C', bass: 48, notes: [60, 64, 67] };
const Am: Chord = { name: 'Am', bass: 45, notes: [60, 64, 69] };
const F: Chord = { name: 'F', bass: 41, notes: [60, 65, 69] };
const G: Chord = { name: 'G', bass: 43, notes: [59, 62, 67] };
const C7: Chord = { name: 'C7', bass: 48, notes: [58, 64, 67] };
const F7: Chord = { name: 'F7', bass: 41, notes: [57, 63, 65] };
const G7: Chord = { name: 'G7', bass: 43, notes: [59, 62, 65] };

const phrase = (pitches: number[], jazz = false): Note[] =>
  pitches.map((midi, i) => ({
    midi,
    beat: [0, jazz ? 0.66 : 1, 2, jazz ? 2.66 : 3, 4, 5, 6, 7][i],
    length: i === pitches.length - 1 ? 1.6 : 0.65,
  }));

const prompts = (
  change: string,
  play: string,
  copy: string,
  reflection: string,
): Record<StageId, string> => ({
  listen:
    'Listen to the short example. Notice its rhythm and where it leaves space. Then try the notes on your piano.',
  copy,
  change,
  play,
  reflect: reflection,
});

const sharedReflection =
  'Stop playing for a moment. Which part felt like your own idea? Try that phrase once more, then save a short note.';

const foundations: Mission[] = [
  {
    id: 'three-notes',
    number: '01',
    title: 'A little goes a long way',
    skill: 'Your first phrases',
    description: 'Three notes. A little space. A melody that is yours.',
    notes: { classical: ['C', 'D', 'E'], jazz: ['C', 'E♭', 'G'] },
    demo: { classical: phrase([60, 62, 64, 62, 60]), jazz: phrase([60, 63, 67, 63, 60], true) },
    harmony: { classical: [C], jazz: [C7] },
    prompts: {
      classical: prompts(
        'Use only C, D, and E. Make a short phrase, then repeat it with a different ending.',
        'Make a small melody with your three notes. Repeat ideas you like. Leave a breath between phrases.',
        'Listen again if you need to. Find the phrase using C, D, and E. Getting the shape matters more than an exact copy.',
        sharedReflection,
      ),
      jazz: prompts(
        'Use C, E-flat, and G. Keep the same notes but change the rhythm. Leave a gap before you answer.',
        'Play short phrases over the groove. Repeat one idea, change its ending, and let the accompaniment fill the gaps.',
        'Copy the rhythm using just C. When it feels comfortable, add E-flat and G.',
        sharedReflection,
      ),
    },
    tip: 'A pause is part of your phrase, not a mistake.',
  },
  {
    id: 'question-answer',
    number: '02',
    title: 'Have a conversation',
    skill: 'Question & answer',
    description: 'Let one phrase ask. Let the next one answer.',
    notes: { classical: ['C', 'D', 'E', 'G'], jazz: ['C', 'E♭', 'F', 'G'] },
    demo: {
      classical: phrase([60, 62, 64, 67, 64, 62, 60]),
      jazz: phrase([60, 63, 65, 67, 65, 63, 60], true),
    },
    harmony: { classical: [C], jazz: [C7] },
    prompts: {
      classical: prompts(
        'Make a question that ends on D or G. Answer it with a phrase that ends on C.',
        'Make pairs of phrases. Let the second phrase feel more settled than the first.',
        'Copy the rising phrase, then the falling phrase. Hear how the ending changes the feeling.',
        sharedReflection,
      ),
      jazz: prompts(
        'Play a short question. Wait for two beats, then answer with a similar rhythm.',
        'Trade phrases with the silence: play, wait, answer. Keep the same small set of notes.',
        'Copy the first rhythm on C, then try answering it on G and C.',
        sharedReflection,
      ),
    },
    tip: 'Your answer can be simpler than your question.',
  },
  {
    id: 'motif',
    number: '03',
    title: 'One idea, many possibilities',
    skill: 'Motif & variation',
    description: 'Find a small idea worth coming back to.',
    notes: { classical: ['C', 'D', 'E', 'G', 'A'], jazz: ['C', 'E♭', 'F', 'G', 'B♭'] },
    demo: {
      classical: phrase([60, 62, 64, 62, 64, 67]),
      jazz: phrase([60, 63, 65, 63, 65, 67], true),
    },
    harmony: { classical: [C], jazz: [C7] },
    prompts: {
      classical: prompts(
        'Invent a three-note idea. Repeat it higher on the keyboard, then change only its last note.',
        'Build a short piece from one idea. Change its register, volume, or ending. Return to the original before you finish.',
        'Find the three-note shape. Play it twice without looking at the hints.',
        sharedReflection,
      ),
      jazz: prompts(
        'Invent a short riff. Repeat it three times, changing just one thing each time.',
        'Keep returning to your riff. Try a later start, a shorter ending, or a softer answer.',
        'Copy the short riff by ear. Keep its rhythm even if you choose different notes.',
        sharedReflection,
      ),
    },
    tip: 'You do not need a new idea for every bar.',
  },
  {
    id: 'harmony',
    number: '04',
    title: 'Find your way home',
    skill: 'Melody & harmony',
    description: 'Hear a chord change. Give your phrase somewhere to land.',
    notes: {
      classical: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      jazz: ['C', 'D', 'E', 'F', 'G', 'A', 'B♭'],
    },
    demo: {
      classical: phrase([64, 67, 64, 60, 65, 69, 67, 65]),
      jazz: phrase([64, 67, 70, 67, 65, 69, 63, 65], true),
    },
    harmony: { classical: [C, F], jazz: [C7, F7] },
    prompts: {
      classical: prompts(
        'On C, end a phrase on C, E, or G. On F, try F, A, or C. Listen to the feeling of arrival.',
        'Make a melody over the two chords. Use the chord display when helpful, then look away for one round.',
        'Listen for the move from C to F. Try playing just one note from each chord.',
        sharedReflection,
      ),
      jazz: prompts(
        'Aim for E over C7 and A over F7. Approach each target with a short phrase.',
        'Let the chord change guide your phrase endings. Do not worry about filling every beat.',
        'Listen for E over C7 and A over F7. Play those two target notes as the chords change.',
        sharedReflection,
      ),
    },
    tip: 'A chord tone is a note in the chord. Hear it as a place to arrive.',
  },
  {
    id: 'left-hand',
    number: '05',
    title: 'Make room for both hands',
    skill: 'Simple accompaniment',
    description: 'A quiet left hand. A little more freedom in the right.',
    notes: { classical: ['C', 'D', 'E', 'G', 'A'], jazz: ['C', 'E♭', 'F', 'G', 'B♭'] },
    demo: {
      classical: phrase([60, 64, 67, 64, 62, 60]),
      jazz: phrase([60, 63, 67, 65, 63, 60], true),
    },
    harmony: { classical: [C], jazz: [C7] },
    prompts: {
      classical: prompts(
        'Turn off the backing. Play a low C once per bar with your left hand. Add a short right-hand phrase.',
        'Keep your left hand simple. Try C and G as a slow broken fifth, then add your melody. Return to one bass note if needed.',
        'Play a low C with your left hand. Hold it while your right hand finds the example.',
        sharedReflection,
      ),
      jazz: prompts(
        'Turn off the backing. Play a quiet C–B-flat shell with your left hand once per bar. Add a tiny right-hand riff.',
        'Keep the left-hand shell steady and quiet. Leave enough space to think and listen. A low C alone is also fine.',
        'Find C and B-flat below middle C. Play them softly, then try the right-hand example.',
        sharedReflection,
      ),
    },
    tip: 'If two hands feel hard, simplify the left hand before adding more practice time.',
  },
  {
    id: 'miniature',
    number: '06',
    title: 'Something of your own',
    skill: 'A complete improvisation',
    description: 'An opening, a little journey, and a way home.',
    notes: {
      classical: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      jazz: ['C', 'E♭', 'F', 'G♭', 'G', 'B♭'],
    },
    demo: {
      classical: phrase([60, 64, 67, 64, 69, 67, 62, 60]),
      jazz: phrase([60, 63, 65, 66, 67, 65, 63, 60], true),
    },
    harmony: { classical: [C, Am, F, G], jazz: [C7, C7, C7, C7, F7, F7, C7, C7, G7, F7, C7, G7] },
    prompts: {
      classical: prompts(
        'Choose a small opening idea. Make a contrasting middle by changing register or volume. Plan a quiet return.',
        'Make a short prelude. Use your opening idea, explore, then return. End when the phrase feels complete.',
        'Borrow the shape of the example, not every note. Find an opening you want to use.',
        sharedReflection,
      ),
      jazz: prompts(
        'Try the C blues notes over the 12-bar form. Make the first four bars simple, then answer them.',
        'Play a short blues solo. Develop one riff across the form, then finish with a clear final phrase. Outside notes can add tension; listen to where they lead.',
        'Copy one small part of the example. Use it as a riff, with space around it.',
        sharedReflection,
      ),
    },
    tip: 'A clear ending can be more satisfying than a complicated middle.',
  },
];

export const missions: Mission[] = [...foundations, ...repertoireMissions];

export function missionsFor(style: Style, collection?: Collection): Mission[] {
  return missions.filter(
    (m) =>
      (!m.styles || m.styles.includes(style)) &&
      (!collection || (m.collection ?? 'foundations') === collection),
  );
}

export const stages: { id: StageId; label: string; short: string }[] = [
  { id: 'listen', label: 'Hear the idea', short: 'Listen' },
  { id: 'copy', label: 'Find it by ear', short: 'Copy' },
  { id: 'change', label: 'Make it your own', short: 'Change' },
  { id: 'play', label: 'Follow your curiosity', short: 'Play' },
  { id: 'reflect', label: 'Take a little with you', short: 'Reflect' },
];

export function stageLengths(duration: Duration): number[] {
  return duration === 2 ? [15, 20, 30, 45, 10] : [30, 60, 120, 210, 60];
}

export function stageAt(
  elapsed: number,
  duration: Duration,
): { index: number; remaining: number; start: number } {
  const lengths = stageLengths(duration);
  let start = 0;
  for (let index = 0; index < lengths.length; index++) {
    if (elapsed < start + lengths[index])
      return { index, remaining: start + lengths[index] - elapsed, start };
    start += lengths[index];
  }
  return { index: lengths.length - 1, remaining: 0, start: start - lengths[lengths.length - 1] };
}

export function formatTime(seconds: number): string {
  const whole = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

export const explorePrompts = [
  'Repeat your last phrase, but more softly.',
  'Leave a full bar of silence. Hear what wants to come next.',
  'Use the same rhythm with different notes.',
  'Make a question. Answer it with just two notes.',
  'Move your idea one octave higher.',
  'Play one note. Give it an interesting rhythm.',
  'Return to your opening idea, then find an ending.',
];

export const settings = [
  {
    id: 'evening',
    name: 'A quiet evening',
    subtitle: 'Slow, open, and a little reflective.',
    style: 'classical' as Style,
    tempo: 66,
    harmony: [Am, F, C, G],
    notes: ['A', 'C', 'D', 'E', 'G'],
    color: 'sage',
  },
  {
    id: 'prelude',
    name: 'An unwritten prelude',
    subtitle: 'Flowing chords. Your own small story.',
    style: 'classical' as Style,
    tempo: 76,
    harmony: [C, Am, F, G],
    notes: ['C', 'D', 'E', 'G', 'A'],
    color: 'sand',
  },
  {
    id: 'blue',
    name: 'A little blue',
    subtitle: 'An easy swing with room to answer.',
    style: 'jazz' as Style,
    tempo: 84,
    harmony: [C7, C7, C7, C7, F7, F7, C7, C7, G7, F7, C7, G7],
    notes: ['C', 'E♭', 'F', 'G♭', 'G', 'B♭'],
    color: 'blue',
  },
];
