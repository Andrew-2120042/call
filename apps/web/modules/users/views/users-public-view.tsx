"use client";

import {
  sdkActionManager,
  useEmbedNonStylesConfig,
  useEmbedStyles,
  useIsEmbed,
} from "@calcom/embed-core/embed-iframe";
import { useRouterQuery } from "@calcom/lib/hooks/useRouterQuery";
import useTheme from "@calcom/lib/hooks/useTheme";
import { UserAvatar } from "@calcom/ui/components/avatar";
import { Icon } from "@calcom/ui/components/icon";
import { OrgBanner } from "@calcom/ui/components/organization-banner";
import { UnpublishedEntity } from "@calcom/ui/components/unpublished-entity";
import { BookingPageProfile } from "@calcom/web/modules/booking-page/BookingPageProfile";
import EmptyPage from "@calcom/web/modules/event-types/components/EmptyPage";
import type { getServerSideProps } from "@server/lib/[user]/getServerSideProps";
import classNames from "classnames";
import type { InferGetServerSidePropsType } from "next";
import { Toaster } from "sonner";

export type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>;
export function UserPage(props: PageProps) {
  const { users, profile, eventTypes, entity } = props;

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
    <div className={classNames(isEmbed && "rounded-md", !shouldAlignCentrally && "[&_main]:ml-0")}>
      <BookingPageProfile
        name={profile.name ?? ""}
        avatar={
          <UserAvatar
            size="xl"
            user={{
              avatarUrl: user.avatarUrl,
              profile: user.profile,
              name: profile.name,
              username: profile.username,
            }}
            className="rounded-none!"
          />
        }
        bio={isBioEmpty ? null : { html: props.safeBio }}
        services={eventTypes}
        themeId={props.pageTheme}
        buttonShape={props.pageButtonShape}
        pageStyle={props.pageStyle}
        brandingHidden={props.isBrandingHidden}
        verifiedBadge={
          user.verified ? (
            <Icon
              name="badge-check"
              className={classNames(
                "mx-1 -mt-1 inline h-6 w-6 text-white",
                isOrg ? "fill-yellow-500" : "fill-blue-500"
              )}
            />
          ) : null
        }
        banner={
          isOrg && user.profile.organization?.bannerUrl ? (
            <OrgBanner
              alt={user.profile.organization.name ?? "Organization banner"}
              imageSrc={user.profile.organization.bannerUrl}
              className="mb-5 w-full rounded-[22px] object-cover"
            />
          ) : null
        }
        empty={
          isEventListEmpty ? (
            <div className="mt-8 rounded-3xl bg-white p-6 text-[#121212]">
              <EmptyPage name={profile.name || "User"} />
            </div>
          ) : null
        }
        linkFor={(service) => ({
          href: {
            pathname: `/${user.profile.username}/${eventTypes.find((e) => e.id === service.id)?.slug}`,
            query,
          },
          style: eventTypeListItemEmbedStyles ?? undefined,
          onClick: () => {
            const eventType = eventTypes.find((e) => e.id === service.id);
            sdkActionManager?.fire("eventTypeSelected", { eventType });
          },
        })}
      />
      <Toaster position="bottom-right" />
    </div>
  );
}

export default UserPage;
