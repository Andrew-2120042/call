"use client";

import {
  sdkActionManager,
  useEmbedNonStylesConfig,
  useEmbedStyles,
  useIsEmbed,
} from "@calcom/embed-core/embed-iframe";
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

  return (
    <div
      className={classNames(
        "bg-muted text-default min-h-[100dvh] px-4 pb-14 pt-12",
        isEmbed && "min-h-0 rounded-md",
        !shouldAlignCentrally && "[&_main]:ml-0"
      )}>
      <main className="mx-auto w-full max-w-[560px]" data-testid="public-profile">
        {isOrg && user.profile.organization?.bannerUrl && (
          <OrgBanner
            alt={user.profile.organization.name ?? "Organization banner"}
            imageSrc={user.profile.organization.bannerUrl}
            className="mb-6 w-full rounded-2xl object-cover"
          />
        )}
        <header className="flex flex-col items-center text-center">
          <UserAvatar
            size="xl"
            user={{
              avatarUrl: user.avatarUrl,
              profile: user.profile,
              name: profile.name,
              username: profile.username,
            }}
          />
          <h1
            className="text-emphasis mt-4 text-[26px] font-semibold leading-tight tracking-[-0.02em]"
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
            // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized on the server (markdownToSafeHTML)
            <div
              className="text-subtle wrap-break-word mt-2 max-w-[44ch] text-[15px] leading-relaxed [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: props.safeBio }}
            />
          )}
        </header>

        <div
          className="border-subtle bg-default mt-8 overflow-hidden rounded-2xl border"
          data-testid="event-types">
          {eventTypes.map((eventType, index) => (
            <Link
              key={eventType.id}
              prefetch={false}
              href={{ pathname: `/${user.profile.username}/${eventType.slug}`, query }}
              onClick={() => sdkActionManager?.fire("eventTypeSelected", { eventType })}
              style={eventTypeListItemEmbedStyles ?? undefined}
              className={classNames(
                "hover:bg-subtle group flex items-center justify-between gap-4 px-5 py-4 transition-colors",
                index > 0 && "border-subtle border-t"
              )}
              data-testid="event-type-link">
              <span className="min-w-0">
                <span className="text-emphasis block truncate text-[15px] font-semibold">
                  {eventType.title}
                </span>
                <span className="text-subtle mt-1 flex flex-wrap items-center gap-x-2 text-[13px]">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="clock" className="h-3.5 w-3.5" />
                    {t("service_minutes", { count: eventType.length })}
                  </span>
                  {eventType.requiresConfirmation && <span>· {t("service_kind_request_long")}</span>}
                </span>
              </span>
              <Icon
                name="arrow-right"
                className="text-subtle h-4 w-4 flex-none transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          ))}
          {isEventListEmpty && (
            <div className="p-6">
              <EmptyPage name={profile.name || "User"} />
            </div>
          )}
        </div>

        {!props.isBrandingHidden && (
          <p className="mt-8 text-center">
            <a
              href={`${WEBSITE_URL}/?utm_source=profile_page&utm_medium=badge`}
              target="_blank"
              rel="noreferrer"
              className="text-muted hover:text-subtle text-xs"
              data-testid="profile-branding">
              {t("booked_with_app", { appName: APP_NAME })}
            </a>
          </p>
        )}
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default UserPage;
