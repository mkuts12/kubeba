# Interlude — Piano improvisation practice

**Open the app:** https://mkuts12.github.io/kubeba/piano-improv/

Short classical and jazz practice sessions for an acoustic piano. Includes audio examples, adjustable accompaniment, free play, and a practice notebook. No account or microphone is needed.

## Folder layout

- `index.html`, `assets/`, and `favicon.svg`: the built app, served by GitHub Pages.
- `source/`: the editable React and TypeScript project, including tests and its own README.

The existing site files and GitHub Pages settings are unchanged. Pages continues to publish from the root of `main`. This app uses relative asset paths so it works in this separate folder.

## Update the app

From `piano-improv/source/`:

```sh
npm ci
npm test
npm run build -- --base=./
rsync -a dist/ ../
```

Review and commit the changes in `piano-improv/`, then push to `main`. GitHub Pages will publish the updated files.

Do not copy `node_modules/` or test output into the published folder. The `source/.gitignore` excludes these files from Git.

## Local development

From `piano-improv/source/`:

```sh
npm ci
npm run dev
```

Progress stays in each browser. It does not sync between devices. Audio is synthesized; the app does not record or judge your playing. The interface loads Google Fonts, with system-font fallbacks.
