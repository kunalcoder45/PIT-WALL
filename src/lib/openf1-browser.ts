import type { Session, Driver, Lap, LocationPoint } from "./openf1";
import { addToQueue } from "./rateLimiter";

const BASE = process.env.NEXT_PUBLIC_OPENF1_URL!;

async function get<T>(path: string, query: Record<string, string | number | undefined>): Promise<T[]> {
    const parts = Object.entries(query)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`);
    try {
        // const res = await fetch(`${BASE}/${path}?${parts.join("&")}`);
        const res = await addToQueue(() =>
            fetch(`${BASE}/${path}?${parts.join("&")}`)
        );
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

export interface CarData {
    date: string;
    driver_number: number;
    meeting_key: number;
    session_key: number;
    speed: number; // km/h — direct from the car's ECU, no derivation needed
    throttle: number;
    brake: number;
    drs: number;
    n_gear: number;
    rpm: number;
}

export const openf1Browser = {
    sessions: (meetingKey: number) => get<Session>("sessions", { meeting_key: meetingKey }),
    drivers: (sessionKey: number) => get<Driver>("drivers", { session_key: sessionKey }),
    laps: (sessionKey: number) => get<Lap>("laps", { session_key: sessionKey }),

    // Manual query string — OpenF1 range filters need the operator inside the
    // param NAME (date>=, date<=), which URLSearchParams would percent-encode
    // and break.
    location: async (sessionKey: number, dateGte: string, dateLte: string): Promise<LocationPoint[]> => {
        const q = `session_key=${sessionKey}&date>=${encodeURIComponent(dateGte)}&date<=${encodeURIComponent(dateLte)}`;
        try {
            // const res = await fetch(`${BASE}/location?${q}`);
            const res = await addToQueue(() =>
                fetch(`${BASE}/location?${q}`)
            );
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    },
    carData: async (
        sessionKey: number,
        dateGte: string,
        dateLte: string,
        driverNumbers: number[] = []
    ): Promise<CarData[]> => {
        // Fetching car_data for ALL drivers in one request is heavy enough that
        // OpenF1 sometimes times out / errors silently. Fetching per-driver in
        // parallel is smaller per-request and much more reliable.
        if (driverNumbers.length === 0) return [];

        // const results = await Promise.all(
        //     driverNumbers.map(async (num) => {
        //         const q = `session_key=${sessionKey}&driver_number=${num}&date>=${encodeURIComponent(
        //             dateGte
        //         )}&date<=${encodeURIComponent(dateLte)}`;
        //         try {
        //             const res = await fetch(`${BASE}/car_data?${q}`);
        //             if (!res.ok) {
        //                 console.warn(`car_data fetch failed for driver ${num}: ${res.status}`);
        //                 return [];
        //             }
        //             const data = await res.json();
        //             return Array.isArray(data) ? (data as CarData[]) : [];
        //         } catch (err) {
        //             console.warn(`car_data fetch error for driver ${num}:`, err);
        //             return [];
        //         }
        //     })
        // );

        // return results.flat();

        const results = await Promise.all(
            driverNumbers.map((num) =>
                addToQueue(async () => {
                    const q =
                        `session_key=${sessionKey}&driver_number=${num}&date>=${encodeURIComponent(
                            dateGte
                        )}&date<=${encodeURIComponent(dateLte)}`;

                    try {
                        const res = await fetch(
                            `${BASE}/car_data?${q}`
                        );

                        if (!res.ok) {
                            console.warn(
                                `car_data failed ${num}: ${res.status}`
                            );
                            return [];
                        }

                        const json = await res.json();

                        return Array.isArray(json)
                            ? (json as CarData[])
                            : [];

                    } catch (error) {

                        console.warn(
                            "car_data error",
                            error
                        );

                        return [];
                    }
                })
            )
        );
        return results.flat();
    },
};

