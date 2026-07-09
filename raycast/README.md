# didiff · Raycast

Fast launcher for the [didiff](../) local PWA.

## Setup

1. Run the web app (from repo root):

   ```bash
   npm run build && npm run preview
   # → http://127.0.0.1:4173
   ```

2. Install this extension:

   ```bash
   cd raycast
   npm install
   npm run dev
   ```

   In Raycast: **Import Extension** → select this `raycast/` folder.

3. Preferences → **didiff URL** (default `http://localhost:4173`).

## Commands

| Command | Mode | Behavior |
| --- | --- | --- |
| Open didiff | no-view | Opens the PWA immediately |
| Diff Texts | form | Paste original + modified, hand off to the app |
| Diff Clipboard into didiff | no-view | Clipboard → original pane |

Handoff for larger texts uses a clipboard envelope (`__DIDIFF_V1__` + JSON) that the PWA reads on `?import=1`.
