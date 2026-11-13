import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export type CalendlyUser = { uri: string; name: string; email: string; timezone: string };

export type CalendlyEventType = {
  uri: string;
  name: string;
  slug: string | null;
  duration: number;
  active: boolean;
  secret?: boolean;
  kind?: string;
  description_plain?: string | null;
};

export type CalendlyInterval = { from: string; to: string };
export type CalendlyRule =
  | { type: "wday"; wday: string; intervals: CalendlyInterval[] }
  | { type: "date"; date: string; intervals: CalendlyInterval[] };

export type CalendlyAvailabilitySchedule = {
  uri: string;
  name: string;
  default: boolean;
  timezone: string;
  rules: CalendlyRule[];
};

export interface ICalendlyClient {
  getMe(): Promise<CalendlyUser>;
  listEventTypes(userUri: string): Promise<CalendlyEventType[]>;
  listAvailabilitySchedules(userUri: string): Promise<CalendlyAvailabilitySchedule[]>;
}

const DEFAULT_API = "https://api.calendly.com";
const MAX_PAGES = 20;

/** Read-only client for Calendly's v2 API using the owner's personal access token (never stored). */
export function createCalendlyClient(
  token: string,
  fetchImpl: FetchLike = fetch,
  apiBaseUrl: string = DEFAULT_API
): ICalendlyClient {
  const API = apiBaseUrl.replace(/\/$/, "");
  const get = async <T>(url: string): Promise<T> => {
    const res = await fetchImpl(url, { headers: { authorization: `Bearer ${token}` } });
    if (res.status === 401 || res.status === 403) {
      throw new ErrorWithCode(
        ErrorCode.BadRequest,
        "Calendly didn't accept that token. Check it and try again."
      );
    }
    if (res.status === 429) {
      throw new ErrorWithCode(ErrorCode.BadRequest, "Calendly is rate limiting us. Try again in a minute.");
    }
    if (!res.ok) throw new ErrorWithCode(ErrorCode.InternalServerError, `Calendly returned ${res.status}`);
    return (await res.json()) as T;
  };

  const listAll = async <T>(firstUrl: string): Promise<T[]> => {
    const items: T[] = [];
    let url: string | null = firstUrl;
    for (let page = 0; url && page < MAX_PAGES; page++) {
      const body: { collection: T[]; pagination?: { next_page?: string | null } } = await get(url);
      items.push(...body.collection);
      url = body.pagination?.next_page ?? null;
    }
    return items;
  };

  return {
    async getMe() {
      const body = await get<{ resource: CalendlyUser }>(`${API}/users/me`);
      return body.resource;
    },
    listEventTypes(userUri) {
      return listAll<CalendlyEventType>(`${API}/event_types?user=${encodeURIComponent(userUri)}&count=100`);
    },
    listAvailabilitySchedules(userUri) {
      return listAll<CalendlyAvailabilitySchedule>(
        `${API}/user_availability_schedules?user=${encodeURIComponent(userUri)}`
      );
    },
  };
}
