import type { Chord, Mission, MusicalExample, Note, StageId, StudyMaterial, Style } from './music';

// These are short teaching extracts, not transcriptions of modern recordings.
// Source editions, alterations, and newly written studies are identified per lesson.
const C: Chord = { name: 'C', bass: 48, notes: [60, 64, 67] };
const F: Chord = { name: 'F', bass: 41, notes: [60, 65, 69] };
const DmC: Chord = { name: 'Dm7/C', bass: 48, notes: [62, 65, 69] };
const G7B: Chord = { name: 'G7/B', bass: 47, notes: [62, 65, 67] };
const C7: Chord = { name: 'C7', bass: 48, notes: [58, 64, 67] };
const F7: Chord = { name: 'F7', bass: 41, notes: [57, 63, 65] };
const G7: Chord = { name: 'G7', bass: 43, notes: [59, 62, 65] };
const blues = [C7, C7, C7, C7, F7, F7, C7, C7, G7, F7, C7, G7];
const same = <T>(value: T): Record<Style, T> => ({ classical: value, jazz: value });
const sequence = (pitches: number[], lengths: number[], start = 0): Note[] => {
  let beat = start;
  return pitches.map((midi, i) => {
    const note = { midi, beat, length: lengths[i] };
    beat += lengths[i];
    return note;
  });
};
const n = (midi: number, beat: number, length: number): Note => ({ midi, beat, length });
const example = (
  notes: Note[],
  caption: string,
  meter: 2 | 4 = 4,
  feel: 'straight' | 'swing' = 'straight',
): MusicalExample => ({ notes, caption, meter, feel });
const prompts = (
  listen: string,
  copy: string,
  change: string,
  play: string,
): Record<StageId, string> => ({
  listen,
  copy,
  change,
  play,
  reflect:
    'What did you keep from the source, and what became your own? Play your favorite version once more. Save a note if you want to return to it.',
});

const ode: StudyMaterial = {
  title: 'Ode to Joy — opening of the theme',
  composer: 'Ludwig van Beethoven · Symphony No. 9, Op.125 (1824)',
  sourceUrl: 'https://imslp.org/wiki/Symphony_No.9,_Op.125_(Beethoven,_Ludwig_van)',
  rights:
    'Public-domain composition. The excerpt is newly entered here; no modern arrangement or recording is copied.',
  adaptation:
    'Opening two bars of the melody, transposed to C major. Melody only. The accompaniment and example variations are new teaching arrangements.',
  kind: 'composition',
  original: example(
    sequence([64, 64, 65, 67, 67, 65, 64, 62], Array(8).fill(1)),
    'Opening two bars · transposed to C major',
  ),
  variation: {
    classical: example(
      sequence([64, 64, 65, 67, 67, 65, 64, 60], Array(8).fill(1)),
      'A new answer · the last D becomes C',
    ),
    jazz: example(
      [
        n(64, 0, 0.5),
        n(64, 0.5, 0.5),
        n(65, 1, 1),
        n(67, 2, 2),
        n(67, 4, 0.5),
        n(65, 4.5, 0.5),
        n(64, 5, 1),
        n(60, 6, 2),
      ],
      'Same shape, a new rhythm and ending · swing eighths',
      4,
      'swing',
    ),
  },
  listenFor: {
    classical:
      'The theme stops on D. The variation ends on C. Listen to how a single changed note makes the ending feel more settled.',
    jazz: 'The variation keeps the rising and falling shape, but changes the rhythm and ends on C. Hear the longer gaps and uneven eighth notes.',
  },
};

