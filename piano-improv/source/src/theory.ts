import type { Mission, MusicalExample, Note, StageId, Style } from './music';

export type ConceptExampleKind = 'concept-a' | 'concept-b';
export type PlaybackKind = 'original' | 'variation' | ConceptExampleKind;

export interface TeachingExample {
  label: string;
  explanation: string;
  audio: MusicalExample;
}

export interface LessonConcept {
  title: string;
  goal: string;
  explanation: string[];
  remember: string;
  examples: [TeachingExample, TeachingExample];
  try: string;
  create: string;
  transfer: string;
  reflect: string;
  question: {
    prompt: string;
    answers: [string, string];
    correct: 0 | 1;
    explanation: string;
  };
  chordMap?: string[];
}

const n = (midi: number, beat: number, length: number): Note => ({ midi, beat, length });
const clip = (
  notes: Note[],
  caption: string,
  feel: 'straight' | 'swing' = 'straight',
): MusicalExample => ({ notes, caption, meter: 4, feel });
const line = (pitches: number[], lengths = pitches.map(() => 1), start = 0) => {
  let beat = start;
  return pitches.map((midi, i) => {
    const note = n(midi, beat, lengths[i]);
    beat += lengths[i];
    return note;
  });
};
const teachingExample = (
  label: string,
  explanation: string,
  audio: MusicalExample,
): TeachingExample => ({ label, explanation, audio });
const contextual = (
  notes: Note[],
  chord: number[],
  caption: string,
  feel: 'straight' | 'swing' = 'straight',
) =>
  clip(
    [
      ...chord.map((midi) => n(midi, 0, 1.5)),
      ...notes.map((note) => ({ ...note, beat: note.beat + 2 })),
    ],
    caption,
    feel,
  );

