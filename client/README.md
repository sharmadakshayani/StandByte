# StandByte — Focus Timer & Productivity Tracker

A web-based Pomodoro-style focus timer that tracks your productivity, detects distractions (tab switches), and helps you build better work habits.

## Features

### Focus Session
- **Configurable timer** — choose from 15, 25, 30, 45, or 60 minute focus sessions
- **Circular progress ring** — visual SVG indicator showing time elapsed
- **Tab-switch detection** — automatically detects when you leave the tab during a session
- **Forgive prompt** — asks if the tab switch was work-related; forgives based on your site settings
- **Adaptive focus limits** — timer adjusts based on distraction count (more distractions → shorter next session)
- **Keyboard shortcut** — press `Space` to start/pause
- **Browser notifications** — notifies you when it's break time

### Break System
- **Break modal overlay** — full-screen overlay with countdown when break starts
- **Configurable break duration** — 3, 5, 10, or 15 minute breaks
- **Skip option** — skip break and return to focus mode
- **Auto-reset** — session automatically resets when break ends

### Dashboard
- **6 stat cards** — Total Focus Time, Total Distractions, Productivity Score, Sessions Completed, Best Session, Average Distractions
- **Bar charts** — visual charts for focus time and distractions across recent sessions
- **Session history** — scrollable list of past sessions with timestamps
- **Empty state** — friendly CTA when no sessions exist yet

### Settings
- **Timer configuration** — set focus and break durations
- **Site distraction toggles** — mark sites (YouTube, Netflix, Spotify, etc.) as "don't count" for work use
- **Danger zone** — clear all data with confirmation dialog

### Persistence
- All data persists in `localStorage` — analytics, session history, and site settings survive page refreshes

## Project Structure

```
src/
├── App.js                    # Root: routing, global state, persistence
├── index.js                  # Entry point
├── index.css                 # Complete design system
├── components/
│   ├── Navbar.js             # Top navigation with responsive hamburger
│   ├── Footer.js             # App footer
│   ├── CircularProgress.js   # Reusable SVG progress ring
│   ├── StatsCard.js          # Dashboard stat card
│   ├── MiniBarChart.js       # CSS bar chart for dashboard
│   ├── BreakModal.js         # Break time overlay modal
│   └── ForgivePrompt.js      # Tab-switch forgive dialog
├── pages/
│   ├── dashboard.js          # Analytics dashboard
│   ├── Session.js            # Focus timer session
│   ├── Settings.js           # App settings
│   └── NotFound.js           # 404 page
└── lib/
    ├── analyticsStorage.js   # localStorage for analytics + sessions
    ├── distractionSites.js   # Site config, constants, site settings storage
    ├── formatTime.js         # Time formatting helpers
    ├── Icons.js              # SVG icon components
    └── useDocumentTitle.js   # Dynamic document title hook
```

## Getting Started

```bash
npm install
npm start
```

Opens at [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **React 19** with hooks
- **React Router v7** for client-side routing
- **DM Sans** + **JetBrains Mono** typography
- **Pure CSS** design system (no Bootstrap dependency)
- **localStorage** for persistence
- **SVG** circular progress components

## Build

```bash
npm run build
```

Produces optimized static files in `build/`.
