import { useRouter } from "next/navigation";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { sessionStorage } from "@calcom/lib/webstorage";
import { trpc } from "@calcom/trpc/react";
import { showToast } from "@calcom/ui/components/toast";
import { setShowWelcomeToCalcomModalFlag } from "@calcom/web/modules/shell/hooks/useWelcomeToCalcomModal";

const ONBOARDING_REDIRECT_KEY = "onBoardingRedirect";
const ORG_MODAL_STORAGE_KEY = "showNewOrgModal";

// Matches the three services shown in the onboarding preview, so people get what they were shown.
const DEFAULT_EVENT_TYPES = [
  { title: "onboarding_preview_service_intro", slug: "intro-call", length: 15 },
  { title: "onboarding_preview_service_consultation", slug: "consultation", length: 30 },
  { title: "onboarding_preview_service_follow_up", slug: "follow-up", length: 45 },
];

export const useSubmitPersonalOnboarding = () => {
  const router = useRouter();
  const { t } = useLocale();
  const utils = trpc.useUtils();

  const { data: eventTypes } = trpc.viewer.eventTypes.list.useQuery();
  const createEventType = trpc.viewer.eventTypesHeavy.create.useMutation();

  const mutation = trpc.viewer.me.updateProfile.useMutation({
    onSuccess: async () => {
      try {
        // Create default event types if user has none
        if (eventTypes?.length === 0) {
          await Promise.all(
            DEFAULT_EVENT_TYPES.map(async (event) => {
              return createEventType.mutateAsync({
                title: t(event.title),
                slug: event.slug,
                length: event.length,
              });
            })
          );
        }
      } catch (error) {
        console.error(error);
      }

      await utils.viewer.me.get.refetch();

      const redirectUrl = localStorage.getItem(ONBOARDING_REDIRECT_KEY);
      if (redirectUrl) {
        localStorage.removeItem(ONBOARDING_REDIRECT_KEY);
        router.push(redirectUrl);
        return;
      }

      // Check if org modal flag is set - if so, don't show personal modal
      // Organization onboarding takes precedence
      const hasOrgModalFlag = sessionStorage.getItem(ORG_MODAL_STORAGE_KEY) === "true";

      if (!hasOrgModalFlag) {
        // Only set personal modal flag if org modal flag is not set
        setShowWelcomeToCalcomModalFlag();
        router.push("/event-types?welcomeToCalcomModal=true");
      } else {
        // Org modal flag exists - redirect to event-types without personal modal query param
        // The org modal will show via sessionStorage check
        router.push("/event-types?newOrganizationModal=true");
      }
    },
    onError: (error) => {
      showToast(t("something_went_wrong"), "error");
      console.error(error);
    },
  });

  const submitPersonalOnboarding = () => {
    // telemetry.event(telemetryEventTypes.onboardingFinished);
    mutation.mutate({
      completedOnboarding: true,
      // Signup doesn't ask for a time zone, so take the browser's; otherwise every new account starts on the
      // schema default and is immediately asked to change it.
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  };

  return {
    submitPersonalOnboarding,
    isSubmitting: mutation.isPending,
  };
};