/** Written teaching content. No model, microphone, or remote lesson generation is used. */
export function conceptFor(mission: Mission, style: Style): LessonConcept {
  const jazz = style === 'jazz';
  const palette =
    mission.id === 'three-notes'
      ? [60, 64, 67]
      : jazz
        ? mission.id === 'miniature'
          ? [60, 63, 67]
          : [60, 64, 67]
        : [60, 62, 64];
  const chord = jazz ? [60, 64, 67, 70] : [60, 64, 67];
  const feel = jazz ? 'swing' : 'straight';
  const sourceExamples = (a: string, b: string): [TeachingExample, TeachingExample] => {
    const material = mission.material!;
    return [
      teachingExample(a, material.original.caption, material.original),
      teachingExample(b, material.variation[style].caption, material.variation[style]),
    ];
  };
  switch (mission.id) {
    case 'three-notes':
      return {
        title: 'A phrase needs a little space',
        goal: 'Make a short musical sentence with a clear breath at the end.',
        explanation: [
          'The pulse is the steady beat underneath the music. A phrase is a small group of notes that feels like one idea.',
          'You can keep feeling the pulse while you stop playing. That space helps a listener hear where one idea ends and another begins.',
        ],
        remember: 'Silence is a musical choice, not a failed attempt to find the next note.',
        examples: [
          teachingExample(
            'A · Join the two ideas',
            'The two groups meet without a gap. This can be a musical choice too.',
            clip(
              [
                n(palette[0], 0, 0.5),
                n(palette[1], 0.5, 0.5),
                n(palette[2], 1, 1),
                n(palette[2], 2, 1),
                n(palette[1], 3, 1),
                n(palette[0], 4, 1),
              ],
              'The same pitches without a gap',
              feel,
            ),
          ),
          teachingExample(
            'B · Give the idea a breath',
            'The pitches and note lengths stay the same. A two-beat gap now separates the groups.',
            clip(
              [
                n(palette[0], 0, 0.5),
                n(palette[1], 0.5, 0.5),
                n(palette[2], 1, 1),
                n(palette[2], 4, 1),
                n(palette[1], 5, 1),
                n(palette[0], 6, 1),
              ],
              'The same pitches with a breath',
              feel,
            ),
          ),
        ],
        try: 'Use your three suggested notes. Play for two beats, then leave two beats empty. Keep counting quietly through the gap. Repeat four times.',
        create:
          'Invent a different two-beat phrase. Keep the same two-beat gap after it. Change the rhythm before adding more notes.',
        transfer:
          'Keep the backing if it helps. Look away from the note hints and make three short phrases with a clear breath between them. Moving higher or lower on the keyboard is an optional next step.',
        reflect:
          'Could you feel the beat during the silence? Which phrase had a clear ending? Save one idea you want to revisit.',
        question: {
          prompt: 'What should happen to the pulse when you leave a gap?',
          answers: [
            'Keep feeling it while you stop playing.',
            'Stop it until you find another note.',
          ],
          correct: 0,
          explanation:
            'The notes can stop while the pulse continues. That lets the next phrase enter deliberately.',
        },
      };
    case 'question-answer':
      return {
        title: 'A question can have a different answer',
        goal: 'Make two related phrases, with the second sounding more settled.',
        explanation: [
          'A musical question and answer are a pair of phrases. They can share a rhythm or a melodic shape without being identical.',
          'In this C-centered exercise, C often feels like home. Other endings can leave more expectation. Rhythm and the chord underneath also affect that feeling.',
        ],
        remember:
          'An answer should sound related to the question. It does not need to be longer or harder.',
        examples: [
          teachingExample(
            'A · Leave a question open',
            'A C-major chord is followed by a phrase that ends away from C.',
            contextual(line([60, 64, 62], [0.5, 0.5, 1]), [60, 64, 67], 'A question', feel),
          ),
          teachingExample(
            'B · Answer toward home',
            'The same chord is followed by a falling phrase that ends on C.',
            contextual(line([64, 62, 60], [0.5, 0.5, 1]), [60, 64, 67], 'An answer', feel),
          ),
        ],
        try: 'Play a short rising question, then wait. Answer with a falling phrase that ends on C. Keep the rhythms similar.',
        create:
          'Keep your question the same three times. Invent a different answer each time. Try one answer with only two notes.',
        transfer:
          'Hide the note hints and use your own question and answer without replaying the example. Keep the backing. Try without it only when that feels comfortable.',
        reflect:
          'Did your answer sound connected to the question? Did its ending feel deliberate rather than accidental?',
        question: {
          prompt: 'What can connect a question and its answer?',
          answers: ['They must use exactly the same notes.', 'They can share a rhythm or shape.'],
          correct: 1,
          explanation:
            'A shared rhythm or shape can make different phrases sound like parts of the same conversation.',
        },
      };
    case 'motif':
      return {
        title: 'A motif is an idea worth repeating',
        goal: 'Keep one small idea recognizable while changing one detail.',
        explanation: [
          'A motif is a short musical idea with a recognizable rhythm or shape. Repetition helps the listener remember it.',
          'A variation keeps something from that idea and changes something else. Change only the ending first, so you can hear what stayed the same.',
        ],
        remember: 'Repeat enough to establish an idea. Change enough to give it somewhere to go.',
        examples: [
          teachingExample(
            'A · Repeat the motif',
            'The second phrase is an exact repeat.',
            clip(
              [...line(palette, [0.5, 0.5, 1]), ...line(palette, [0.5, 0.5, 1], 4)],
              'The same motif twice',
              feel,
            ),
          ),
          teachingExample(
            'B · Change just the ending',
            'The rhythm and first two notes stay the same. Only the last note changes.',
            clip(
              [
                ...line(palette, [0.5, 0.5, 1]),
                ...line([palette[0], palette[1], jazz ? 72 : 67], [0.5, 0.5, 1], 4),
              ],
              'A motif and one variation',
              feel,
            ),
          ),
        ],
        try: 'Invent a three-note motif. Play it twice exactly the same way. On the third time, change only its final note.',
        create:
          'Choose one other change: a new rhythm, a softer answer, or another octave. Keep enough of the motif that you can still recognize it.',
        transfer:
          'Look away and play your own motif from memory. Make one new variation, then return to the original. Keep the backing if it helps.',
        reflect:
          'Which feature made your motif recognizable: its rhythm, its shape, or a repeated note?',
        question: {
          prompt: 'What makes this a variation rather than a completely new idea?',
          answers: ['Some recognizable part stays the same.', 'Every note and rhythm must change.'],
          correct: 0,
          explanation:
            'Variation balances a recognizable feature with a change. Keeping the rhythm is one useful starting point.',
        },
      };
    case 'harmony':
      return {
        title: 'Chord tones are places to land',
        goal: 'Choose a phrase ending because of the chord underneath it.',
        explanation: [
          jazz
            ? 'A C-major triad contains C, E, and G: root, third, and fifth. C7 adds B-flat, its flat seventh. These four notes are its chord tones. F7 contains F, A, C, and E-flat.'
            : 'A C-major chord contains C, E, and G: its root, third, and fifth. These are chord tones. An F-major chord contains F, A, and C.',
          'A chord tone often makes a useful landing point. Notes between chord tones can connect them: C–D–E uses D as a passing note. D is not forbidden; here it leads from C to E.',
        ],
        remember: 'Hear the chord, choose a destination, then decide how to approach it.',
        examples: [
          teachingExample(
            'A · Use chord tones only',
            'Hear the chord first, then C, E, and G in the melody.',
            contextual(line([72, 76, 79], [1, 1, 2]), chord, 'Chord tones as destinations'),
          ),
          teachingExample(
            'B · Connect them with D',
            'The chord and destinations stay the same. A short D now connects C to E.',
            contextual(
              line([72, 74, 76, 79], [0.5, 0.5, 1, 2]),
              chord,
              'A passing note connects C to E',
            ),
          ),
        ],
        try: 'Over C, end short phrases on C, E, or G. Over F, try F, A, or C. Start with one long note per chord so you can hear the relationship.',
        create:
          'Pick an ending before each phrase. Try C–D–E to approach E over C. Then make your own route to another chord tone.',
        transfer:
          'Keep the backing and hide the note hints. Listen to the changing chords and choose your own landing notes. Stay with one long note per chord if that helps.',
        reflect:
          'Could you choose a destination before playing the phrase? Which passing note helped you get there?',
        question: {
          prompt: 'Over a C-major chord, what is D doing in C–D–E?',
          answers: [
            'It is a chord tone of C major.',
            'It connects two chord tones as a passing note.',
          ],
          correct: 1,
          explanation:
            'C and E belong to the C-major triad. D lies between them and can connect them by step.',
        },
      };
    case 'left-hand': {
      const melody = line(jazz ? [72, 76, 79, 76] : [72, 74, 76, 72], [0.5, 0.5, 1, 1]);
      return {
        title: 'Give the left hand a simple job',
        goal: 'Support a melody without losing the freedom to invent it.',
        explanation: [
          'An accompaniment gives the melody a pulse or harmonic setting. It does not need to fill every gap or match every melody note.',
          jazz
            ? 'Start with one low C. Later, add B-flat to make a simple C7 shell. A shell is an incomplete chord voicing; here it is just root and flat seventh.'
            : 'Start with one low C per bar. Later, alternate C and G as a broken fifth. A broken interval means its notes sound one after the other, not together.',
        ],
        remember:
          'If your attention runs out, simplify the left hand before adding more right-hand notes.',
        examples: [
          teachingExample(
            'A · A busier left hand',
            'The melody stays the same while the bass moves. This is not worse; it simply asks for more coordination.',
            clip(
              [...line(jazz ? [48, 55, 58, 55] : [48, 52, 55, 52]), ...melody],
              'A moving left hand and a melody',
            ),
          ),
          teachingExample(
            'B · Leave the bass simple',
            'One held low C supports the same melody with fewer left-hand decisions.',
            clip([n(48, 0, 4), ...melody], 'One bass note and the same melody'),
          ),
        ],
        try: 'Turn off the backing. First play a low C once per bar with your left hand for four bars. When that feels steady, add just one right-hand note. Do not add a melody yet.',
        create: jazz
          ? 'Keep your bass C steady while inventing a short riff. If that is easy, try a quiet C–B-flat shell once per bar. Return to C alone if needed.'
          : 'Keep your bass C steady while inventing a phrase. If that is easy, try a slow C–G broken fifth. Return to C alone if needed.',
        transfer:
          'Keep the same familiar left-hand pattern. Look away and play one right-hand phrase from memory, then change its ending. Simplify to one bass note again if the pulse becomes hard to keep.',
        reflect:
          'Could the left hand continue while you chose your next melody note? What could you simplify next time?',
        question: {
          prompt: 'If two-hand improvisation becomes difficult, what is a useful first change?',
          answers: ['Simplify the left-hand pattern.', 'Add a faster melody to keep moving.'],
          correct: 0,
          explanation:
            'A predictable, simple accompaniment leaves more attention for hearing and choosing the melody.',
        },
      };
    }
    case 'miniature':
      return {
        title: 'A return gives music a shape',
        goal: 'Make an opening, a contrast, and a recognizable return.',
        explanation: [
          'Form is the shape of music over time. One useful small outline is A–B–A: an opening idea, something contrasting, then a return.',
          'The contrast can be small: another register, a different volume, or a new rhythm. Returning to A helps your ending feel connected to the beginning.',
        ],
        remember: 'You can make a complete small piece from one idea and one contrast.',
        examples: [
          teachingExample(
            'A · Opening and contrast',
            'A short opening moves to a higher idea, but does not return.',
            clip(
              [
                ...line(palette, [0.5, 0.5, 1]),
                ...line(jazz ? [67, 65, 67] : [67, 69, 67], [0.5, 0.5, 1], 2),
              ],
              'An A–B outline',
              feel,
            ),
          ),
          teachingExample(
            'B · Add the return',
            'The same outline now recalls its opening, with a final C.',
            clip(
              [
                ...line(palette, [0.5, 0.5, 1]),
                ...line(jazz ? [67, 65, 67] : [67, 69, 67], [0.5, 0.5, 1], 2),
                ...line([60, palette[1], 60], [0.5, 0.5, 1], 4),
              ],
              'An A–B–A outline',
              feel,
            ),
          ),
        ],
        try: 'Make an opening phrase and remember it. Play a contrasting phrase in a different register. Then return to the opening.',
        create:
          'Make a short piece from that outline. Change one thing in the middle. Plan your final phrase before you reach it.',
        transfer:
          'Hide the note hints and use your own opening, contrast, and return. Keep the backing if it helps. Removing it is an optional later step, not another task you must do now.',
        reflect:
          'Could you recognize your opening when it returned? Did your ending belong to the same piece?',
        question: {
          prompt: 'What does A–B–A describe?',
          answers: ['Three unrelated scales.', 'An opening, a contrast, and a return.'],
          correct: 1,
          explanation:
            'The letters stand for musical sections or ideas. A returning idea can be slightly varied and still feel like A.',
        },
      };
    case 'ode-answer':
      return {
        title: 'The tonic gives a melody a home',
        goal: 'Hear how a different final note changes the feeling of arrival.',
        explanation: [
          'The tonic is the central note of a key. In C major, it is C. A phrase can leave that note, create expectation, and return to it.',
          'Our short Beethoven extract ends on D. The example variation ends on C. Over a C-major setting, C often feels more settled. This is a choice of ending, not a rule that every phrase must end on C.',
        ],
        remember:
          'The final note has a job. Choose whether this phrase should ask for more or come to rest.',
        examples: [
          teachingExample(
            'A · End away from home',
            'A C-major chord establishes the setting. The source phrase then ends on D.',
            contextual(
              mission.material!.original.notes,
              [60, 64, 67],
              'C-major context, then the phrase ending on D',
            ),
          ),
          teachingExample(
            'B · Return to C',
            'The chord, rhythm, and first seven melody notes stay the same. Only the final D changes to C.',
            contextual(
              mission.material!.variation.classical.notes,
              [60, 64, 67],
              'The same context and phrase, with a final C',
            ),
          ),
        ],
        try: 'Play the source phrase. Keep its first seven notes and try ending on C, D, then E. Listen before choosing your favorite.',
        create: jazz
          ? 'Keep the rising-and-falling shape, but invent a new rhythm and an answer that lands on C. Leave space before the answer.'
          : 'Keep the opening of the theme and invent your own answer. Try one ending that stays open and one that settles on C.',
        transfer:
          'Keep the backing if useful. Hide the note hints, use your own opening instead of Beethoven’s, and make an answer that ends on C. Replay the source only if you get stuck.',
        reflect:
          'Could you hear the ending you wanted before playing it? Which note changed the feeling most?',
        question: {
          prompt: 'In this C-major setting, which note is the tonic?',
          answers: ['C', 'D'],
          correct: 0,
          explanation:
            'C is the tonic of C major. D can be useful too, but it has a different role in this key.',
        },
      };
    case 'mozart-variation':
      return {
        title: jazz ? 'Keep the tune, change its rhythm' : 'A neighbor note leaves and returns',
        goal: jazz
          ? 'Make a variation without changing the melody’s pitch order.'
          : 'Decorate a melody note without losing its identity.',
        explanation: jazz
          ? [
              'Rhythm is the pattern of note starts, lengths, and rests. A melody can stay recognizable when its pitches remain in order but its rhythm changes.',
              'An offbeat falls between the main beats. Delaying one note or leaving a gap can change the feel without adding another pitch.',
            ]
          : [
              'A neighbor note moves one step away from a melody note and then returns: C–D–C. The C remains the main note; D briefly decorates it.',
              'A passing note instead continues to a different note: C–D–E. These are useful ways to connect or decorate melody notes, not permission to add notes at random.',
            ],
        remember: jazz
          ? 'Keep the pitches in order. Change where they arrive.'
          : 'Neighbor: away and back. Passing: through to a different note.',
        examples: sourceExamples(
          'A · The plain theme',
          jazz ? 'B · New rhythm, same pitches' : 'B · Add a small decoration',
        ),
        try: jazz
          ? 'Play the theme’s notes in order. Move just one note between beats, or leave a gap before it. Keep the other notes simple.'
          : 'Play C, then C–D–C. Next, try A–B–A. Hear the return to the main note each time.',
        create: jazz
          ? 'Make two rhythmic versions of the theme. Repeat the version you like before making another change.'
          : 'Choose one place in the familiar theme to add a neighbor note. Keep the rest plain. Then try a different decoration in that one place.',
        transfer: jazz
          ? 'Keep the backing and look away. Use your practiced rhythm with a different short melody. Repeat it before changing anything else.'
          : 'Hide the score. Use your own short melody with one neighbor-note decoration. Play a plain version too, so you can hear what the decoration added.',
        reflect: jazz
          ? 'Was the melody still recognizable after the rhythm changed? Which gap or delayed note worked best?'
          : 'Could you hear the main melody note through the decoration? Did you return to it deliberately?',
        question: jazz
          ? {
              prompt: 'What changes in our rhythm variation?',
              answers: ['The pitch order must change.', 'The note starts, lengths, and rests.'],
              correct: 1,
              explanation:
                'The melody’s pitches can stay in order while its timing changes. That is a rhythmic variation.',
            }
          : {
              prompt: 'Which pattern is a neighbor-note decoration?',
              answers: ['C–D–C', 'C–D–E'],
              correct: 0,
              explanation:
                'C–D–C leaves C by one step and returns. In C–D–E, D passes between two different notes.',
            },
      };
    case 'bach-melody':
      return {
        title: 'A broken chord is harmony spread through time',
        goal: 'Hear a chord inside a pattern, then choose a melody above it.',
        explanation: [
          'An arpeggio, or broken chord, plays chord tones one after another. Bach’s opening pattern spreads the notes of C major over several octaves. It is not a scale running through every note.',
          'You can simplify a busy pattern to its harmony. Over C, Dm7/C, G7/B, C, the melody E–F–F–E connects the chords smoothly. Dm7/C means D–F–A–C with C in the bass. G7/B means G–B–D–F with B in the bass. This is a stretch exercise; one long melody note per chord is enough.',
        ],
        remember: 'You do not need to match a busy accompaniment with a busy melody.',
        examples: sourceExamples('A · Hear the broken chord', 'B · Hear a slower melody over C'),
        try: 'Play C–E–G slowly and hear the C-major chord. Turn on the backing, then try one target note per chord: E, F, F, E.',
        create:
          'Keep those target notes as destinations. Add one or two connecting notes between them, without making the line faster than you can hear.',
        transfer:
          'Keep the backing and hide the note hints. Recall your E–F–F–E destinations by ear, then change one connecting note. A new register or your own left hand can wait for a later session.',
        reflect:
          'Could you hear the chord beneath the pattern? Did your melody follow the harmony without copying the arpeggio?',
        question: {
          prompt: 'What makes C–E–G a broken C-major chord?',
          answers: [
            'It plays every note of the C-major scale.',
            'It plays chord tones one after another.',
          ],
          correct: 1,
          explanation:
            'C, E, and G are the notes of the C-major triad. Playing them successively breaks the chord into a pattern.',
        },
      };
    case 'joplin-rhythm':
      return {
        title: 'Syncopation can carry a note across a beat',
        goal: 'Hear a rhythmic idea, keep its timing, and invent different pitches.',
        explanation: [
          'Syncopation places an emphasis where the main pulse does not normally fall. One way is to start a note between beats and hold it across the next beat.',
          'In this tiny Joplin extract, A starts between beats and lasts across the following beat. The subdivisions stay even. Ragtime does not need swing to sound rhythmically lively.',
        ],
        remember:
          'Keep the pulse steady underneath the offbeat note. This is a later challenge; one-note practice is enough.',
        examples: [
          teachingExample(
            'A · The pitches in even eighths',
            'The same six source pitches are spaced evenly. This is a teaching comparison, not Joplin’s rhythm.',
            clip(
              line([74, 76, 72, 69, 71, 67], Array(6).fill(0.5)),
              'Even eighths on the source pitches',
            ),
          ),
          teachingExample(
            'B · Joplin’s short rhythm',
            'Listen to the longer A beginning between beats. The rhythm is straight, not swung.',
            mission.material!.original,
          ),
        ],
        try: 'Tap a steady beat and play the extract’s rhythm on C. Then try its source pitches. Slow the tempo if needed.',
        create:
          'Keep the rhythm exactly, but choose different notes. Our source-panel variation is one example. Make your own second version.',
        transfer:
          'Close the notation and look away. Use the remembered rhythm to begin a new phrase, then invent a different ending. Keep the subdivisions even.',
        reflect:
          'Could you keep the beat underneath the longer offbeat note? Did changing the pitches preserve the rhythm’s character?',
        question: {
          prompt: 'Should this ragtime extract use a long–short swing feel?',
          answers: [
            'No. Keep its subdivisions straight.',
            'Yes. Every syncopated rhythm must swing.',
          ],
          correct: 0,
          explanation:
            'Syncopation and swing are different ideas. A straight rhythm can be strongly syncopated.',
        },
      };
    case 'blues-conversation':
      return {
        title: 'Call and response make a conversation',
        goal: 'Answer a short riff with a related idea of your own.',
        explanation: [
          'A riff is a short idea you can repeat. Call and response pairs that idea with an answer. Sharing a rhythm helps the answer sound connected.',
          'C7 contains C, E, G, and B-flat. This blues study adds E-flat and F in the melody. E-flat against the chord’s E-natural adds a familiar blues tension. You do not need to treat every melody note as a chord tone.',
        ],
        remember:
          'Repeat the call so the listener knows it. Change the response so the conversation moves.',
        examples: sourceExamples('A · A short call', 'B · Add a related answer'),
        try: 'Copy the starting riff and leave its last beat empty. Answer it with the same rhythm and a falling shape.',
        create:
          'Keep the call unchanged. Make three different responses, each with a clear gap before the next call.',
        transfer:
          'Hide the hints and stop replaying the riff. Invent a new call and response from memory, using a different opening rhythm.',
        reflect:
          'Did the response sound related to the call? Could you keep the conversation going without adding more notes?',
        question: {
          prompt: 'Why keep returning to the same call?',
          answers: [
            'Repetition gives the answer a recognizable point of reference.',
            'A solo must never introduce a new idea.',
          ],
          correct: 0,
          explanation:
            'A repeated call establishes an idea. The response can develop it, and a later call can change too.',
        },
      };
    case 'blues-space': {
      const notes = line([60, 60, 63, 60, 67, 63, 60], [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1]);
      return {
        title: 'Hear swing before you try to calculate it',
        goal: 'Feel the difference between evenly spaced and swung eighth notes.',
        explanation: [
          'Straight eighth notes divide a beat into two equal parts. In this practice app, swing makes the first part longer and the second part shorter, using a simple 2:1 ratio.',
          'Real swing varies with tempo, style, and the player. This ratio is a learning model, not a rule for every jazz performance. An offbeat is a note between the main beats; swing changes how that space is divided.',
        ],
        remember: 'The pulse stays steady. It is the spacing inside each beat that changes.',
        examples: [
          teachingExample(
            'A · Even eighth notes',
            'Hear the same notes with equally spaced eighth-note pairs.',
            clip(notes, 'A straight version'),
          ),
          teachingExample(
            'B · Long–short eighth notes',
            'The pitches and written rhythm stay the same. Only the inside-the-beat spacing changes.',
            clip(notes, 'A simple swung version', 'swing'),
          ),
        ],
        try: 'Tap a steady beat. Copy the long–short feel using only C. Keep the next beat on time instead of letting the whole phrase slow down.',
        create:
          'Make a tiny phrase with C, E-flat, and G. Try it straight, then swung. Leave a beat empty before repeating it.',
        transfer:
          'Keep the backing and look away. Use your own phrase in the same feel, with a clear gap before repeating it. Trying without backing is an optional later step.',
        reflect:
          'Could you hear and reproduce the difference? Did the pulse stay steady while the eighth-note spacing changed?',
        question: {
          prompt: 'What changes between our A and B examples?',
          answers: ['The pitches and key.', 'The spacing inside each beat.'],
          correct: 1,
          explanation:
            'Both examples use the same pitches and written rhythm. B gives each eighth-note pair a long–short feel.',
        },
      };
    }
    case 'blues-chorus':
      return {
        title: 'A chorus is one trip through the form',
        goal: 'Carry one idea through twelve bars and give it a clear ending.',
        explanation: [
          'In this blues, a chorus is one complete twelve-bar cycle. A bar contains four beats. C7 lasts for the first four bars, F7 enters in bar 5, and G7 enters in bar 9.',
          'Use four bars to establish an idea, four to answer or develop it, and four to find an ending. C, E-flat, F, and G are enough; G-flat and B-flat are optional extra colors, not a new requirement. The examples are short phrases, not full choruses. Follow the full form with the backing’s bar counter.',
        ],
        remember: 'Think in phrases across the form, not twelve unrelated bars.',
        chordMap: ['C7', 'C7', 'C7', 'C7', 'F7', 'F7', 'C7', 'C7', 'G7', 'F7', 'C7', 'G7'],
        examples: sourceExamples(
          'A · A small opening idea',
          'B · A short development, not a full chorus',
        ),
        try: 'Turn on the backing and count four beats per bar. Play one simple riff in bars 1–4. Listen for F7 at bar 5 and G7 at bar 9.',
        create:
          'Repeat your opening in bars 1–4, answer it in bars 5–8, then simplify in bars 9–12. The last G7 leads into the next C7. To finish instead of looping, land on that next C and stop the backing.',
        transfer:
          'Keep the backing and bar counter, but hide the note hints. Recall the twelve-bar shape and play another chorus. Use a recognizable opening and decide whether to finish on the next C or begin another chorus.',
        reflect:
          'Could you follow the twelve-bar cycle without reading the map? Did your last phrase sound like an ending or a lead-in to another chorus?',
        question: {
          prompt: 'In this exercise, how long is one chorus?',
          answers: ['Twelve bars, with four beats in each bar.', 'Twelve individual beats.'],
          correct: 0,
          explanation:
            'One chorus is a complete pass through the form. Here that is 12 bars × 4 beats, or 48 beats.',
        },
      };
    default:
      throw new Error(`Missing teaching concept for ${mission.id}`);
  }
}

export function guidedPrompt(concept: LessonConcept, stage: StageId): string | null {
  if (stage === 'copy') return concept.try;
  if (stage === 'change') return concept.create;
  if (stage === 'play') return concept.transfer;
  if (stage === 'reflect') return concept.reflect;
  return null;
}
