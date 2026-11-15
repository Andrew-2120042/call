export type RouteRequest = {
  teamName: string;
  services: {
    slug: string;
    title: string;
    length: number;
    description: string | null;
    schedulingType?: string | null;
  }[];
  members: { username: string; name: string }[];
  message: string;
};

export type RouteDecision = { serviceSlug: string | null; memberUsername: string | null; reason: string };
export type TeamRouter = (input: RouteRequest) => Promise<RouteDecision | null>;

type PublicTeamPage = {
  team: { name: string; slug: string | null };
  services: {
    slug: string;
    title: string;
    length: number;
    description: string | null;
    schedulingType?: string | null;
  }[];
  members: { username: string | null; name: string | null }[];
};

export type RoutingResult = {
  service: { slug: string; title: string; url: string } | null;
  member: { username: string; name: string; url: string } | null;
  reason: string;
};

const MAX_MESSAGE = 1000;

/** "Not sure who to book?" on a team page: the visitor describes their need and gets pointed at a service. */
export class TeamRoutingService {
  constructor(
    private readonly deps: {
      getPublicPage: (slug: string) => Promise<PublicTeamPage | null>;
      router: TeamRouter | null;
    }
  ) {}

  get isEnabled() {
    return !!this.deps.router;
  }

  async route({ teamSlug, message }: { teamSlug: string; message: string }): Promise<RoutingResult | null> {
    const text = message.trim().slice(0, MAX_MESSAGE);
    if (!this.deps.router || text.length < 3) return null;
    const page = await this.deps.getPublicPage(teamSlug);
    if (!page || !page.services.length) return null;
    const members = page.members
      .filter((m): m is { username: string; name: string | null } => !!m.username)
      .map((m) => ({ username: m.username, name: m.name ?? m.username }));

    const decision = await this.deps.router({
      teamName: page.team.name,
      services: page.services,
      members,
      message: text,
    });
    if (!decision) return null;

    // The model can only pick from what we gave it; anything else is dropped rather than trusted.
    const service = page.services.find((s) => s.slug === decision.serviceSlug) ?? null;
    const member = members.find((m) => m.username === decision.memberUsername) ?? null;
    return {
      service: service
        ? { slug: service.slug, title: service.title, url: `/team/${page.team.slug}/${service.slug}` }
        : null,
      member: member ? { username: member.username, name: member.name, url: `/${member.username}` } : null,
      reason: decision.reason,
    };
  }
}
