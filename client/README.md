# StandByte — Focus & Productivity

A modern web app to track focus time, reduce distractions, and build better work habits. Built with React and Bootstrap.

## Features

- **Focus sessions** — Set a focus target (in seconds). The timer runs until you hit the target, then triggers a short break.
- **Tab-switch detection** — Leaving the tab during a focus session counts as a distraction and updates your stats in real time.
- **Work-related forgiveness** — When you return, you can mark a tab switch as work-related (or pick a site you use for work). Sites like YouTube, Netflix, Spotify, etc. can be set in Settings to “don’t count” so choosing them in the prompt won’t add to your distraction total.
- **Adaptive focus length** — Fewer distractions reward you with a longer next focus target; many distractions shorten it.
- **Dashboard** — View total focus time, total distractions, and a productivity score. Stats persist across refreshes (stored in the browser).
- **Break notifications** — Optional browser notification when it’s time for a break.
- **Keyboard shortcut** — Press **Space** on the Session page to start or pause the timer (when not in a form field).
- **404 page** — Unknown routes show a friendly “Page not found” with a link back to the dashboard.
- **Responsive UI** — Layout and circular progress ring adapt to small screens.

## How to run

```bash
cd client
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000). Build for production with `npm run build`.

## Tech stack

- React 19
- React Router 7
- Bootstrap 5
- No extra UI libraries; custom CSS for gradients, progress ring, and polish.

## Project structure

- `src/App.js` — Router, global state (timer, analytics, site settings), document title, footer.
- `src/pages/` — Dashboard, Session, Settings, NotFound.
- `src/components/` — Navbar, Footer.
- `src/lib/` — `distractionSites.js` (site list + localStorage), `analyticsStorage.js` (persist focus time & distractions).
- `src/hooks/` — `useDocumentTitle.js` (optional).
- `src/index.css` — Design tokens, card/button/ring styles, focus-visible and responsive rules.

## License

MIT.
