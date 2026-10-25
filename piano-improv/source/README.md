# Interlude

A tablet-friendly piano improvisation practice app. Built for an acoustic piano, with classical and jazz versions of six musical missions.

## Run locally

Requires Node.js 22.12+, 24+, or 26+ and npm.

```sh
npm install
npm run dev
```

Open the local URL shown by Vite. The server binds to loopback only. On a laptop, place the screen beside your piano. Access from a separate tablet needs a separately configured host or deployment; the loopback URL does not work on another device.

## What works

- Six missions, each with classical and jazz instructions and audio examples.
- Two-minute and eight-minute sessions: listen, copy, change, play, and reflect.
- A local piano-style synth with adjustable backing tempo and volume.
- Three free-play settings and small creative prompts.
- Optional written reflections, difficulty ratings, and a practice history.
- Browser storage for preferences and the most recent 500 sessions.
- Automatic pause when the tab becomes hidden, and confirmation before leaving an unfinished session.
- Keyboard controls, reduced-motion support, and layouts for phones, tablets, and desktops.

Sound starts only after a button press. The example plays without backing so it is easy to hear. Backing resumes after the example if a session is running and accompaniment is on. Turn accompaniment off to work on your own left-hand pattern.

Session history records actual timer time, not the selected session length. Moving to the next step does not add unplayed minutes. Free play is not timed or saved. A difficult rating suggests revisiting that mission; other ratings suggest the next unvisited mission. Tempo and note count are adjusted by the player, not automatically.

## Privacy and limits

There is no account, backend, analytics, microphone access, note detection, or audio recording. The app cannot assess how you played. Progress is stored only in this browser and is not synced or backed up. Clearing site data removes it. Written notes are optional. Audio uses a synthesized piano-like sound, not an acoustic piano recording.

The interface uses Google Fonts with system-font fallbacks. Audio does not need network access. This prototype is not an installable offline app.

## Checks

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests cover desktop, tablet, and phone layouts. They test audio scheduling, session controls, navigation safety, reflection persistence, and storage errors. Test audio is muted at the browser output. The browser test server uses `127.0.0.1:5173`; ensure that port is free or belongs to this app before running it.

## Main files

- `src/music.ts`: missions, demonstrations, harmony, and timing.
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
