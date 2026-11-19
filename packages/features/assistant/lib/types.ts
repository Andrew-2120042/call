export type AssistantServiceSummary = {
  id: number;
  title: string;
  minutes: number;
  description: string | null;
  needsApproval: boolean;
  hidden: boolean;
  url: string;
};

export type AssistantPageSnapshot = {
  name: string;
  bio: string;
  services: AssistantServiceSummary[];
};

export type NewService = { title: string; minutes: number; description?: string; needsApproval: boolean };
export type ServicePatch = Partial<NewService> & { hidden?: boolean };

/** Everything the assistant may change. Each call is scoped to one owner. */
export interface IAssistantActions {
  getPage(userId: number): Promise<AssistantPageSnapshot>;
  createService(userId: number, input: NewService): Promise<AssistantServiceSummary>;
  updateService(
    userId: number,
    serviceId: number,
    patch: ServicePatch
  ): Promise<AssistantServiceSummary | null>;
  updateProfile(userId: number, patch: { name?: string; bio?: string }): Promise<void>;
}

export type AssistantRequest = {
  bookingUid: string;
  name: string;
  email: string;
  service: string;
  start: string;
  fit: string | null;
  spamLikely: boolean;
  summary: string | null;
};

export type AssistantWaitlistEntry = {
  entryUid: string;
  name: string;
  email: string;
  service: string;
  wants: string;
  status: string;
  placeInLine: number;
};

/** Requests and waitlist, scoped to one owner. Booker text inside these is data, never instructions. */
export interface IAssistantInbox {
  listRequests(): Promise<AssistantRequest[]>;
  decideRequest(bookingUid: string, accept: boolean, reason?: string): Promise<{ name: string } | null>;
  reportSpam(bookingUid: string): Promise<{ name: string } | null>;
  listWaitlist(): Promise<AssistantWaitlistEntry[]>;
  removeFromWaitlist(entryUid: string): Promise<{ name: string } | null>;
}

/** What the assistant did, shown to the owner as confirmations under its reply. */
export type AssistantAction =
  | { type: "service_created"; title: string; minutes: number; url: string }
  | { type: "service_updated"; title: string }
  | { type: "profile_updated"; fields: string[] }
  | { type: "request_accepted"; name: string }
  | { type: "request_declined"; name: string }
  | { type: "request_reported"; name: string }
  | { type: "waitlist_removed"; name: string };

export type ChatMessage = { role: "user" | "assistant"; content: string };
