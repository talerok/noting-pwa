# Noting PWA

Web port of [Noting for iOS](https://github.com/talerok/noting-swift) — a privacy-focused, encrypted note-taking app that works entirely in the browser.

**[Open App](https://talerok.github.io/noting-pwa/)**

## Features

- **Offline-first** — all data stored locally via OPFS, no server required
- **Per-note encryption** — AES-GCM with PBKDF2 key derivation, compatible with the iOS version
- **Dropbox sync** — optional cloud sync with conflict resolution
- **PWA** — installable, works offline with service worker
- **Dark mode** — system, light, and dark themes
- **i18n** — English and Russian

## Tech Stack

Svelte 5 · TypeScript · Tailwind CSS 4 · Vite · Workbox

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## License

[MIT](LICENSE)
