export type AssistantAction =
  | { type: "service_created"; title: string; minutes: number; url: string }
  | { type: "service_updated"; title: string }
  | { type: "profile_updated"; fields: string[] }
  | { type: "request_accepted"; name: string }
  | { type: "request_declined"; name: string }
  | { type: "request_reported"; name: string }
  | { type: "waitlist_removed"; name: string };

export function describeAssistantAction(
  action: AssistantAction,
  t: (key: string, o?: Record<string, unknown>) => string
) {
  switch (action.type) {
    case "service_created":
      return t("assistant_did_create", { title: action.title, minutes: action.minutes });
    case "service_updated":
      return t("assistant_did_update", { title: action.title });
    case "profile_updated":
      return action.fields.includes("name") && action.fields.includes("bio")
        ? t("assistant_did_profile")
        : action.fields.includes("name")
          ? t("assistant_did_name")
          : t("assistant_did_bio");
    case "request_accepted":
      return t("assistant_did_accept", { name: action.name });
    case "request_declined":
      return t("assistant_did_decline", { name: action.name });
    case "request_reported":
      return t("assistant_did_report", { name: action.name });
    case "waitlist_removed":
      return t("assistant_did_waitlist_remove", { name: action.name });
  }
}