const twinkle: StudyMaterial = {
  title: 'Ah! vous dirai-je, maman — theme used in K.265',
  composer: 'Traditional French melody · variations by W. A. Mozart (c.1781–82)',
  sourceUrl:
    'https://imslp.org/wiki/12_Variations_on_%27Ah%2C_vous_dirai-je_maman%27%2C_K.265%2F300e_(Mozart%2C_Wolfgang_Amadeus)',
  rights:
    'Public-domain melody and Mozart composition. Our example variations are new, not Mozart’s written variations.',
  adaptation:
    'First four 2/4 bars of the familiar theme, in C major. Melody only. The app supplies a new, simple accompaniment.',
  kind: 'composition',
  original: example(
    sequence([60, 60, 67, 67, 69, 69, 67], [1, 1, 1, 1, 1, 1, 2]),
    'Theme, first four bars · C major',
    2,
  ),
  variation: {
    classical: example(
      sequence(
        [60, 62, 60, 67, 69, 67, 69, 71, 69, 67],
        [0.5, 0.5, 1, 0.5, 0.5, 1, 0.5, 0.5, 1, 2],
      ),
      'New neighbor notes decorate the same phrase · not a Mozart variation',
      2,
    ),
    jazz: example(
      [
        n(60, 0, 0.5),
        n(60, 0.5, 0.5),
        n(67, 1.5, 0.5),
        n(67, 2, 1),
        n(69, 4, 0.5),
        n(69, 4.5, 0.5),
        n(67, 6, 2),
      ],
      'A rhythm variation with space · swing eighths',
      2,
      'swing',
    ),
  },
  listenFor: {
    classical:
      'The added notes briefly move away from a melody note and return. The original shape and final G remain easy to recognize.',
    jazz: 'The notes stay the same. Some arrive earlier or later, and the rests become part of the phrase. You do not need more pitches to make a variation.',
  },
};

const bach: StudyMaterial = {
  title: 'Prelude in C major, BWV 846 — opening pattern',
  composer: 'Johann Sebastian Bach · The Well-Tempered Clavier, Book I (1722)',
  sourceUrl: 'https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=5',
  rights:
    'Public-domain composition and Mutopia typesetting (Mutopia-2011/09/12-5). Entered from the note attacks in the opening bar.',
  adaptation:
    'The opening bar is reduced to one line: C4 E4 G4 C5 E5 G4 C5 E5, twice. The held lower notes are shortened to sixteenths. This is not the full two-hand score. The variation is our own melody over C.',
  kind: 'composition',
  original: example(
    sequence(
      [60, 64, 67, 72, 76, 67, 72, 76, 60, 64, 67, 72, 76, 67, 72, 76],
      Array(16).fill(0.25),
    ),
    'Opening bar · single-line reduction of the note attacks',
  ),
  variation: same(
    example(
      [n(72, 0, 1), n(71, 1, 0.5), n(72, 1.5, 0.5), n(76, 2, 1), n(74, 3, 0.5), n(72, 3.5, 0.5)],
      'Our new melody over C · not a Bach transcription',
    ),
  ),
  listenFor: same(
    'Bach’s pattern spreads a C-major chord through time. Our example uses fewer, longer notes to make a melody over that same harmony.',
  ),
};

const joplin: StudyMaterial = {
  title: 'The Entertainer — a tiny introduction',
  composer: 'Scott Joplin · A Ragtime Two Step (1902)',
  sourceUrl: 'https://www.mutopiaproject.org/ftp/JoplinS/entertainer/entertainer.ly',
  rights:
    'Public-domain composition and Mutopia typesetting (Mutopia-2016/11/25-263), based on the original 1902 edition.',
  adaptation:
    'Single melody line from introduction bar 2. The tied A is shown as one eighth note. This short extract does not include the full piano texture. Our variation moves the pattern to other C-major notes. Ragtime uses straight, not swung, subdivisions here.',
  kind: 'composition',
  original: example(
    sequence([74, 76, 72, 69, 71, 67], [0.25, 0.25, 0.25, 0.5, 0.25, 0.5]),
    'Introduction, bar 2 · melody only · straight sixteenths',
    2,
  ),
  variation: same(
    example(
      sequence([67, 69, 65, 62, 64, 60], [0.25, 0.25, 0.25, 0.5, 0.25, 0.5]),
      'Same rhythm, a new note pattern · straight sixteenths',
      2,
    ),
  ),
  listenFor: same(
    'The longer A begins between beats. Keep the subdivisions even. Our variation keeps this rhythm but changes the pitches.',
  ),
};

