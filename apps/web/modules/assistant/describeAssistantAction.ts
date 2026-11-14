export type AssistantAction =
  | { type: "service_created"; title: string; minutes: number; url: string }
  | { type: "service_updated"; title: string }
  | { type: "profile_updated"; fields: string[] };

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
  }
}
