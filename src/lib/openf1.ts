// Thin client for the OpenF1 API (https://openf1.org).
// Free tier: no auth, historical data since 2023, 3 req/s limit.
// We cache aggressively with Next.js `fetch` revalidation to stay well under that.

const BASE = process.env.NEXT_PUBLIC_OPENF1_URL!;

export interface Meeting {
  circuit_key: number;
  circuit_image: string;
  circuit_info_url: string;
  circuit_short_name: string;
  circuit_type: "Permanent" | "Temporary - Street" | "Temporary - Road";
  country_code: string;
  country_flag: string;
  country_key: number;
  country_name: string;
  date_end: string;
  date_start: string;
  gmt_offset: string;
  is_cancelled: boolean;
  location: string;
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  year: number;
}

export interface Session {
  circuit_key: number;
  circuit_short_name: string;
  country_code: string;
  country_key: number;
  country_name: string;
  date_end: string;
  date_start: string;
  gmt_offset: string;
  is_cancelled: boolean;
  location: string;
  meeting_key: number;
  session_key: number;
  session_name: string;
  session_type: "Practice" | "Qualifying" | "Sprint" | "Sprint Qualifying" | "Race" | string;
  year: number;
}

export interface Driver {
  broadcast_name: string;
  driver_number: number;
  first_name: string;
  full_name: string;
  headshot_url: string;
  last_name: string;
  meeting_key: number;
  name_acronym: string;
  session_key: number;
  team_colour: string;
  team_name: string;
}

export interface SessionResult {
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
  driver_number: number;
  duration: number | number[] | null;
  gap_to_leader: number | string | (number | string | null)[] | null;
  number_of_laps: number | null;
  meeting_key: number;
  position: number | null;
  session_key: number;
}

export interface StartingGridEntry {
  position: number;
  driver_number: number;
  lap_duration: number | null;
  meeting_key: number;
  session_key: number;
}

export interface DriverChampionship {
  driver_number: number;
  meeting_key: number;
  points_current: number;
  points_start: number;
  position_current: number;
  position_start: number;
  session_key: number;
}

export interface TeamChampionship {
  meeting_key: number;
  points_current: number;
  points_start: number;
  position_current: number;
  position_start: number;
  session_key: number;
  team_name: string;
}

export interface Weather {
  air_temperature: number;
  date: string;
  humidity: number;
  meeting_key: number;
  pressure: number;
  rainfall: number;
  session_key: number;
  track_temperature: number;
  wind_direction: number;
  wind_speed: number;
}

// revalidate: seconds to cache the response for (Next.js ISR-style caching on fetch).
async function get<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
  revalidate = 3600
): Promise<T[]> {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") search.set(k, String(v));
  }
  const qs = search.toString();
  const url = `${BASE}/${path}${qs ? `?${qs}` : ""}`;

  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export const CURRENT_SEASON = 2026;

export const openf1 = {
  meetings: (year: number = CURRENT_SEASON) => get<Meeting>("meetings", { year }),
  meeting: (meetingKey: number) => get<Meeting>("meetings", { meeting_key: meetingKey }, 86400),
  sessions: (meetingKey: number) => get<Session>("sessions", { meeting_key: meetingKey }, 1800),
  sessionsByYear: (year: number = CURRENT_SEASON, sessionName?: string) =>
    get<Session>("sessions", { year, session_name: sessionName }, 1800),
  drivers: (sessionKey: number | "latest") => get<Driver>("drivers", { session_key: sessionKey }, 3600),
  sessionResult: (sessionKey: number) => get<SessionResult>("session_result", { session_key: sessionKey }, 300),
  startingGrid: (sessionKey: number) => get<StartingGridEntry>("starting_grid", { session_key: sessionKey }, 300),
  championshipDrivers: (sessionKey: number) =>
    get<DriverChampionship>("championship_drivers", { session_key: sessionKey }, 300),
  championshipTeams: (sessionKey: number) =>
    get<TeamChampionship>("championship_teams", { session_key: sessionKey }, 300),
  weather: (meetingKey: number) => get<Weather>("weather", { meeting_key: meetingKey }, 1800),
  location: fetchLocation,
};

