"use client";

import {
  BUTTON_RADII,
  BUTTON_SHAPES,
  type ButtonShape,
  PAGE_THEME_IDS,
  PAGE_THEMES,
  type PageThemeId,
  resolvePageTheme,
} from "@calcom/features/booking-page-theme/themes";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Avatar } from "@calcom/ui/components/avatar";
import type { IconName } from "@calcom/ui/components/icon";
import { Icon } from "@calcom/ui/components/icon";
import { showToast } from "@calcom/ui/components/toast";
import classNames from "classnames";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { BookingPageProfile } from "./BookingPageProfile";
import { PhoneFrame } from "./PhoneFrame";

type Tab = "content" | "header" | "design" | "enhance";
type Sub = null | "theme" | "buttons";

type Draft = {
  name: string;
  bio: string;
  pageTheme: string;
  pageButtonShape: string;
  /** Service ids in display order */
  order: number[];
  hidden: Record<number, boolean>;
};

const RAIL: { id: Tab; labelKey: string; icon: IconName }[] = [
  { id: "content", labelKey: "studio_content", icon: "layers" },
  { id: "header", labelKey: "studio_header", icon: "user" },
  { id: "design", labelKey: "studio_design", icon: "paintbrush" },
  { id: "enhance", labelKey: "studio_enhance", icon: "sparkles" },
];

const BIO_LIMIT = 160;

const ENHANCE_PROMPTS = [
  "studio_enhance_services",
  "studio_enhance_bio",
  "studio_enhance_intro",
  "studio_enhance_look",
] as const;

