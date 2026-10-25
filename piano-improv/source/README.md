# Interlude

A tablet-friendly piano improvisation practice app for an acoustic piano. Includes six foundation missions, four source-based theme lessons, and three original blues studies.

## Run locally

Requires Node.js 22.12+, 24+, or 26+ and npm.

```sh
npm install
npm run dev
```

Open the local URL shown by Vite. The server binds to loopback only. On a laptop, place the screen beside your piano. Access from a separate tablet needs a separately configured host or deployment; the loopback URL does not work on another device.

## What works

- Six foundation missions, each with classical and jazz instructions and audio examples.
- A six-topic learning path: phrases, variation, harmony, connecting notes, accompaniment, and form. The order introduces chord tones before dedicated blues tension and keeps Joplin as an optional later challenge.
- An untimed, sound-first concept guide for every lesson: a goal, two comparison examples, a plain explanation, and an optional understanding check. Reading and the check never block playing.
- A Theme & Variations collection: Beethoven's Ode to Joy, the theme used in Mozart's K.265, Bach's BWV 846 opening pattern, and a small extract from Joplin's The Entertainer.
- A First Blues collection: original call-and-response, rhythm, and twelve-bar studies, available in jazz mode.
- Separate source and variation playback, with optional notation, source credits, and clear notes about adaptations.
- Two-minute and eight-minute practice plans: hear, try, create, transfer, and reflect. Step times are suggestions; only the player chooses Next or Finish.
- A local piano-style synth with adjustable backing tempo and volume.
- Three free-play settings and small creative prompts.
- Optional written reflections, difficulty ratings, and a practice history.
- Visible Credits & Sources in the footer and desktop sidebar: teaching authors, music provenance, software/font notices, and direct author/publisher book links. The free textbook is clearly marked free. There are no affiliate links or purchase requirements. Opening credits pauses practice without discarding an unfinished session or note.
- Browser storage for preferences and the most recent 500 sessions.
- Automatic pause when the tab becomes hidden, and confirmation before leaving an unfinished session.
- Keyboard controls, reduced-motion support, and layouts for phones, tablets, and desktops.

Sound starts only after a button press. Lessons first open an untimed concept guide. Play the A/B examples, read if useful, or go straight to playing. The practice clock starts only after that choice. Examples play without backing so they are easy to hear. The clock waits while an example plays. Backing resumes afterward if practice is running and accompaniment is on. Source-based lessons start with accompaniment off; turn it on when you want support. Turn it off to work on your own left-hand pattern.

Session history records actual active practice time, not the selected plan length. Reading and example-listening time are not added. Reaching a suggested step time never changes the task, interrupts a phrase, or ends a session. Staying longer counts toward actual practice time; skipping ahead does not add unplayed minutes. Review the concept at any point to pause practice without losing your place. The transfer step hides note hints and collapses examples, but they can be reopened; backing stays available.

Free play is not timed or saved. A difficult rating suggests revisiting that mission; other ratings suggest the next unvisited mission in the learning-path order for the selected style. Existing history is preserved. A saved visit or a correct concept answer is not treated as proof of playing mastery. Tempo and note count are adjusted by the player, not automatically.

## Privacy and limits

There is no account, backend, analytics, microphone access, note detection, or audio recording. The app cannot assess how you played. Progress is stored only in this browser and is not synced or backed up. Clearing site data removes it. Written notes are optional. Audio uses a synthesized piano-like sound, not an acoustic piano recording.

The interface uses Google Fonts with system-font fallbacks. Audio does not need network access. Optional notation loads VexFlow and its bundled Bravura/Academico fonts only when requested. It does not load music from a third-party service. License notices are in `public/THIRD_PARTY_NOTICES.txt`. This prototype is not an installable offline app. Publishing it to GitHub Pages does not make the site access-private.

## Checks

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests cover desktop, tablet, and phone layouts. They test audio scheduling, session controls, navigation safety, reflection persistence, storage errors, source/variation playback, and notation for every new lesson. Test audio is muted at the browser output. The browser test server uses `127.0.0.1:5173` by default and will not reuse a server unless explicitly requested. Choose a free port with `PORT=5174 npm run test:e2e`. Set `PLAYWRIGHT_REUSE_SERVER=1` only after checking that the existing server belongs to this source tree.

## Main files

- `src/music.ts`: missions, demonstrations, harmony, and timing.
- `src/course.ts`: topic order and style-aware lesson selection.
- `src/theory.ts`: lesson concepts, A/B comparisons, practice tasks, and optional understanding checks.
- `src/LessonGuide.tsx` and `src/LearningPath.tsx`: the untimed guide and suggested path.
- `src/repertoire.ts`: source-based collections, excerpts, new variations, and provenance.
- `src/StudyPanel.tsx`, `src/Notation.tsx`, and `src/score-model.ts`: example comparison and optional notation.
- `src/audio-timing.ts`: straight and simple 2:1 swing timing.
- `src/audio.ts`: Web Audio synth and backing scheduler.
- `src/storage.ts`: saved state validation and practice summaries.
- `src/App.tsx`: screens and practice flow.
- `src/components.tsx`: shared interface components.
- `src/styles.css`: responsive visual design.

## Teaching references

The exercises use limited note sets, imitation, motif development, phrasing, simple harmony, and a gradual move to independent playing. They are a prototype curriculum, not a clinically validated learning method.

- [Trinity College London: Incorporating improvisation into your piano lesson](https://blog.trinitycollege.co.uk/incorporating-improvisation-into-your-piano-lesson)
- [Berklee: Ear-training exercises](https://online.berklee.edu/takenote/ear-training-exercises-to-help-you-become-a-better-musician/)
- [Berklee: Got Rhythm?](https://college.berklee.edu/bt/193/lesson.html)
- [University of Sydney: Graded Constraints](https://hdl.handle.net/2123/29255)
- [Berklee: Five Levels — variations on a simple melody](https://www.berklee.edu/berklee-today/summer-2011/five-levels-of-improvisation)
- [Open Music Theory: Blues Harmony](https://viva.pressbooks.pub/openmusictheory/chapter/blues-harmony/)

These teaching pages are references, not copied lesson text. Open Music Theory is CC BY-SA 4.0, except where noted; no book excerpts or images are bundled here. The notes and instructions in the new blues studies are original. See each theme lesson's source panel for its public-domain edition and the exact changes made. No modern recording, arrangement, or translation has been imported.

## Teaching-content review

See [`public/PEDAGOGY_REVIEW.md`](public/PEDAGOGY_REVIEW.md) for the source-based review, exact access limits, findings, and changes. It includes Forrest Kinney's author guides for Create First! / Pattern Play, the available outline of Tim Richards' Improvising Blues Piano, and full accessible Open Music Theory chapters. This is not a claim to have read every commercial book or an endorsement by the authors. No qualified teacher has independently assessed the app or the learner's playing.