function themeMission(config: {
  id: string;
  number: string;
  title: string;
  skill: string;
  description: string;
  material: StudyMaterial;
  notes: string[];
  harmony: Chord[];
  tempo?: number;
  classical: Record<StageId, string>;
  jazz: Record<StageId, string>;
  tip: string;
  straight?: boolean;
}): Mission {
  const { classical, jazz, straight, ...base } = config;
  return {
    ...base,
    collection: 'themes',
    tempo: config.tempo ?? 72,
    notes: same(config.notes),
    demo: {
      classical: config.material.variation.classical.notes,
      jazz: config.material.variation.jazz.notes,
    },
    harmony: same(config.harmony),
    prompts: { classical, jazz },
    backingFeel: straight ? 'straight' : undefined,
  };
}

const themeMissions: Mission[] = [
  themeMission({
    id: 'ode-answer',
    number: 'T1',
    title: 'An ode, with your own ending',
    skill: 'Change one note',
    description: 'Start with Beethoven. Keep the phrase, but change where it lands.',
    material: ode,
    notes: ['C', 'D', 'E', 'F', 'G'],
    harmony: [C],
    classical: prompts(
      'Hear the theme, then our variation. Listen to the last note: D in the theme, C in the variation.',
      'Find E E F G | G F E D. Try it by ear first. Show the notation if you need it. Middle C is C4.',
      'Keep the first seven notes. Try ending on C, D, or E. Which ending feels most settled?',
      'Return to the opening of the theme. Make a different answer each time. Then hide the hints and make a new phrase with the same rising-and-falling shape.',
    ),
    jazz: prompts(
      'Hear the theme, then our swung variation. Notice how the same melodic shape can have a different rhythm.',
      'Copy the theme using E, F, G, and D. Then copy just the rhythm of our variation on one note.',
      'Keep the opening E E F G, but leave space before your answer. Try ending your answer on C.',
      'Make a small conversation from the theme. Repeat your favorite rhythm, change an ending, then invent a new answer without looking at the notes.',
    ),
    tip: 'A familiar melody gives you something to change, not something you must obey.',
  }),
  themeMission({
    id: 'mozart-variation',
    number: 'T2',
    title: 'One theme, your variations',
    skill: 'Decorate a melody',
    description: 'A tune you know. A doorway into Mozart-style variation.',
    material: twinkle,
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    harmony: [C],
    classical: prompts(
      'Hear the familiar theme. Then hear how our variation adds small neighboring notes without losing the tune.',
      'Play C C G G | A A G, with the last G held longer. Use the notation if helpful. This is only the opening phrase.',
      'Add a brief D between the opening Cs, or a B between two As. Return to the original note. Change one place at a time.',
      'Alternate the plain theme with your own variation. Try a new rhythm, a soft answer, or another register. Finish with the plain theme.',
    ),
    jazz: prompts(
      'Compare the plain theme with our rhythm variation. Listen for delayed notes and gaps; the pitches have not changed.',
      'Find the theme on your piano. Next, play its rhythm on just C. Notice the longer final note.',
      'Keep the notes in order but move one of them off the beat. Leave a gap. The backing uses four beats per bar; the theme is written in 2/4.',
      'Make three rhythmic versions of the opening. Repeat the one you like. Then use its rhythm with a new set of notes.',
    ),
    tip: 'These are new teaching variations. They are not Mozart’s written variations.',
  }),
  themeMission({
    id: 'bach-melody',
    number: 'T3',
    title: 'A melody above Bach',
    skill: 'Hear the harmony inside a pattern',
    description: 'Turn a familiar broken chord into space for a new melody.',
    material: bach,
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    harmony: [C, DmC, G7B, C],
    tempo: 60,
    classical: prompts(
      'Hear the one-line reduction of Bach’s opening bar. Then hear our slower melody over C. Notice how both belong to the same chord.',
      'Find C E G C E on the keyboard. You do not need to copy all sixteen notes. Hear the C-major chord inside the pattern.',
      'Turn on the backing. Its first four chords follow Bach’s opening: C, Dm7/C, G7/B, C. Try one long melody note per chord: E, F, F, E.',
      'Make a melody above those four chords. Begin with long notes. If two hands feel comfortable, turn the backing off and supply one bass note per bar: C, C, B, C.',
    ),
    jazz: prompts(
      'Hear Bach’s C-major pattern and our new melody. We will use the opening harmony to practice smooth melody notes, not copy a jazz recording.',
      'Play E over C, F over Dm7/C, F over G7/B, and E over C. Let one small movement connect the chords.',
      'Connect the target notes E F F E with a few passing notes. Keep the line slow enough to hear each chord change.',
      'Make a short solo over the four-chord loop. End some phrases on a chord tone. Then turn off the backing and play just the target-note melody from memory.',
    ),
    tip: 'The backing is a new, simpler pattern over Bach’s opening harmony—not the original accompaniment.',
  }),
  themeMission({
    id: 'joplin-rhythm',
    number: 'T4',
    title: 'Borrow a little ragtime',
    skill: 'Keep a rhythm, change the notes',
    description: 'A tiny Joplin extract. A new idea in the same rhythm.',
    material: joplin,
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    harmony: [C],
    tempo: 60,
    straight: true,
    classical: prompts(
      'Hear the six-note extract from Joplin’s introduction. Listen for the A that lasts across the next subdivision. This is ragtime, played straight.',
      'Play the rhythm on one note first. Then find D5 E5 C5 A4 B4 G4. C4 is middle C. Use the notation, or slow the tempo.',
      'Keep the rhythm but try G A F D E C instead. Then choose your own six notes. Keep the sixteenths even.',
      'Use the borrowed rhythm in short phrases. Try another register or a new ending. Leave space after each phrase, and finish with your favorite version.',
    ),
    jazz: prompts(
      'Hear the source phrase and our new note pattern. This lesson is a ragtime-to-jazz bridge. Keep the subdivisions straight; do not swing this extract.',
      'Copy the rhythm on C. When it feels comfortable, try the six source pitches. Slow the tempo if you need to.',
      'Keep the exact rhythm but invent different notes. Listen to how the rhythm makes a new phrase sound related to the source.',
      'Use that rhythm as the start of an original riff. Change the answer each time. The optional backing is a simple C vamp, not Joplin’s piano part.',
    ),
    tip: 'This is a later rhythm challenge. A single-note version is enough; you do not need to learn the whole rag.',
  }),
];

