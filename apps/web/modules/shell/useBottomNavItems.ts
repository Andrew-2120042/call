import { useLocale } from "@calcom/lib/hooks/useLocale";
import { showToast } from "@calcom/ui/components/toast";
import { OPEN_FEEDBACK_EVENT } from "~/feedback/FeedbackDialog";
import type { NavigationItemType } from "./navigation/NavigationItem";

type BottomNavItemsProps = {
  publicPageUrl: string;
};

export function useBottomNavItems({ publicPageUrl }: BottomNavItemsProps): NavigationItemType[] {
  const { t } = useLocale();

  return [
    {
      name: "view_public_page",
      href: publicPageUrl,
      icon: "external-link",
      target: "__blank",
    },
    {
      name: "copy_public_page_link",
      href: "",
      onClick: (e: { preventDefault: () => void }) => {
        e.preventDefault();
        navigator.clipboard.writeText(publicPageUrl);
        showToast(t("link_copied"), "success");
      },
      icon: "copy",
    },
    {
      name: "help_and_feedback",
      href: "",
      onClick: (e: { preventDefault: () => void }) => {
        e.preventDefault();
        window.dispatchEvent(new Event(OPEN_FEEDBACK_EVENT));
      },
      icon: "circle-help",
    },
    {
      name: "settings",
      href: "/settings/overview",
      icon: "settings",
    },
  ].filter(Boolean) as NavigationItemType[];
}
