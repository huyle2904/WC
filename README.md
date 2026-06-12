# World Cup 2026 Visualizer

Static web app for visualizing the FIFA World Cup 2026 schedule, group stage, standings, match predictions, team strength, squad value, and key players.

## Features

- Full World Cup 2026 fixture list from openfootball via jsDelivr
- ESPN live score overlay when available
- Group-stage standings
- Daily schedule view
- Match detail view with:
  - educational prediction probabilities
  - FIFA-ranking strength comparison
  - squad value comparison
  - key players
- Static frontend only, ready for Vercel deployment

## Run locally

Use any static file server. For example:

```bash
npx serve .
```

Or with Python:

```bash
python -m http.server 5174
```

Open:

```text
http://localhost:5174
```

## Deploy on Vercel

Import this repository as a static site:

- Framework Preset: **Other**
- Build Command: leave empty
- Output Directory: `.`
- Install Command: leave empty

Do not set a Serverless Function entry point. This project only needs `index.html` and static assets.

## Notes

This project is for educational/statistical visualization only. It is not related to betting or gambling.
