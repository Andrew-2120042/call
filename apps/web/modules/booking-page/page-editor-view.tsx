"use client";

import {
  BUTTON_RADII,
  BUTTON_SHAPES,
  PAGE_THEME_IDS,
  PAGE_THEMES,
  resolvePageTheme,
} from "@calcom/features/booking-page-theme/themes";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Avatar } from "@calcom/ui/components/avatar";
import { Button } from "@calcom/ui/components/button";
import { Icon } from "@calcom/ui/components/icon";
import { showToast } from "@calcom/ui/components/toast";
import classNames from "classnames";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookingPageProfile } from "./BookingPageProfile";
import { PhoneFrame } from "./PhoneFrame";

const BIO_LIMIT = 300;

export default function PageEditorView() {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const query = trpc.viewer.pageLook.editor.useQuery();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  // Fill the form once; later refetches (after look or service changes) must not wipe unsaved typing.
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!query.data || loaded) return;
    setName(query.data.name);
    setBio(query.data.bio);
    setLoaded(true);
  }, [query.data, loaded]);

  const refresh = () => utils.viewer.pageLook.editor.invalidate();
  const onError = (error: { message: string }) => showToast(error.message, "error");

  const saveProfile = trpc.viewer.me.updateProfile.useMutation({
    onSuccess: async () => {
      showToast(t("page_editor_saved"), "success");
      await refresh();
    },
    onError,
  });
  const updateLook = trpc.viewer.pageLook.update.useMutation({ onSuccess: refresh, onError });
  const updateService = trpc.viewer.eventTypesHeavy.update.useMutation({ onSuccess: refresh, onError });
  const reorder = trpc.viewer.loggedInViewerRouter.eventTypeOrder.useMutation({
    onSuccess: refresh,
    onError,
  });

  if (!query.data) return null;
  const data = query.data;
  const profileDirty = name !== data.name || bio !== data.bio;
  const visibleServices = data.services.filter((service) => !service.hidden);

  const move = (index: number, direction: -1 | 1) => {
    const ids = data.services.map((service) => service.id);
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    utils.viewer.pageLook.editor.setData(undefined, {
      ...data,
      services: ids.map((id) => data.services.find((service) => service.id === id)!).filter(Boolean),
    });
    reorder.mutate({ ids });
  };

  const publicUrl = data.username ? `/${data.username}` : null;

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start" data-testid="page-editor">
      <div className="min-w-0 flex-1 space-y-4">
        <Panel title={t("page_editor_profile")}>
          <div className="flex items-center gap-4">
            <Avatar size="lg" imageSrc={data.avatarUrl} alt={data.name} />
            <Link
              href="/settings/my-account/profile"
              className="border-default text-emphasis hover:border-emphasis rounded-full border px-4 py-2 text-sm font-medium transition-colors">
              {t("page_editor_change_photo")}
            </Link>
          </div>
          <label className="text-emphasis mt-4 block text-sm font-medium" htmlFor="pe-name">
            {t("page_editor_name")}
          </label>
          <input
            id="pe-name"
            className="border-default bg-default text-emphasis mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
          />
          <label className="text-emphasis mt-4 block text-sm font-medium" htmlFor="pe-bio">
            {t("page_editor_bio")}
          </label>
          <textarea
            id="pe-bio"
            className="border-default bg-default text-emphasis mt-1 min-h-[96px] w-full rounded-xl border px-3 py-2 text-sm"
            value={bio}
            maxLength={BIO_LIMIT}
            placeholder={t("page_editor_bio_placeholder")}
            onChange={(e) => setBio(e.target.value)}
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-subtle text-xs">
              {bio.length}/{BIO_LIMIT}
              {saveProfile.isSuccess && !profileDirty && (
                <span className="text-emphasis ml-3 inline-flex items-center gap-1">
                  <Icon name="check" className="h-3.5 w-3.5" />
                  {t("page_editor_saved_short")}
                </span>
              )}
            </span>
            <Button
              disabled={!profileDirty || !name.trim()}
              loading={saveProfile.isPending}
              onClick={() => saveProfile.mutate({ name: name.trim(), bio })}>
              {t("save")}
            </Button>
          </div>
        </Panel>

        <Panel title={t("page_editor_look")}>
          <p className="text-emphasis text-sm font-medium">{t("page_look_colour")}</p>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={t("page_look_colour")}>
            {PAGE_THEME_IDS.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={data.pageTheme === id}
                onClick={() => {
                  utils.viewer.pageLook.editor.setData(undefined, { ...data, pageTheme: id });
                  updateLook.mutate({ pageTheme: id });
                }}
                className="text-emphasis flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm"
                style={{
                  boxShadow:
                    data.pageTheme === id
                      ? "inset 0 0 0 2px currentColor"
                      : "inset 0 0 0 1px rgba(127,124,160,.35)",
                }}>
                <span
                  className="h-6 w-6 rounded-full"
                  style={{ background: PAGE_THEMES[id].bg, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.1)" }}
                />
                {PAGE_THEMES[id].label}
              </button>
            ))}
          </div>
          <p className="text-emphasis mt-5 text-sm font-medium">{t("page_look_buttons")}</p>
          <div className="mt-2 flex gap-2" role="group" aria-label={t("page_look_buttons")}>
            {BUTTON_SHAPES.map((shape) => (
              <button
                key={shape}
                type="button"
                aria-pressed={data.pageButtonShape === shape}
                onClick={() => {
                  utils.viewer.pageLook.editor.setData(undefined, { ...data, pageButtonShape: shape });
                  updateLook.mutate({ pageButtonShape: shape });
                }}
                className={classNames(
                  "px-4 py-2 text-sm",
                  data.pageButtonShape === shape
                    ? "text-emphasis font-semibold"
                    : "text-default border-default border"
                )}
                style={{
                  borderRadius: BUTTON_RADII[shape],
                  boxShadow: data.pageButtonShape === shape ? "inset 0 0 0 2px currentColor" : undefined,
                }}>
                {t(`page_look_shape_${shape}`)}
              </button>
            ))}
          </div>
        </Panel>

        <Panel
          title={t("page_editor_services")}
          action={
            <Link
              href="/event-types?dialog=new&eventPage="
              className="text-emphasis text-sm font-medium underline">
              {t("page_editor_add_service")}
            </Link>
          }>
          {data.services.length === 0 && (
            <p className="text-subtle text-sm">{t("page_editor_no_services")}</p>
          )}
          <ul className="divide-subtle divide-y" data-testid="page-editor-services">
            {data.services.map((service, index) => (
              <li key={service.id} className="flex items-center gap-3 py-3">
                <div className="flex flex-col">
                  <button
                    type="button"
                    aria-label={t("page_editor_move_up", { title: service.title })}
                    disabled={index === 0 || reorder.isPending}
                    onClick={() => move(index, -1)}
                    className="text-subtle hover:text-emphasis disabled:opacity-30">
                    <Icon name="chevron-up" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={t("page_editor_move_down", { title: service.title })}
                    disabled={index === data.services.length - 1 || reorder.isPending}
                    onClick={() => move(index, 1)}
                    className="text-subtle hover:text-emphasis disabled:opacity-30">
                    <Icon name="chevron-down" className="h-4 w-4" />
                  </button>
                </div>
                <div className={classNames("min-w-0 flex-1", service.hidden && "opacity-50")}>
                  <Link
                    href={`/event-types/${service.id}`}
                    className="text-emphasis block truncate text-sm font-semibold hover:underline">
                    {service.title}
                  </Link>
                  <p className="text-subtle text-xs">
                    {t("service_minutes", { count: service.length })} ·{" "}
                    {service.requiresConfirmation
                      ? t("service_kind_request_long")
                      : t("service_kind_instant_long")}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-subtle w-12 text-right text-xs">
                    {service.hidden ? t("page_editor_hidden") : t("page_editor_shown")}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!service.hidden}
                    aria-label={t("page_editor_show_on_page", { title: service.title })}
                    onClick={() => {
                      const hidden = !service.hidden;
                      utils.viewer.pageLook.editor.setData(undefined, {
                        ...data,
                        services: data.services.map((s) => (s.id === service.id ? { ...s, hidden } : s)),
                      });
                      updateService.mutate({ id: service.id, hidden });
                    }}
                    className={classNames(
                      "relative h-6 w-10 flex-none rounded-full transition-colors",
                      service.hidden ? "bg-emphasis" : "bg-inverted"
                    )}>
                    <span
                      className={classNames(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                        service.hidden ? "left-0.5" : "left-0.5 translate-x-4"
                      )}
                    />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <aside className="flex-none lg:sticky lg:top-4 lg:self-start">
        <div className="flex items-center justify-between pb-3">
          <p className="text-subtle text-sm">{t("page_editor_preview")}</p>
          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="text-emphasis text-sm font-medium underline">
              {t("page_editor_open_live")}
            </a>
          )}
        </div>
        <PhoneFrame
          screenBg={resolvePageTheme(data.pageTheme).bg}
          inkColor={resolvePageTheme(data.pageTheme).fg}>
          <div data-testid="page-editor-preview">
            <BookingPageProfile
              compact
              name={name || data.name}
              avatar={
                <Avatar size="lg" imageSrc={data.avatarUrl} alt={data.name} className="rounded-none!" />
              }
              bio={bio.trim() ? { text: bio } : null}
              services={visibleServices}
              themeId={data.pageTheme}
              buttonShape={data.pageButtonShape}
              brandingHidden={data.brandingHidden}
              className="min-h-full"
            />
          </div>
        </PhoneFrame>
      </aside>
    </div>
  );
}

function Panel(props: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-default border-subtle rounded-3xl border p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-emphasis text-base font-semibold">{props.title}</h2>
        {props.action}
      </div>
      {props.children}
    </section>
  );
}
