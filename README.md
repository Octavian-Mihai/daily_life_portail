# Daily Portail

A personal daily-tracking app for macOS: habits, homework, calendar and reading, with a warm paper/journal look. Everything is stored locally on your Mac.

## Features

- **Today** – one-screen dashboard: today's habits, homework due and overdue (plus the next 7 days), today's events, and reading progress.
- **Habits** – daily check-off, current and best streak, 12-week heatmap, optional weekday schedules.
- **Homework** – assignments with subject, due date, priority, notes/checklist; filter by status and subject; overdue highlighting.
- **Calendar** – month grid with your own events; open homework due dates appear as ring markers.
- **Reading** – books with page progress, a daily page goal, and a quick "Log pages" action.
- **Import** – load a Pomodoro Logger JSON export into Homework (see below).
- Light and dark themes follow the system setting.

## Install

Download the latest `.dmg` from the [Releases](https://github.com/Octavian-Mihai/daily_life_portail/releases) page, open it, and drag **Daily Portail** to Applications.

The builds are **Apple Silicon (arm64) only** and **unsigned**, so on first launch right-click the app and choose **Open**.

## Importing from Pomodoro Logger

On the Homework tab, click **Import…** and pick a Pomodoro Logger export (`.json`).

| Pomodoro Logger | Daily Portail |
| --- | --- |
| Board | Subject |
| Card | Assignment (title, due date) |
| Card in the board's Done list, or fully ticked checklist | Done |
| Card content (`[ ] item` lines) | Notes / checklist |

Every imported assignment gets Medium priority. Re-importing a file skips cards that were already imported, and never overwrites tasks you have edited or completed. Focus-session records in the export are not imported.

## Data

All data lives in one JSON file in the app's user-data folder:

```
~/Library/Application Support/daily-portail/portail-data.json
```

Back it up by copying that file. (When the renderer is opened in a plain browser instead of Electron, it falls back to `localStorage`.)

## Development

Requires Node.js.

```bash
npm install
npm start        # run the app
npm run dist     # build dist/Daily Portail-<version>-arm64.dmg
```

### Project layout

```
main.js, preload.js     Electron main process and the storage bridge
renderer/               UI (plain HTML/CSS/JS, no build step)
  store.js              load/save state
  ui.js                 DOM helpers, date helpers, modal forms
  today.js habits.js homework.js calendar.js reading.js   one module per tab
  import.js             Pomodoro Logger parser (also runs under node)
build/                  app icon (icon.svg → icon.png → icon.icns)
```

### Regenerating the app icon

Edit `build/icon.svg`, then:

```bash
npx electron build/make-icon.js && sh build/make-icon.sh
```

## License

MIT
