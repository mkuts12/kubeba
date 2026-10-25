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
- A Theme & Variations collection: Beethoven's Ode to Joy, the theme used in Mozart's K.265, Bach's BWV 846 opening pattern, and a small extract from Joplin's The Entertainer.
- A First Blues collection: original call-and-response, rhythm, and twelve-bar studies, available in jazz mode.
- Separate source and variation playback, with optional notation, source credits, and clear notes about adaptations.
- Two-minute and eight-minute sessions: listen, copy, change, play, and reflect.
- A local piano-style synth with adjustable backing tempo and volume.
- Three free-play settings and small creative prompts.
- Optional written reflections, difficulty ratings, and a practice history.
- Browser storage for preferences and the most recent 500 sessions.
- Automatic pause when the tab becomes hidden, and confirmation before leaving an unfinished session.
- Keyboard controls, reduced-motion support, and layouts for phones, tablets, and desktops.

Sound starts only after a button press. Examples play without backing so they are easy to hear. The session timer waits while an example plays. Backing resumes afterward if a session is running and accompaniment is on. Source-based lessons start with accompaniment off; turn it on when you want support. Turn it off to work on your own left-hand pattern.

Session history records actual timer time, not the selected session length. Example-listening time is not added to that timer. Moving to the next step does not add unplayed minutes. Free play is not timed or saved. A difficult rating suggests revisiting that mission; other ratings suggest the next unvisited mission available in the selected style. Existing foundation history is preserved. Tempo and note count are adjusted by the player, not automatically.

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
