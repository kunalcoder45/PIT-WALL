# PIT WALL — F1 Season Tracker

Personal-use F1 dashboard built with **Next.js 16 (App Router) + Tailwind CSS v4**, powered entirely by the free, no-auth **[OpenF1 API](https://openf1.org)**.

## Features

- **Home** — countdown timer to the next race's lights-out, circuit preview, top-3 drivers/constructors snapshot, upcoming races strip.
- **/races** — full season calendar with round number, circuit thumbnail, location and status (upcoming / live / finished).
- **/races/[meetingKey]** — race weekend detail: circuit image + type, track/air temperature, full session schedule (FP1/2/3, Sprint, Qualifying, Race with dates & times), qualifying results (grid order + best lap), race results (finishing order, gap/time, laps, DNF/DNS/DSQ).
- **/standings** — Drivers' and Constructors' championship standings (points, position, movement vs. start of the last race) with driver photos and team colours.
- **/teams** — every constructor with its current driver lineup and points.

All data comes live from `api.openf1.org` — nothing is hardcoded. Pages are cached with Next.js `revalidate` (15–30 min, matching how often OpenF1 itself refreshes) so the free-tier rate limit (3 req/s, 30 req/min) is never hit under normal browsing.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> Note: this sandbox's network doesn't allow reaching `api.openf1.org`, so I couldn't load real data while building here — but the app was built, linted and compiled cleanly against the live API's documented shape. Once you run it on your own machine (with normal internet access) it will pull real race data.

## Project structure

```
src/
  lib/openf1.ts          → typed OpenF1 API client + formatting helpers
  components/
    CountdownTimer.tsx    → client-side lights-out countdown
    RaceCard.tsx          → calendar row
    StatusPill.tsx        → live/upcoming/finished badge
    ResultsTable.tsx       → qualifying & race result tables
  app/
    page.tsx              → home
    races/page.tsx         → full calendar
    races/[meetingKey]/    → race weekend detail
    standings/page.tsx     → championship tables
    teams/page.tsx         → constructors + drivers
```

## Changing the season

The app defaults to the current season via `CURRENT_SEASON` in `src/lib/openf1.ts` — change that one constant to browse a different year (OpenF1 has data from 2023 onward).

## Notes

- Unofficial fan project, not affiliated with F1, FIA, or Formula One Management — same disclaimer OpenF1 itself carries.
- Image domains (`media.formula1.com`, `www.formula1.com`, driver headshots) are whitelisted in `next.config.ts` for `next/image`.
