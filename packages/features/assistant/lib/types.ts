import type { ButtonShape, PageThemeId } from "../../booking-page-theme/themes";

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
  theme: string;
  buttonShape: string;
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
  setLook(userId: number, patch: { theme?: PageThemeId; buttonShape?: ButtonShape }): Promise<void>;
}

/** What the assistant did, shown to the owner as confirmations under its reply. */
export type AssistantAction =
  | { type: "service_created"; title: string; minutes: number; url: string }
  | { type: "service_updated"; title: string }
  | { type: "profile_updated"; fields: string[] }
  | { type: "look_updated"; theme?: string; buttonShape?: string };

export type ChatMessage = { role: "user" | "assistant"; content: string };
