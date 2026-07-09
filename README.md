# didiff

**Local** paste-to-paste diff checker. Minimal UI, command palette, history sidebar.

Powered by [Pierre’s `@pierre/diffs`](https://diffs.com/docs).

## Features

- Paste original + modified → character-level inline diffs
- Auto syntax highlight
- **⌘K** command palette (layout, language, theme, clear, swap…)
- History sidebar (localStorage only)
- Theme follows system by default (switch in palette)
- PWA + Raycast launcher

## UI

- One chrome control: **⌘K** (top right)
- Focus lands on **Original**; **Tab** → **Modified**
- Everything else lives in the palette (Base UI shadcn components)

## Quick start

```bash
npm install
npm run dev
npm run build && npm run preview
```

## Raycast

Point the extension at your local (or self-hosted) didiff URL. See `raycast/README.md`.

## Stack

- Vite + React + Tailwind v4
- shadcn **base-nova** (Base UI, not Radix)
- `@pierre/diffs`
