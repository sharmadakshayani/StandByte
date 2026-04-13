# StandByte — Full-Stack Focus Timer (MongoDB)

A Pomodoro-style focus timer with proctored sessions, streak tracking, and productivity analytics. Full-stack React + Node.js + MongoDB application.

## Architecture

```
standbyte-mongo/
├── client/                React frontend (port 3000)
│   └── src/
│       ├── App.js             Routing, backend sync, global state
│       ├── pages/             Dashboard, Session, Settings, NotFound
│       ├── components/        Navbar, ProctorMode, EscapeWarning, etc.
│       └── lib/
│           ├── api.js         REST client
│           ├── fullscreen.js  Cross-browser fullscreen helpers
│           └── ...
│
└── server/                Express + MongoDB backend (port 4000)
    ├── src/
    │   ├── index.js           Express entry point
    │   ├── db.js              Mongoose connection helper
    │   ├── models/
    │   │   ├── Analytics.js   Singleton stats document
    │   │   ├── Session.js     Focus session records
    │   │   └── Setting.js     Key/value preferences
    │   └── routes/
    │       ├── analytics.js   /api/analytics endpoints
    │       ├── sessions.js    /api/sessions endpoints
    │       └── settings.js    /api/settings endpoints
    ├── .env.example           Template for environment variables
    └── package.json
```

## Technology Stack

**Frontend:** React 19, React Router v7, Fetch API, pure CSS

**Backend:** Node.js, Express 4, Mongoose 8, dotenv, cors

**Database:** MongoDB (local or Atlas cloud)

## Prerequisites

1. **Node.js 18+** — [nodejs.org](https://nodejs.org/) (check: `node --version`)
2. **MongoDB** — either:
   - **Atlas (cloud, recommended):** free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) — M0 free tier, no install needed
   - **Local install:** [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community) — must be running on `localhost:27017`

## Setup

### Step 1 — Get a MongoDB connection string

**If using Atlas:**

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 tier)
3. In the "Database Access" section, create a user with a username + password
4. In "Network Access," add `0.0.0.0/0` to allow connections from anywhere (fine for dev)
5. Click "Connect" on your cluster → "Drivers" → copy the connection string, which looks like:
   ```
   mongodb+srv://YOUR_USER:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password and append `/standbyte` before the `?`:
   ```
   mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/standbyte?retryWrites=true&w=majority
   ```

**If using local MongoDB:**

1. Install MongoDB Community Server from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Start it (auto-starts on Mac with Homebrew; on Windows it's a service; on Linux it's `sudo systemctl start mongod`)
3. Your connection string is just `mongodb://localhost:27017/standbyte`

### Step 2 — Configure the server

```bash
cd server
cp .env.example .env
```

Then open `.env` in a text editor and set `MONGODB_URI` to your connection string from Step 1.

### Step 3 — Start the backend

```bash
cd server
npm install
npm start
```

You should see:

```
[db] MongoDB connected → cluster0-xxxxx.mongodb.net/standbyte
[db] Default settings seeded
[server] StandByte API listening on http://localhost:4000
```

Leave this terminal running.

### Step 4 — Start the frontend

Open a **second terminal**:

```bash
cd client
npm install
npm start
```

The app opens at `http://localhost:3000`. You'll see a brief loading spinner while it fetches initial state, then the dashboard renders.

## REST API Reference

Base URL: `http://localhost:4000/api`

### Analytics

| Method | Path | Description |
|---|---|---|
| `GET` | `/analytics` | Current cumulative stats |
| `POST` | `/analytics/distraction` | Increment distraction counter |
| `POST` | `/analytics/focus-time` | Add to total focus time — body: `{ seconds }` |
| `POST` | `/analytics/complete` | Record completion + bump streak — body: `{ seconds }` |
| `POST` | `/analytics/break-streak` | Reset current streak to 0 |
| `POST` | `/analytics/reset` | Wipe all analytics |

### Sessions

| Method | Path | Description |
|---|---|---|
| `GET` | `/sessions` | List all sessions (oldest first) |
| `POST` | `/sessions` | Create session — body: `{ focusTime, distractions, proctored, completed, timestamp }` |
| `DELETE` | `/sessions` | Wipe all sessions |

### Settings

| Method | Path | Description |
|---|---|---|
| `GET` | `/settings` | All user settings as a typed object |
| `PATCH` | `/settings` | Update any subset of settings |

## MongoDB Collections

Three collections in the `standbyte` database:

### `analytics` (singleton)

Exactly one document. Fields:
- `totalFocusTime` — cumulative focus seconds (all sessions)
- `totalDistractions` — lifetime distraction count
- `productiveFocusTime` — focus seconds from completed sessions only
- `currentStreak` — consecutive completed sessions
- `bestStreak` — all-time best streak
- `completedSessions` — count of fully-completed sessions

### `sessions`

One document per session:
- `focusTime` — duration in seconds
- `distractions` — distraction count during session
- `proctored` — boolean
- `completed` — boolean
- `timestamp` — unix milliseconds

Indexed on `timestamp` for fast chronological queries.

### `settings`

Key/value store. Keys: `focusLimit`, `breakLimit`, `proctoredEnabled`, `siteSettings`.

## Inspecting Your Data

**Atlas:** go to your cluster in the Atlas dashboard → "Browse Collections" button. You'll see the three collections with all their documents. You can run aggregation queries right in the browser.

**Local MongoDB:** use MongoDB Compass (free GUI, download from mongodb.com/products/compass), connect to `mongodb://localhost:27017`, open the `standbyte` database, and browse the collections.

**CLI:** `mongosh mongodb://localhost:27017/standbyte` then run things like `db.sessions.find().sort({timestamp: -1}).limit(5)` to see your 5 most recent sessions.

Great for project demos: show the Atlas dashboard with real documents being created as you complete sessions in the app.

## Common Issues

**`[db] MongoDB connection failed`** — your connection string is wrong or MongoDB isn't running. Check `.env` and make sure `MONGODB_URI` is set correctly. For Atlas, verify you added `0.0.0.0/0` to network access. For local, verify MongoDB is running (`mongosh` should connect).

**`Couldn't reach the StandByte server` red banner in client** — the backend isn't running or crashed. Check the server terminal.

**`MongoServerError: bad auth`** — wrong password in your Atlas connection string. Remember to replace `<password>` with your actual DB user password (not your Atlas account password).

**Port 4000 already in use** — change `PORT` in `.env` to something else (e.g. 4001), and make sure the client is pointed at the new port via `REACT_APP_API_URL`.

**`npm install` fails in client** — usually a Node version issue. Make sure you're on Node 18+.
