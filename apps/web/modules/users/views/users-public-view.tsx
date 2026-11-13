"use client";

import {
  sdkActionManager,
  useEmbedNonStylesConfig,
  useEmbedStyles,
  useIsEmbed,
} from "@calcom/embed-core/embed-iframe";
import { pageThemeStyle } from "@calcom/features/booking-page-theme/themes";
import { APP_NAME, WEBSITE_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { useRouterQuery } from "@calcom/lib/hooks/useRouterQuery";
import useTheme from "@calcom/lib/hooks/useTheme";
import { UserAvatar } from "@calcom/ui/components/avatar";
import { Icon } from "@calcom/ui/components/icon";
import { OrgBanner } from "@calcom/ui/components/organization-banner";
import { UnpublishedEntity } from "@calcom/ui/components/unpublished-entity";
import EmptyPage from "@calcom/web/modules/event-types/components/EmptyPage";
import type { getServerSideProps } from "@server/lib/[user]/getServerSideProps";
import classNames from "classnames";
import type { InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { Toaster } from "sonner";

export type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>;
export function UserPage(props: PageProps) {
  const { users, profile, eventTypes, entity } = props;
  const { t } = useLocale();

  const [user] = users; //To be used when we only have a single user, not dynamic group
  useTheme(profile.theme);

  const isBioEmpty = !user.bio || !user.bio.replace("<p><br></p>", "").length;

  const isEmbed = useIsEmbed(props.isEmbed);
  const eventTypeListItemEmbedStyles = useEmbedStyles("eventTypeListItem");
  const shouldAlignCentrallyInEmbed = useEmbedNonStylesConfig("align") !== "left";
  const shouldAlignCentrally = !isEmbed || shouldAlignCentrallyInEmbed;
  const {
    // So it doesn't display in the Link (and make tests fail)
    user: _user,
    orgSlug: _orgSlug,
    redirect: _redirect,
    ...query
  } = useRouterQuery();

  if (entity.considerUnpublished) {
    return (
      <div className="flex h-full min-h-[calc(100dvh)] items-center justify-center">
        <UnpublishedEntity {...entity} />
      </div>
    );
  }

  const isEventListEmpty = eventTypes.length === 0;
  const isOrg = !!user?.profile?.organization;
  const themeStyle = pageThemeStyle(props.pageTheme, props.pageButtonShape);

  return (
    <div
      className={classNames("sw-page min-h-[100dvh] px-4 pb-10 pt-8", isEmbed && "rounded-md")}
      style={{ ...themeStyle, background: "var(--sw-bg)", color: "var(--sw-fg)" }}>
      <main
        className={classNames("mx-auto w-full max-w-[400px] text-center", !shouldAlignCentrally && "ml-0")}>
        {isOrg && user.profile.organization?.bannerUrl && (
          <OrgBanner
            alt={user.profile.organization.name ?? "Organization banner"}
            imageSrc={user.profile.organization.bannerUrl}
            className="mb-4 w-full rounded-2xl object-cover"
          />
        )}
        <div className="flex flex-col items-center">
          <UserAvatar
            size="xl"
            user={{
              avatarUrl: user.avatarUrl,
              profile: user.profile,
              name: profile.name,
              username: profile.username,
            }}
            className="shadow-[0_0_0_4px_#fff,0_12px_30px_-12px_rgba(0,0,0,.5)]"
          />
          <h1
            className="mt-[18px] text-[30px] font-black leading-[1.05] tracking-[-0.025em]"
            data-testid="name-title">
            {profile.name}
            {user.verified && (
              <Icon
                name="badge-check"
                className={classNames(
                  "mx-1 -mt-1 inline h-6 w-6 text-white",
                  isOrg ? "fill-yellow-500" : "fill-blue-500"
                )}
              />
            )}
          </h1>
          {!isBioEmpty && (
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized via safeBio
            <div
              className="wrap-break-word mt-1.5 text-sm [&_a]:underline"
              style={{ color: "var(--sw-soft)" }}
              dangerouslySetInnerHTML={{ __html: props.safeBio }}
            />
          )}
        </div>

        <div className="mt-[22px] grid gap-3" data-testid="event-types">
          {eventTypes.map((type) => (
            <Link
              key={type.id}
              style={{ ...eventTypeListItemEmbedStyles, borderRadius: "var(--sw-radius)" }}
              prefetch={false}
              href={{ pathname: `/${user.profile.username}/${type.slug}`, query }}
              passHref
              onClick={async () => {
                sdkActionManager?.fire("eventTypeSelected", { eventType: type });
              }}
              className="flex w-full items-center justify-between gap-3 bg-white py-3.5 pl-6 pr-[18px] text-left text-[#121212] shadow-[0_10px_24px_-16px_rgba(0,0,0,.6)] transition-transform hover:scale-[1.01]"
              data-testid="event-type-link">
              <span className="min-w-0">
                <b className="block truncate text-base font-semibold">{type.title}</b>
                <small className="mt-px block text-[13px] text-[#6f6a64]">{formatServiceLine(type, t)}</small>
              </span>
              <span
                className={classNames(
                  "flex-none rounded-full px-2.5 py-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[.04em]",
                  type.requiresConfirmation ? "bg-[#e9d7ff] text-[#6a2bff]" : "bg-[#bdf2d5] text-[#0c5a37]"
                )}>
                {type.requiresConfirmation ? t("service_kind_request") : t("service_kind_instant")}
              </span>
            </Link>
          ))}
        </div>

        {isEventListEmpty && (
          <div className="mt-6 rounded-3xl bg-white p-6 text-[#121212]">
            <EmptyPage name={profile.name || "User"} />
          </div>
        )}

        {!props.isBrandingHidden && (
          <a
            href={`${WEBSITE_URL}/?utm_source=profile_page&utm_medium=badge`}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-block rounded-full px-3 py-1 text-[11px]"
            style={{ color: "var(--sw-soft)" }}
            data-testid="profile-branding">
            {t("booked_with_app", { appName: APP_NAME })}
          </a>
        )}
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}

function formatServiceLine(
  type: PageProps["eventTypes"][number],
  t: (key: string, options?: Record<string, unknown>) => string
) {
  const parts = [t("service_minutes", { count: type.length })];
  if (type.price > 0) {
    parts.push(
      new Intl.NumberFormat("en-US", { style: "currency", currency: type.currency || "usd" }).format(
        type.price / 100
      )
    );
  }
  return parts.join(", ");
}

export default UserPage;