/** Full-screen booking page editor, laid out like the Linktree editor: rail, floating panel, phone. */
export default function PageStudio() {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const query = trpc.viewer.pageLook.editor.useQuery();

  const [tab, setTab] = useState<Tab>("content");
  const [sub, setSub] = useState<Sub>(null);
  const [base, setBase] = useState<Draft | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [past, setPast] = useState<Draft[]>([]);
  const [future, setFuture] = useState<Draft[]>([]);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fill the draft once; later refetches must not wipe unsaved edits.
  useEffect(() => {
    if (!query.data || base) return;
    const initial: Draft = {
      name: query.data.name,
      bio: query.data.bio,
      pageTheme: query.data.pageTheme,
      pageButtonShape: query.data.pageButtonShape,
      order: query.data.services.map((s) => s.id),
      hidden: Object.fromEntries(query.data.services.map((s) => [s.id, s.hidden])),
    };
    setBase(initial);
    setDraft(initial);
  }, [query.data, base]);

  const updateProfile = trpc.viewer.me.updateProfile.useMutation();
  const updateLook = trpc.viewer.pageLook.update.useMutation();
  const updateService = trpc.viewer.eventTypesHeavy.update.useMutation();
  const reorder = trpc.viewer.loggedInViewerRouter.eventTypeOrder.useMutation();
  const setBranding = trpc.viewer.me.updateProfile.useMutation({
    onSuccess: () => utils.viewer.pageLook.editor.invalidate(),
    onError: (error) => showToast(error.message, "error"),
  });

  const dirty = useMemo(
    () => !!draft && !!base && JSON.stringify(draft) !== JSON.stringify(base),
    [draft, base]
  );

  if (!query.data || !draft || !base) {
    return <div className="fixed inset-0 bg-[#f6f5f2]" />;
  }
  const data = query.data;
  const serviceById = new Map(data.services.map((s) => [s.id, s]));
  const orderedServices = draft.order.map((id) => serviceById.get(id)).filter((s) => !!s);
  const visibleServices = orderedServices.filter((s) => !draft.hidden[s.id]);
  const theme = resolvePageTheme(draft.pageTheme);
  const publicUrl = data.username ? `/${data.username}` : null;

  const update = (patch: Partial<Draft>) => {
    setPast((p) => [...p.slice(-49), draft]);
    setFuture([]);
    setDraft({ ...draft, ...patch });
  };
  const undo = () => {
    const prev = past[past.length - 1];
    if (!prev) return;
    setFuture((f) => [draft, ...f]);
    setPast((p) => p.slice(0, -1));
    setDraft(prev);
  };
  const redo = () => {
    const next = future[0];
    if (!next) return;
    setPast((p) => [...p, draft]);
    setFuture((f) => f.slice(1));
    setDraft(next);
  };
  const cancel = () => {
    setDraft(base);
    setPast([]);
    setFuture([]);
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const jobs: Promise<unknown>[] = [];
      if (draft.name !== base.name || draft.bio !== base.bio) {
        jobs.push(updateProfile.mutateAsync({ name: draft.name.trim() || base.name, bio: draft.bio }));
      }
      if (draft.pageTheme !== base.pageTheme || draft.pageButtonShape !== base.pageButtonShape) {
        jobs.push(
          updateLook.mutateAsync({ pageTheme: draft.pageTheme, pageButtonShape: draft.pageButtonShape })
        );
      }
      for (const id of draft.order) {
        if (draft.hidden[id] !== base.hidden[id])
          jobs.push(updateService.mutateAsync({ id, hidden: draft.hidden[id] }));
      }
      if (draft.order.join(",") !== base.order.join(","))
        jobs.push(reorder.mutateAsync({ ids: draft.order }));
      await Promise.all(jobs);
      setBase(draft);
      setPast([]);
      setFuture([]);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
      await Promise.all([utils.viewer.pageLook.editor.invalidate(), utils.viewer.home.get.invalidate()]);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("something_went_wrong"), "error");
    } finally {
      setSaving(false);
    }
  };

  const share = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${publicUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(`${window.location.origin}${publicUrl}`, "warning");
    }
  };

  const go = (next: Tab) => {
    setTab(next);
    setSub(null);
  };

  const move = (index: number, direction: -1 | 1) => {
    const order = [...draft.order];
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    update({ order });
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#f6f5f2] text-[#121212]" data-testid="page-editor">
      {/* Top bar: menu · page pill · Share */}
      <div className="relative z-[70] flex shrink-0 items-center justify-between px-4 pb-2 pt-4 md:px-5">
        <Link
          href="/home"
          aria-label={t("studio_back_home")}
          className="grid h-11 w-11 place-items-center rounded-full bg-[#ecebe8] hover:bg-[#e3e2de]">
          <Icon name="menu" className="h-5 w-5" />
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-full bg-[#ecebe8] py-1.5 pl-1.5 pr-3.5 text-[15px] font-semibold hover:bg-[#e3e2de]">
            <Avatar size="sm" imageSrc={data.avatarUrl} alt={data.name} />
            <span className="max-w-[200px] truncate">{draft.name || data.name}</span>
            <Icon name="chevron-down" className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden />
              <div className="absolute left-1/2 z-50 mt-2 w-60 -translate-x-1/2 rounded-2xl bg-white p-1.5 shadow-[0_18px_50px_-12px_rgba(0,0,0,.3)]">
                {[
                  { href: "/home", label: t("home_page_title") },
                  { href: "/event-types", label: t("event_types_page_title") },
                  { href: "/bookings/upcoming", label: t("bookings") },
                  { href: "/settings/my-account/profile", label: t("settings") },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-xl px-3 py-2.5 text-[14px] hover:bg-[#f6f5f2]">
                    {item.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={share}
          className="flex items-center gap-2 rounded-full bg-[#ecebe8] px-4 py-2.5 text-[15px] font-semibold hover:bg-[#e3e2de]">
          <Icon name="share-2" className="h-4 w-4" />
          {copied ? t("studio_link_copied") : t("studio_share")}
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 pb-[68px] md:pb-0">
        {/* Rail: round buttons with labels (a bottom tab bar on phones) */}
        <nav className="fixed inset-x-0 bottom-0 z-[75] flex justify-around border-t border-[#e4e3df] bg-[#f6f5f2]/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:static md:w-[84px] md:shrink-0 md:flex-col md:items-center md:justify-center md:gap-5 md:border-0 md:bg-transparent md:p-0">
          {RAIL.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              aria-current={tab === item.id ? "page" : undefined}
              className="flex flex-col items-center gap-1.5 text-[12px] font-medium">
              <span
                className={classNames(
                  "grid h-10 w-10 place-items-center rounded-full transition md:h-12 md:w-12",
                  tab === item.id
                    ? "bg-[#121212] text-white ring-2 ring-[#121212] ring-offset-2 ring-offset-[#f6f5f2]"
                    : "bg-[#ecebe8] text-[#121212] hover:bg-[#e3e2de]"
                )}>
                <Icon name={item.icon} className="h-5 w-5" />
              </span>
              {t(item.labelKey)}
            </button>
          ))}
        </nav>

        {/* Floating panel */}
        <div className="flex min-h-0 w-full min-w-0 max-w-[600px] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04),0_10px_40px_-20px_rgba(0,0,0,.25)] md:mt-4">
          {dirty ? (
            <div className="flex items-center justify-end gap-2 border-b border-[#efeeeb] px-4 py-3 md:px-8 md:py-4">
              <button
                type="button"
                aria-label={t("studio_undo")}
                disabled={!past.length}
                onClick={undo}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#f1f0ed] disabled:opacity-30">
                <Icon name="rotate-ccw" className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label={t("studio_redo")}
                disabled={!future.length}
                onClick={redo}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#f1f0ed] disabled:opacity-30">
                <Icon name="rotate-cw" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={cancel}
                className="rounded-full border border-[#e4e3df] px-5 py-2.5 text-[15px] font-semibold hover:bg-[#f6f5f2]">
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-full bg-[#121212] px-6 py-2.5 text-[15px] font-semibold text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                data-testid="studio-save">
                {saving ? t("studio_saving") : t("save")}
              </button>
            </div>
          ) : justSaved ? (
            <div className="flex items-center justify-end gap-2 border-b border-[#efeeeb] px-4 py-3 md:px-8 md:py-4">
              <span className="flex items-center gap-2 rounded-full bg-green-600 px-6 py-2.5 text-[15px] font-semibold text-white">
                <Icon name="check" className="h-4 w-4" />
                {t("studio_saved")}
              </span>
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-10 pt-6 md:px-11 md:pt-8">
            {tab === "content" && (
              <>
                <Title>{t("studio_content")}</Title>
                <div className="mt-6 flex items-center gap-4">
                  <Avatar size="lg" imageSrc={data.avatarUrl} alt={data.name} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[18px] font-semibold">
                      {draft.name || t("studio_add_name")}
                    </div>
                    <div className="truncate text-[14px] text-[#6b6a66]">
                      {draft.bio || t("studio_add_bio")}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => go("header")}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#e4e3df] px-4 py-2 text-[14px] font-semibold hover:bg-[#f6f5f2]">
                    <Icon name="pencil" className="h-4 w-4" />
                    {t("edit")}
                  </button>
                </div>

                <div className="mt-7 flex gap-6 border-b border-[#efeeeb]">
                  <span className="-mb-px border-b-2 border-[#121212] pb-3 text-[16px] font-semibold">
                    {t("event_types_page_title")}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Link
                    href="/assistant"
                    className="flex items-center justify-center gap-2 rounded-full bg-[#ecebe8] px-4 py-3.5 text-[15px] font-semibold hover:bg-[#e3e2de]">
                    <Icon name="sparkles" className="h-4 w-4" />
                    {t("studio_ask_assistant")}
                  </Link>
                  <Link
                    href="/event-types?dialog=new&eventPage="
                    className="flex items-center justify-center gap-2 rounded-full bg-[#121212] px-4 py-3.5 text-[15px] font-semibold text-white hover:opacity-90">
                    <Icon name="plus" className="h-4 w-4" />
                    {t("studio_add_service")}
                  </Link>
                </div>

                <ul className="mt-5 space-y-3" data-testid="page-editor-services">
                  {orderedServices.length === 0 && (
                    <li className="rounded-2xl border border-dashed border-[#e4e3df] p-6 text-center text-[14px] text-[#6b6a66]">
                      {t("page_editor_no_services")}
                    </li>
                  )}
                  {orderedServices.map((service, index) => {
                    const hidden = !!draft.hidden[service.id];
                    return (
                      <li
                        key={service.id}
                        className="group flex items-center gap-3 rounded-2xl border border-[#efeeeb] bg-white px-3 py-3 shadow-[0_1px_2px_rgba(0,0,0,.03)]">
                        <div className="flex flex-col opacity-40 transition group-hover:opacity-100">
                          <button
                            type="button"
                            aria-label={t("page_editor_move_up", { title: service.title })}
                            disabled={index === 0}
                            onClick={() => move(index, -1)}
                            className="disabled:opacity-20">
                            <Icon name="chevron-up" className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={t("page_editor_move_down", { title: service.title })}
                            disabled={index === orderedServices.length - 1}
                            onClick={() => move(index, 1)}
                            className="disabled:opacity-20">
                            <Icon name="chevron-down" className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-[#efeeeb] bg-[#f6f5f2]">
                          <Icon name="clock" className="h-5 w-5" />
                        </span>
                        <div className={classNames("min-w-0 flex-1", hidden && "opacity-45")}>
                          <div className="truncate text-[16px] font-medium">{service.title}</div>
                          <div className="truncate text-[13px] text-[#6b6a66]">
                            {t("service_minutes", { count: service.length })} ·{" "}
                            {service.requiresConfirmation
                              ? t("service_kind_request_long")
                              : t("service_kind_instant_long")}
                          </div>
                        </div>
                        <Toggle
                          on={!hidden}
                          label={t("page_editor_show_on_page", { title: service.title })}
                          onChange={(on) => update({ hidden: { ...draft.hidden, [service.id]: !on } })}
                        />
                        <Link
                          href={`/event-types/${service.id}?tabName=setup`}
                          aria-label={t("edit")}
                          className="grid h-9 w-9 flex-none place-items-center rounded-full hover:bg-[#f1f0ed]">
                          <Icon name="ellipsis-vertical" className="h-4 w-4" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-8 flex items-center justify-between rounded-2xl border border-[#efeeeb] px-4 py-4">
                  <div>
                    <div className="text-[16px] font-semibold">{t("studio_footer")}</div>
                    <div className="text-[13px] text-[#6b6a66]">{t("studio_footer_hint")}</div>
                  </div>
                  <Toggle
                    on={!data.brandingHidden}
                    label={t("studio_footer")}
                    onChange={(on) => setBranding.mutate({ hideBranding: !on })}
                  />
                </div>
              </>
            )}

            {tab === "header" && (
              <>
                <Title>{t("studio_header")}</Title>
                <div className="mt-7 space-y-7">
                  <FieldRow label={t("studio_profile_image")} hint={t("studio_profile_image_hint")}>
                    <div className="flex items-center gap-3">
                      <Avatar size="lg" imageSrc={data.avatarUrl} alt={data.name} />
                      <Link
                        href="/settings/my-account/profile"
                        className="rounded-full border border-[#e4e3df] px-4 py-2 text-[14px] font-semibold hover:bg-[#f6f5f2]">
                        {t("page_editor_change_photo")}
                      </Link>
                    </div>
                  </FieldRow>
                  <div>
                    <div className="flex items-baseline justify-between">
                      <label htmlFor="studio-name" className="text-[16px] font-semibold">
                        {t("page_editor_name")}
                      </label>
                    </div>
                    <input
                      id="studio-name"
                      value={draft.name}
                      maxLength={80}
                      onChange={(e) => update({ name: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-[#e4e3df] bg-white px-3.5 py-3 text-[15px] focus:border-[#121212] focus:outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between">
                      <label htmlFor="studio-bio" className="text-[16px] font-semibold">
                        {t("page_editor_bio")}
                      </label>
                      <span className="text-[12px] text-[#6b6a66]">
                        {draft.bio.length}/{BIO_LIMIT}
                      </span>
                    </div>
                    <textarea
                      id="studio-bio"
                      value={draft.bio}
                      maxLength={BIO_LIMIT}
                      rows={4}
                      placeholder={t("page_editor_bio_placeholder")}
                      onChange={(e) => update({ bio: e.target.value })}
                      className="mt-2 w-full resize-y rounded-xl border border-[#e4e3df] bg-white px-3.5 py-3 text-[15px] leading-relaxed focus:border-[#121212] focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {tab === "design" && !sub && (
              <>
                <Title>{t("studio_design")}</Title>
                <div className="mt-7">
                  <RowCard
                    onClick={() => setSub("theme")}
                    icon={
                      <span
                        className="flex h-full w-full items-start rounded-lg p-1 text-[13px] font-bold"
                        style={{ background: theme.bg, color: theme.fg }}>
                        Aa
                      </span>
                    }
                    label={t("studio_theme")}
                    value={theme.label}
                  />
                </div>
                <div className="mb-3 mt-6 px-1 text-[16px] font-semibold">{t("studio_customize")}</div>
                <div className="space-y-3">
                  <RowCard
                    onClick={() => setSub("buttons")}
                    icon={
                      <span className="grid h-full w-full place-items-center rounded-lg bg-white">
                        <span
                          className="block h-3 w-6 bg-[#121212]"
                          style={{ borderRadius: BUTTON_RADII[draft.pageButtonShape as ButtonShape] ?? 16 }}
                        />
                      </span>
                    }
                    label={t("studio_buttons")}
                    value={t(`page_look_shape_${draft.pageButtonShape}`)}
                  />
                </div>
              </>
            )}

            {tab === "design" && sub === "theme" && (
              <>
                <SubTitle back={() => setSub(null)}>{t("studio_theme")}</SubTitle>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {PAGE_THEME_IDS.map((id: PageThemeId) => {
                    const option = PAGE_THEMES[id];
                    const selected = draft.pageTheme === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => update({ pageTheme: id })}
                        className="text-left">
                        <span
                          className={classNames(
                            "flex aspect-[4/5] flex-col justify-between rounded-2xl p-3 transition",
                            selected
                              ? "ring-2 ring-[#121212] ring-offset-2"
                              : "ring-1 ring-black/5 hover:scale-[1.02]"
                          )}
                          style={{ background: option.bg, color: option.fg }}>
                          <span className="text-[22px] font-semibold">Aa</span>
                          <span
                            className="block h-6 w-full bg-white/85"
                            style={{ borderRadius: BUTTON_RADII[draft.pageButtonShape as ButtonShape] ?? 16 }}
                          />
                        </span>
                        <span className="mt-1.5 block text-center text-[13px] font-medium">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {tab === "design" && sub === "buttons" && (
              <>
                <SubTitle back={() => setSub(null)}>{t("studio_buttons")}</SubTitle>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {BUTTON_SHAPES.map((shape) => {
                    const selected = draft.pageButtonShape === shape;
                    return (
                      <button
                        key={shape}
                        type="button"
                        onClick={() => update({ pageButtonShape: shape })}
                        className={classNames(
                          "rounded-2xl border p-4 text-center transition",
                          selected
                            ? "border-[#121212] ring-1 ring-[#121212]"
                            : "border-[#e4e3df] hover:border-[#bdbcb7]"
                        )}>
                        <span
                          className="mx-auto block h-9 w-full bg-[#121212]"
                          style={{ borderRadius: BUTTON_RADII[shape] }}
                        />
                        <span className="mt-2 block text-[13px] font-medium">
                          {t(`page_look_shape_${shape}`)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {tab === "enhance" && (
              <>
                <Title>{t("studio_enhance")}</Title>
                <p className="mt-2 text-[14px] text-[#6b6a66]">{t("studio_enhance_intro_text")}</p>
                <div className="mt-6 space-y-3">
                  {ENHANCE_PROMPTS.map((key) => (
                    <Link
                      key={key}
                      href={`/assistant?prompt=${encodeURIComponent(t(key))}`}
                      className="flex items-center gap-4 rounded-2xl border border-[#efeeeb] bg-white px-4 py-4 transition hover:border-[#dcdad5]">
                      <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-[#121212] text-white">
                        <Icon name="sparkles" className="h-5 w-5" />
                      </span>
                      <span className="flex-1 text-[15px] font-medium">{t(key)}</span>
                      <Icon name="chevron-right" className="h-5 w-5 text-[#9b9a95]" />
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Phone, with plenty of room */}
        <div className="relative hidden min-w-0 flex-1 items-center justify-center py-6 lg:flex">
          <div className="flex items-center gap-4">
            <PhoneFrame variant="bare" screenBg={theme.bg} inkColor={theme.fg} maxWidth={330}>
              <div data-testid="page-editor-preview">
                <BookingPageProfile
                  name={draft.name || data.name}
                  avatar={
                    <Avatar size="xl" imageSrc={data.avatarUrl} alt={data.name} className="rounded-none!" />
                  }
                  bio={draft.bio.trim() ? { text: draft.bio } : null}
                  services={visibleServices}
                  themeId={draft.pageTheme}
                  buttonShape={draft.pageButtonShape}
                  brandingHidden={data.brandingHidden}
                  className="min-h-full"
                />
              </div>
            </PhoneFrame>
            <div className="flex flex-col gap-1 rounded-full bg-[#ecebe8] p-1.5">
              <button
                type="button"
                onClick={share}
                title={t("studio_share")}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-white">
                <Icon name="link" className="h-5 w-5" />
              </button>
              {publicUrl && (
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={t("page_editor_open_live")}
                  className="grid h-10 w-10 place-items-center rounded-full hover:bg-white">
                  <Icon name="external-link" className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Title({ children }: { children: ReactNode }) {
  return <h2 className="text-[26px] font-bold tracking-tight">{children}</h2>;
}

function SubTitle({ back, children }: { back: () => void; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={back}
        aria-label="Back"
        className="grid h-9 w-9 place-items-center rounded-full border border-[#e4e3df] hover:bg-[#f6f5f2]">
        <Icon name="chevron-left" className="h-5 w-5" />
      </button>
      <h2 className="text-[26px] font-bold tracking-tight">{children}</h2>
    </div>
  );
}

function RowCard(props: { icon: ReactNode; label: string; value: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="flex w-full items-center gap-4 rounded-2xl border border-[#efeeeb] bg-white px-4 py-4 text-left shadow-[0_1px_2px_rgba(0,0,0,.03)] transition hover:border-[#dcdad5]">
      <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#efeeeb] bg-[#f6f5f2] p-0.5">
        {props.icon}
      </span>
      <span className="flex-1 text-[17px] font-medium">{props.label}</span>
      <span className="text-[16px] text-[#6b6a66]">{props.value}</span>
      <Icon name="chevron-right" className="h-5 w-5 text-[#9b9a95]" />
    </button>
  );
}

function FieldRow(props: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-[16px] font-semibold">{props.label}</div>
        {props.hint && <div className="text-[13px] text-[#6b6a66]">{props.hint}</div>}
      </div>
      {props.children}
    </div>
  );
}

function Toggle(props: { on: boolean; label: string; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.on}
      aria-label={props.label}
      onClick={() => props.onChange(!props.on)}
      className={classNames(
        "relative h-7 w-12 flex-none rounded-full transition-colors",
        props.on ? "bg-[#121212]" : "bg-[#dcdbd7]"
      )}>
      <span
        className={classNames(
          "absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
          props.on && "translate-x-5"
        )}
      />
    </button>
  );
}