// ---- helpers ----

export function fmtDate(
  iso: string,
  opts?: Intl.DateTimeFormatOptions
) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
    ...opts,
  }).format(new Date(iso));
}
export function fmtTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
    timeZoneName: "short",
  }).format(new Date(iso));
}
export function fmtDuration(seconds: number | null | undefined) {
  if (seconds === null || seconds === undefined) return "—";
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(3).padStart(6, "0");
  return m > 0 ? `${m}:${s}` : `${s}s`;
}

export function fmtGap(gap: number | string | null | undefined) {
  if (gap === null || gap === undefined) return "—";
  if (typeof gap === "string") return gap;
  return `+${gap.toFixed(3)}`;
}

/** Sessions ordered logically within a race weekend. */
export const SESSION_ORDER = [
  "Practice 1",
  "Practice 2",
  "Practice 3",
  "Sprint Qualifying",
  "Sprint",
  "Qualifying",
  "Race",
];

export function sortSessions(sessions: Session[]) {
  return [...sessions].sort((a, b) => {
    const ai = SESSION_ORDER.indexOf(a.session_name);
    const bi = SESSION_ORDER.indexOf(b.session_name);
    if (ai !== -1 && bi !== -1) return ai - bi;
    return new Date(a.date_start).getTime() - new Date(b.date_start).getTime();
  });
}

/** Finds the most recently completed Race session of the season, used to pull
 * up-to-date championship standings (the championship_* endpoints are keyed
 * off a race session). */
export async function latestCompletedRaceSession(year: number = CURRENT_SEASON) {
  const races = await openf1.sessionsByYear(year, "Race");
  const now = Date.now();
  const completed = races
    .filter((s) => new Date(s.date_start).getTime() < now)
    .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime());
  return completed[0] ?? races[0] ?? null;
}

export function meetingStatus(meeting: Meeting): "done" | "live" | "upcoming" {
  const now = Date.now();
  const start = new Date(meeting.date_start).getTime();
  const end = new Date(meeting.date_end).getTime();
  if (now < start) return "upcoming";
  if (now > end) return "done";
  return "live";
}


// ── Location telemetry (add to existing openf1 object / file) ──

export interface LocationPoint {
  date: string;
  driver_number: number;
  meeting_key: number;
  session_key: number;
  x: number;
  y: number;
  z: number;
}

export interface Lap {
  date_start: string;
  driver_number: number;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  lap_duration: number | null;
  lap_number: number;
  meeting_key: number;
  session_key: number;
  is_pit_out_lap: boolean;
}

// Fetches raw (x, y, z) car-position samples for a session, optionally
// windowed by time so we don't pull an entire race's worth of telemetry.
async function fetchLocation(
  sessionKey: number,
  opts: { dateGte?: string; dateLte?: string; driverNumber?: number } = {}
): Promise<LocationPoint[]> {
  if (!sessionKey || Number.isNaN(sessionKey)) return [];

  // Build the query string manually — OpenF1's range filters use the
  // operator as part of the param *name* itself (e.g. "date>=2024-01-01..."),
  // so URLSearchParams (which percent-encodes '>' and '=') would break it.
  const parts = [`session_key=${sessionKey}`];
  if (opts.dateGte) parts.push(`date>=${encodeURIComponent(opts.dateGte)}`);
  if (opts.dateLte) parts.push(`date<=${encodeURIComponent(opts.dateLte)}`);
  if (opts.driverNumber) parts.push(`driver_number=${opts.driverNumber}`);

  const url = `https://api.openf1.org/v1/location?${parts.join("&")}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // historic telemetry never changes — cache hard
    });

    if (!res.ok) {
      // 404 here usually means this session predates OpenF1's location
      // coverage, or the window has no samples — treat as "no data",
      // don't crash the page for it.
      console.warn(`OpenF1 location: ${res.status} for session ${sessionKey}`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("OpenF1 location fetch error:", err);
    return [];
  }
}

// Merge this into your existing `openf1` export object:
// export const openf1 = { ...existingMethods, location: fetchLocation };