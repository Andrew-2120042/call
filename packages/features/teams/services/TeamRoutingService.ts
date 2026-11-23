import dayjs from "@calcom/dayjs";
import { ErrorWithCode } from "@calcom/lib/errors";

export type RouteRequest = {
  teamName: string;
  services: {
    slug: string;
    title: string;
    length: number;
    description: string | null;
    schedulingType?: string | null;
    /** Who hosts the service; null or missing means every member does. */
    hostIds?: number[] | null;
  }[];
  members: { username: string; name: string }[];
  message: string;
  /** The visitor's current local time and zone, so "Sunday 3pm" can be resolved to a date. */
  now: string;
  timeZone: string;
};

export type RouteDecision = {
  serviceSlug: string | null;
  memberUsername: string | null;
  reason: string;
  /** Local date-time the visitor asked about ("YYYY-MM-DDTHH:mm"), or null when they didn't ask about a time. */
  requestedTime?: string | null;
};
export type TeamRouter = (input: RouteRequest) => Promise<RouteDecision | null>;

type PublicTeamPage = {
  team: { id: number; name: string; slug: string | null; aiRoutingEnabled?: boolean };
  services: {
    slug: string;
    title: string;
    length: number;
    description: string | null;
    schedulingType?: string | null;
  }[];
  members: { id: number; username: string | null; name: string | null }[];
};

export type RoutingAvailability = {
  start: string;
  isPast: boolean;
  free: { username: string; name: string }[];
  /** Opens the service's booking page on that exact time; null when nobody (or not everyone needed) is free. */
  bookUrl: string | null;
};

export type RoutingResult = {
  service: { slug: string; title: string; url: string } | null;
  member: { username: string; name: string; url: string } | null;
  reason: string;
  availability: RoutingAvailability | null;
};

const MAX_MESSAGE = 1000;

/** "Not sure who to book?" on a team page: the visitor describes their need and gets pointed at a service. */
export class TeamRoutingService {
  constructor(
    private readonly deps: {
      getPublicPage: (slug: string) => Promise<PublicTeamPage | null>;
      router: TeamRouter | null;
      /** Which of these members are free for the whole window (working hours minus bookings and calendars). */
      findFreeMembers?: (params: { memberIds: number[]; start: Date; end: Date }) => Promise<number[]>;
    }
  ) {}

  get isEnabled() {
    return !!this.deps.router;
  }

  async route({
    teamSlug,
    message,
    timeZone = "UTC",
    now = new Date(),
  }: {
    teamSlug: string;
    message: string;
    timeZone?: string;
    now?: Date;
  }): Promise<RoutingResult | null> {
    const text = message.trim().slice(0, MAX_MESSAGE);
    if (!this.deps.router || text.length < 3) return null;
    const page = await this.deps.getPublicPage(teamSlug);
    if (!page || !page.services.length) return null;
    if (page.team.aiRoutingEnabled === false)
      throw ErrorWithCode.Factory.NotFound("Not available for this team");
    const members = page.members
      .filter((m): m is { id: number; username: string; name: string | null } => !!m.username)
      .map((m) => ({ id: m.id, username: m.username, name: m.name ?? m.username }));
    const zone = isValidZone(timeZone) ? timeZone : "UTC";

    const decision = await this.deps.router({
      teamName: page.team.name,
      services: page.services.map(({ hostIds: _hostIds, ...service }) => service),
      members: members.map(({ username, name }) => ({ username, name })),
      message: text,
      now: dayjs(now).tz(zone).format("dddd D MMMM YYYY, HH:mm"),
      timeZone: zone,
    });
    if (!decision) return null;

    // The model can only pick from what we gave it; anything else is dropped rather than trusted.
    const service = page.services.find((s) => s.slug === decision.serviceSlug) ?? null;
    const member = members.find((m) => m.username === decision.memberUsername) ?? null;
    const serviceUrl = service ? `/team/${page.team.slug}/${service.slug}` : null;

    return {
      service: service && serviceUrl ? { slug: service.slug, title: service.title, url: serviceUrl } : null,
      member: member ? { username: member.username, name: member.name, url: `/${member.username}` } : null,
      reason: decision.reason,
      availability: await this.availabilityFor({ decision, service, serviceUrl, members, member, zone, now }),
    };
  }

  /** When the visitor asked about a specific time: who's free then, and a link that books exactly that time. */
  private async availabilityFor(params: {
    decision: RouteDecision;
    service: PublicTeamPage["services"][number] | null;
    serviceUrl: string | null;
    members: { id: number; username: string; name: string }[];
    member: { id: number; username: string; name: string } | null;
    zone: string;
    now: Date;
  }): Promise<RoutingAvailability | null> {
    const { decision, service, serviceUrl, members, member, zone, now } = params;
    if (!decision.requestedTime || !this.deps.findFreeMembers || !members.length) return null;
    const start = dayjs.tz(decision.requestedTime, zone);
    if (!start.isValid()) return null;
    if (start.isBefore(now)) return { start: start.toISOString(), isPast: true, free: [], bookUrl: null };

    const end = start.add(service?.length ?? 30, "minute");
    // Only people who host the suggested service can take it, so don't offer anyone else as "free".
    const hostIds = service?.hostIds?.length ? new Set(service.hostIds) : null;
    const candidates = member ? [member] : hostIds ? members.filter((m) => hostIds.has(m.id)) : members;
    if (!candidates.length) return { start: start.toISOString(), isPast: false, free: [], bookUrl: null };
    let freeIds: number[] = [];
    try {
      freeIds = await this.deps.findFreeMembers({
        memberIds: candidates.map((m) => m.id),
        start: start.toDate(),
        end: end.toDate(),
      });
    } catch {
      return null;
    }
    const free = candidates
      .filter((m) => freeIds.includes(m.id))
      .map(({ username, name }) => ({ username, name }));
    // A collective booking needs everyone; round robin (or a single host) needs just one.
    const enough =
      service?.schedulingType === "COLLECTIVE" ? free.length === candidates.length : free.length > 0;
    const bookUrl =
      serviceUrl && enough
        ? `${serviceUrl}?${new URLSearchParams({ date: start.format("YYYY-MM-DD"), slot: start.toISOString() })}`
        : null;
    return { start: start.toISOString(), isPast: false, free, bookUrl };
  }
}

function isValidZone(zone: string) {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}