const bluesSource = (
  original: MusicalExample,
  variation: MusicalExample,
  listenFor: string,
): StudyMaterial => ({
  title: 'Original blues practice study',
  composer: 'Interlude · newly written exercise',
  sourceUrl: 'https://viva.pressbooks.pub/openmusictheory/chapter/blues-harmony/',
  rights:
    'New teaching phrases written for this app over a common blues form. These are not excerpts from a published song or a performer’s solo.',
  adaptation:
    'The linked Open Music Theory chapter is background reading on blues. The example notes, instructions, and backing here are our own, not copied from the book.',
  kind: 'study',
  original,
  variation: same(variation),
  listenFor: same(listenFor),
});

const riffStudy = bluesSource(
  example(
    [n(60, 0, 1), n(63, 1, 0.5), n(65, 1.5, 0.5), n(67, 2, 1)],
    'Our starting riff · the final beat is silent',
    4,
    'swing',
  ),
  example(
    [
      n(60, 0, 1),
      n(63, 1, 0.5),
      n(65, 1.5, 0.5),
      n(67, 2, 1),
      n(67, 4, 1),
      n(65, 5, 0.5),
      n(63, 5.5, 0.5),
      n(60, 6, 1),
    ],
    'A question and a related answer · leave the last beat of each bar empty',
    4,
    'swing',
  ),
  'The answer reuses the question’s rhythm but turns the melody downward. Each bar leaves a beat of space.',
);
const spaceStudy = bluesSource(
  example([n(60, 0, 1), n(60, 1, 1), n(63, 2, 1), n(60, 3, 1)], 'Our plain four-note phrase'),
  example(
    [n(60, 0.5, 0.5), n(60, 1.5, 0.5), n(63, 2, 1), n(60, 3.5, 0.5)],
    'Same notes, later starts and gaps · swing eighths',
    4,
    'swing',
  ),
  'The variation keeps all four pitches in order. Its interest comes from where notes begin and where nothing is played.',
);
const chorusStudy = bluesSource(
  example([n(60, 0, 1), n(63, 1, 1), n(67, 2, 2)], 'Our small opening idea'),
  example(
    [
      n(60, 0, 1),
      n(63, 1, 0.5),
      n(65, 1.5, 0.5),
      n(67, 2, 1),
      n(65, 4, 1),
      n(63, 5, 1),
      n(60, 6, 2),
    ],
    'One possible way to develop the idea · not a full chorus',
    4,
    'swing',
  ),
  'A short idea can return in several forms. Our variation is only two bars; your task is to carry an idea through the twelve-bar form.',
);

