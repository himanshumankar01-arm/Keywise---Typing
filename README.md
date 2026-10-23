# Keywise Typing Trainer

A keyboard typing practice tool built with React and Vite. It gives an analytical report on speed and accuracy, and suggests exercises based on the mistakes you actually make.

## Run it

You need Node.js 18 or newer.

```bash
npm install
npm run dev        # development server, usually http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build locally
```

## What it does

| Requirement | Where to find it |
| --- | --- |
| FR-01 Typing test | **Test** tab. Correct and wrong characters are highlighted live. Restart button or the `Esc` key. |
| FR-02 Test configuration | Bar above the text: duration (15/30/60/120 s), word count (10/25/50/100), difficulty, exercise type. |
| FR-03 Live tracking | WPM, accuracy, time, correct and incorrect characters update while you type. |
| FR-04 Analytical report | **Report** tab, shown after every test: speed, accuracy, error rate, consistency, speed-over-time graph, mistake summary. |
| FR-05 Personalised suggestions | Weak keys, confused keys and missed words produce targeted drills (Report and **Practice** tabs). |
| FR-06 Progress tracking | **Progress** tab: personal bests, daily goal and streak, trend charts, keyboard heatmap, practice history, full history. |

Settings (theme, text size, caret style, live stats, daily goal, target WPM, backup and restore) are in the **Settings** tab. Everything is stored in the browser's `localStorage` under the key `keywise.v1`, so history and settings survive a refresh.

## How the numbers are calculated

- **WPM (net)** = correct characters / 5 / minutes. Characters left wrong do not count.
- **Raw WPM** = all typed characters / 5 / minutes.
- **Accuracy** = correct keystrokes / total keystrokes. A typo you fix with backspace still counts as a mistake.
- **Error rate** = 100 minus accuracy.
- **Consistency** = based on how much your per-second speed varies (needs at least 3 seconds of data).
- The timer starts on your first keystroke.

## Project layout

```
src/
  engine.js         text generators, scoring, mistake analysis, recommendations, exercises
  shared.jsx        storage, formatting helpers, SVG charts, keyboard heatmap, small components
  TestView.jsx      typing engine and live stats
  ReportView.jsx    post-test report
  PracticeView.jsx  recommended and fixed exercises
  ProgressView.jsx  bests, goals, charts, history
  SettingsView.jsx  preferences, backup, reset
  App.jsx           navigation, theme, persistence
  styles.css        design tokens (light and dark) and layout
```

There are no runtime dependencies besides React. Charts are plain SVG.
