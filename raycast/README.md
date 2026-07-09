# didiff · Raycast

Fast launcher for the [didiff](../) local PWA.

## Setup

1. Default URL points at production: `https://difdif-production.up.railway.app`  
   (or run locally with `npm run build && npm run preview` and override the pref).

2. Install this extension:

   ```bash
   cd raycast
   npm install
   npm run dev
   ```

   In Raycast: **Import Extension** → select this `raycast/` folder.

3. Preferences → **didiff URL** if you need a non-default origin.

## Commands

| Command | Mode | Behavior |
| --- | --- | --- |
| Open didiff | no-view | Opens the PWA immediately |
| Diff Texts | form | Paste original + modified, hand off to the app |
| Diff Clipboard into didiff | no-view | Clipboard → original pane |

Handoff for larger texts uses a clipboard envelope (`__DIDIFF_V1__` + JSON) that the PWA reads on `?import=1`.