const bluesMissions: Mission[] = [
  {
    id: 'blues-conversation',
    number: 'B1',
    title: 'Your first blues conversation',
    skill: 'Call & response',
    description: 'Borrow our small riff. Answer it with something of your own.',
    material: riffStudy,
    notes: same(['C', 'E♭', 'F', 'G']),
    harmony: same([C7]),
    prompts: same(
      prompts(
        'Hear our starting riff, then the example answer. Listen for the empty beat after each phrase.',
        'Copy the starting riff. Use C, E-flat, F, and G. If the notes feel hard, copy only its rhythm on C.',
        'Keep the rhythm but answer with a falling phrase. Try ending on C. Then invent a different answer.',
        'Trade short questions and answers over the C7 vamp. Repeat the question several times and change only the answer.',
      ),
    ),
    tip: 'A conversation needs a pause as well as a reply.',
  },
  {
    id: 'blues-space',
    number: 'B2',
    title: 'Let the spaces swing',
    skill: 'Rhythm before more notes',
    description: 'Four notes, two rhythms. Hear what the spaces change.',
    material: spaceStudy,
    notes: same(['C', 'E♭', 'G']),
    harmony: same([C7]),
    prompts: same(
      prompts(
        'Compare our plain phrase with its rhythm variation. The notes stay the same; some now arrive between beats.',
        'Play the plain phrase, C C E-flat C. Then copy just one offbeat from the variation. You can slow the tempo.',
        'Move one note off the beat. Leave a gap before another. Keep the phrase short enough to repeat from memory.',
        'Build a solo from one rhythm and three notes. Repeat, pause, answer. Try one round without looking at the hints.',
      ),
    ),
    tip: 'Swing is something to hear and feel. The score uses ordinary eighth notes; playback gives them a 2:1 long-short feel.',
  },
  {
    id: 'blues-chorus',
    number: 'B3',
    title: 'One idea, twelve bars',
    skill: 'Build a complete blues chorus',
    description: 'Give one small idea an opening, a journey, and an ending.',
    material: chorusStudy,
    notes: same(['C', 'E♭', 'F', 'G♭', 'G', 'B♭']),
    harmony: same(blues),
    prompts: same(
      prompts(
        'Hear our small riff and its two-bar variation. Then follow the backing’s C7, F7, and G7 changes. These examples are original studies, not a jazz standard.',
        'Copy one small part of the riff. Count four beats in each bar. Notice the move to F7 in bar 5 and G7 in bar 9.',
        'Play your riff over the first four bars. Answer it over the next four. Make the last four bars simpler so the chorus has an ending.',
        'Play one twelve-bar chorus, then another. Keep a recognizable opening idea. Near the end, leave space and give your last phrase a clear landing.',
      ),
    ),
    tip: 'The C blues notes are a starting palette. E-flat against C7 adds blues tension; you do not need to treat every note as a chord tone.',
  },
].map(
  (m) =>
    ({
      ...m,
      collection: 'blues',
      styles: ['jazz'],
      tempo: 84,
      demo: {
        classical: m.material.variation.classical.notes,
        jazz: m.material.variation.jazz.notes,
      },
    }) satisfies Mission,
);

export const repertoireMissions: Mission[] = [...themeMissions, ...bluesMissions];
