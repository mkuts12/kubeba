interface CreditLink {
  label: string;
  url: string;
}
interface TeachingCredit {
  title: string;
  author: string;
  description: string;
  scope: string;
  links: CreditLink[];
  support: CreditLink & { kind: 'buy' | 'free'; note: string };
}

export const teachingCredits: TeachingCredit[] = [
  {
    title: 'Create First! / Pattern Play',
    author: 'Forrest Kinney',
    description:
      'His published author guides informed the use of small note sets, musical conversation, and supported playing before independent two-hand playing.',
    scope:
      'Author guides and official sample-lesson descriptions were consulted. The full commercial books were not read or copied.',
    support: {
      kind: 'buy',
      label: 'Explore and buy the books',
      url: 'https://forrestkinney.com/improvising-1',
      note: 'The author’s catalog explains the duet and solo formats. Choose the format that fits how you learn.',
    },
    links: [
      { label: 'Duet-to-solo teaching guide', url: 'https://forrestkinney.com/improvising' },
      { label: 'Create First! — How It Works', url: 'https://forrestkinney.com/how-it-works' },
    ],
  },
  {
    title: 'Improvising Blues Piano',
    author: 'Tim Richards · published by Schott Music',
    description:
      'The available contents and licensed course outline informed the broad move from simpler chord material toward blues riffs, rhythm, and further voicings.',
    scope:
      'The outline was consulted, not the complete book or paid course. No book exercises, scores, or recordings are included in this app.',
    support: {
      kind: 'buy',
      label: 'Buy from Schott Music',
      url: 'https://www.schott-music.com/en/improvising-blues-piano-no445670.html',
      note: 'For a fuller piano blues method, consider the original book. Check its level and sample pages before buying.',
    },
    links: [
      {
        label: 'Book and licensed course outline',
        url: 'https://www.musicgurus.com/sheet-music/improvising-blues-piano',
      },
    ],
  },
  {
    title: 'Open Music Theory, Version 2',
    author:
      'Mark Gotham, Kyle Gullings, Chelsey Hamm, Bryn Hughes, Brian Jarvis, Megan Lavengood, and John Peterson · edited by Erin K. Maher',
    description:
      'The accessible chapters by John Peterson, Megan Lavengood, and Bryn Hughes were used to check embellishing tones, swing, syncopation, and blues harmony.',
    scope:
      'The textbook is licensed under CC BY-SA 4.0, except where otherwise noted. App explanations and musical examples are newly written; textbook images, recordings, and exercises are not bundled.',
    support: {
      kind: 'free',
      label: 'Read and credit the free textbook',
      url: 'https://viva.pressbooks.pub/openmusictheory/',
      note: 'This book is free by design. Support open education by using it, sharing its official link, and crediting the authors under its license.',
    },
    links: [
      {
        label: 'Embellishing Tones — John Peterson',
        url: 'https://viva.pressbooks.pub/openmusictheory/chapter/embellishing-tones/',
      },
      {
        label: 'Swing Rhythms — Megan Lavengood',
        url: 'https://viva.pressbooks.pub/openmusictheory/chapter/swing-rhythms/',
      },
      {
        label: 'Blues Harmony — Bryn Hughes and Megan Lavengood',
        url: 'https://viva.pressbooks.pub/openmusictheory/chapter/blues-harmony/',
      },
      { label: 'CC BY-SA 4.0 license', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
    ],
  },
  {
    title: 'Five Levels: Variations on a Simple Melody',
    author: 'Matt Glaser · Berklee College of Music',
    description:
      'This published article informed melody-based variation and the gradual move from a recognizable tune toward freer improvisation.',
    scope:
      'The article is an edited excerpt from Bluegrass Fiddle and Beyond (Berklee Press). The article was consulted; its book, lesson text, and musical examples were not copied.',
    support: {
      kind: 'buy',
      label: 'Buy the book from Hal Leonard',
      url: 'https://www.halleonard.com/product/50449602/bluegrass-fiddle-and-beyond',
      note: 'This is a fiddle book, cited here for its general variation ideas. Piano learners may prefer the piano books above.',
    },
    links: [
      {
        label: 'Read the Berklee teaching article',
        url: 'https://www.berklee.edu/berklee-today/summer-2011/five-levels-of-improvisation',
      },
    ],
  },
];

export const additionalReferences = [
  {
    label:
      'Guy Bunce — Incorporating improvisation into your piano lesson (Trinity College London)',
    url: 'https://blog.trinitycollege.co.uk/incorporating-improvisation-into-your-piano-lesson',
  },
  {
    label: 'Berklee Online — Ear-training exercises',
    url: 'https://online.berklee.edu/takenote/ear-training-exercises-to-help-you-become-a-better-musician/',
  },
  {
    label: 'Berklee College of Music — Got Rhythm?',
    url: 'https://college.berklee.edu/bt/193/lesson.html',
  },
  {
    label:
      'University of Sydney — Graded Constraints: A Practise Methodology for Solo Piano Improvisation',
    url: 'https://hdl.handle.net/2123/29255',
  },
];

export const softwareCredits = [
  { label: 'React', url: 'https://react.dev/' },
  { label: 'Vite', url: 'https://vite.dev/' },
  { label: 'TypeScript', url: 'https://www.typescriptlang.org/' },
  { label: 'Lucide icons', url: 'https://lucide.dev/' },
  { label: 'VexFlow notation', url: 'https://www.vexflow.com/' },
];
