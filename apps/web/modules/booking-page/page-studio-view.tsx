"use client";

import {
  BUTTON_FILLS,
  BUTTON_RADII,
  BUTTON_SHAPES,
  type ButtonFill,
  type ButtonShape,
  PAGE_FONT_IDS,
  PAGE_FONTS,
  PAGE_THEME_IDS,
  PAGE_THEMES,
  type PageFont,
  type PageStyle,
  type PageThemeId,
  resolvePageLook,
} from "@calcom/features/booking-page-theme/themes";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { RouterOutputs } from "@calcom/trpc/react";
import { trpc } from "@calcom/trpc/react";
import { Avatar } from "@calcom/ui/components/avatar";
import type { IconName } from "@calcom/ui/components/icon";
import { Icon } from "@calcom/ui/components/icon";
import { showToast } from "@calcom/ui/components/toast";
import classNames from "classnames";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";
import { BookingPageProfile } from "./BookingPageProfile";
import { CalendarPanel } from "./CalendarPanel";
import { PhoneFrame } from "./PhoneFrame";
import { BrowserFrame, LivePageFrame } from "./PreviewFrames";
import { ServiceForm } from "./ServiceForm";
import { StudioAssistant } from "./StudioAssistant";
import { ColourInput, FieldRow, OptionTile, Segmented, Toggle } from "./studio-controls";

type Tab = "content" | "calendar" | "header" | "design" | "enhance";
type Sub = null | "theme" | "wallpaper" | "buttons" | "text" | "colours" | "footer";
/** Screens that open inside the panel instead of sending the owner to another page. */
type Screen = null | { kind: "assistant"; prompt?: string } | { kind: "service"; id?: number };
type PreviewDevice = "mobile" | "web";

type Draft = {
  name: string;
  bio: string;
  pageTheme: string;
  pageButtonShape: string;
  style: PageStyle;
  /** Service ids in display order */
  order: number[];
  hidden: Record<number, boolean>;
};

const RAIL: { id: Tab; labelKey: string; icon: IconName }[] = [
  { id: "content", labelKey: "studio_content", icon: "layers" },
  { id: "calendar", labelKey: "studio_calendar", icon: "calendar" },
  { id: "header", labelKey: "studio_header", icon: "user" },
  { id: "design", labelKey: "studio_design", icon: "paintbrush" },
  { id: "enhance", labelKey: "studio_enhance", icon: "message-circle" },
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
  // Read after mount so the server render and the first client render match.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    if (requested === "header" || requested === "design" || requested === "enhance") setTab(requested);
  }, []);
  const [sub, setSub] = useState<Sub>(null);
  const [base, setBase] = useState<Draft | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [past, setPast] = useState<Draft[]>([]);
  const [future, setFuture] = useState<Draft[]>([]);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOrder, setDragOrder] = useState<number[] | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [calendarScope, setCalendarScope] = useState<number | null>(null);
  const [screen, setScreen] = useState<Screen>(null);
  const [previewServiceId, setPreviewServiceId] = useState<number | null>(null);
  const [device, setDevice] = useState<PreviewDevice>("mobile");

  // Fill the draft once; later refetches must not wipe unsaved edits.
  useEffect(() => {
    if (!query.data || base) return;
    const initial = draftFrom(query.data);
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
  const setPhoto = trpc.viewer.me.updateProfile.useMutation({
    onSuccess: async () => {
      await utils.viewer.pageLook.editor.invalidate();
      await utils.viewer.me.invalidate();
      showToast(t("studio_photo_updated"), "success");
    },
    onError: () => showToast(t("studio_photo_failed"), "error"),
  });

  const onPhotoPicked = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > PHOTO_SIZE_LIMIT) {
      showToast(t("image_size_limit_exceed"), "error");
      return;
    }
    try {
      setPhoto.mutate({ avatarUrl: await toSquareJpeg(file) });
    } catch {
      showToast(t("studio_photo_failed"), "error");
    }
  };

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
  const listServices = (dragOrder ?? draft.order).map((id) => serviceById.get(id)).filter((s) => !!s);
  const visibleServices = orderedServices.filter((s) => !draft.hidden[s.id]);
  const look = resolvePageLook(draft.pageTheme, draft.pageButtonShape, draft.style);
  const publicUrl = data.username ? `/${data.username}` : null;

  const update = (patch: Partial<Draft>) => {
    setPast((p) => [...p.slice(-49), draft]);
    setFuture([]);
    setDraft({ ...draft, ...patch });
  };
  const updateStyle = (patch: PageStyle) => update({ style: { ...draft.style, ...patch } });
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
      const lookChanged =
        draft.pageTheme !== base.pageTheme ||
        draft.pageButtonShape !== base.pageButtonShape ||
        JSON.stringify(draft.style) !== JSON.stringify(base.style);
      if (lookChanged) {
        jobs.push(
          updateLook.mutateAsync({
            pageTheme: draft.pageTheme,
            pageButtonShape: draft.pageButtonShape,
            pageStyle: draft.style as Record<string, unknown>,
          })
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
    setScreen(null);
  };

  // Services and the assistant save straight to the server. Unsaved panel edits are kept; new services are
  // added to both the saved and draft order so they don't show up as an unsaved reorder.
  const refreshFromServer = async () => {
    await utils.viewer.pageLook.editor.invalidate();
    const fresh = utils.viewer.pageLook.editor.getData();
    if (!fresh) return;
    const next = draftFrom(fresh);
    if (!dirty) {
      setBase(next);
      setDraft(next);
      return;
    }
    const added = next.order.filter((id) => !base.order.includes(id));
    const addedHidden = Object.fromEntries(added.map((id) => [id, next.hidden[id]]));
    setBase({ ...base, order: [...base.order, ...added], hidden: { ...base.hidden, ...addedHidden } });
    setDraft({ ...draft, order: [...draft.order, ...added], hidden: { ...draft.hidden, ...addedHidden } });
  };

  // Drag order is kept apart from the draft so one drag is one undo step, not one per row crossed.
  const dragOver = (overId: number) => {
    if (dragId === null || overId === dragId || !dragOrder) return;
    const order = dragOrder.filter((id) => id !== dragId);
    order.splice(dragOrder.indexOf(overId), 0, dragId);
    setDragOrder(order);
  };

  const finishDrag = () => {
    if (dragOrder && dragOrder.join(",") !== draft.order.join(",")) update({ order: dragOrder });
    setDragId(null);
    setDragOrder(null);
  };

  const move = (index: number, direction: -1 | 1) => {
    const order = [...draft.order];
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    update({ order });
  };

  const SUB_TITLES: Record<Exclude<Sub, null>, string> = {
    theme: t("studio_theme"),
    wallpaper: t("studio_wallpaper"),
    buttons: t("studio_buttons"),
    text: t("studio_text"),
    colours: t("studio_colours"),
    footer: t("studio_footer_title"),
  };
  const editingService = screen?.kind === "service" && screen.id ? serviceById.get(screen.id) : undefined;
  const panelTitle =
    screen?.kind === "assistant"
      ? t("studio_ask_assistant")
      : screen?.kind === "service"
        ? editingService
          ? t("studio_edit_service")
          : t("studio_add_service")
        : sub
          ? SUB_TITLES[sub]
          : t(RAIL.find((r) => r.id === tab)?.labelKey ?? "studio_content");
  const back = screen ? () => setScreen(null) : sub ? () => setSub(null) : null;

  const previewCalendarId =
    tab === "calendar" && !screen
      ? (calendarScope ?? visibleServices[0]?.id ?? orderedServices[0]?.id ?? null)
      : previewServiceId;
  const previewCalendar = previewCalendarId ? serviceById.get(previewCalendarId) : undefined;
  const previewPath = data.username && previewCalendar ? `/${data.username}/${previewCalendar.slug}` : null;
  const studioLook = {
    pageTheme: draft.pageTheme,
    pageButtonShape: draft.pageButtonShape,
    pageStyle: draft.style,
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#f6f5f2] text-[#121212]" data-testid="page-editor">
      {/* The studio renders outside Shell, which is where the app's Toaster normally lives. */}
      <Toaster position="bottom-center" />
      {/* Top bar: menu · page pill · Share */}
      <div
        className="relative z-[70] flex shrink-0 items-center justify-between px-4 md:px-6"
        style={{ paddingTop: 22, paddingBottom: 10 }}>
        <Link
          href="/home"
          aria-label={t("studio_back_home")}
          className="grid h-10 w-10 place-items-center rounded-full bg-[#ecebe8] hover:bg-[#e3e2de]">
          <Icon name="menu" className="h-[18px] w-[18px]" />
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-full bg-[#ecebe8] py-1 pl-1 pr-3 text-[13.5px] font-semibold hover:bg-[#e3e2de]">
            <Avatar size="sm" imageSrc={data.avatarUrl} alt={data.name} />
            <span className="max-w-[200px] truncate">{draft.name || data.name}</span>
            <Icon name="chevron-down" className="h-3.5 w-3.5" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden />
              <div className="absolute left-1/2 z-50 mt-2 w-56 -translate-x-1/2 rounded-2xl bg-white p-1.5 shadow-[0_18px_50px_-12px_rgba(0,0,0,.3)]">
                {[
                  { href: "/home", label: t("home_page_title") },
                  { href: "/event-types", label: t("event_types_page_title") },
                  { href: "/bookings/upcoming", label: t("bookings") },
                  { href: "/settings/my-account/profile", label: t("settings") },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-xl px-3 py-2 text-[13px] hover:bg-[#f6f5f2]">
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
          className="flex items-center gap-2 rounded-full bg-[#ecebe8] px-3.5 py-2 text-[13.5px] font-semibold hover:bg-[#e3e2de]">
          <Icon name="share-2" className="h-3.5 w-3.5" />
          {copied ? t("studio_link_copied") : t("studio_share")}
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 pb-[64px] md:pb-0">
        {/* Rail: round buttons with labels (a bottom tab bar on phones) */}
        <nav
          className="fixed inset-x-0 bottom-0 z-[75] flex justify-around border-t border-[#e4e3df] bg-[#f6f5f2]/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:static md:w-[112px] md:shrink-0 md:flex-col md:items-center md:justify-center md:gap-6 md:border-0 md:bg-transparent md:p-0"
          // Inline sizes keep the rail from collapsing if the browser holds an older stylesheet during dev reloads.
          style={{ flexShrink: 0, paddingLeft: 16, paddingRight: 16, rowGap: 20 }}>
          {RAIL.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              aria-current={tab === item.id ? "page" : undefined}
              className="flex flex-col items-center gap-1.5 text-[11px] font-medium md:text-[12.5px]"
              style={{ width: 64 }}>
              <span
                className={classNames(
                  "grid h-10 w-10 flex-none place-items-center rounded-full transition md:h-12 md:w-12",
                  tab === item.id
                    ? "bg-[#121212] text-white ring-2 ring-[#121212] ring-offset-2 ring-offset-[#f6f5f2]"
                    : "bg-[#ecebe8] text-[#121212] hover:bg-[#e3e2de]"
                )}>
                <Icon name={item.icon} className="h-[18px] w-[18px]" />
              </span>
              {t(item.labelKey)}
            </button>
          ))}
        </nav>

        {/* Floating panel */}
        <div
          className="flex min-h-0 w-full min-w-0 flex-col overflow-hidden bg-white md:mt-5"
          // Inline so the panel keeps its size even if a browser holds an older stylesheet during dev reloads.
          style={{
            maxWidth: 560,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            boxShadow: "0 0 0 1px rgba(0,0,0,.04), 0 10px 40px -20px rgba(0,0,0,.25)",
          }}>
          {/* Title and actions share one fixed row, so editing never shifts the content below. */}
          <div className="flex h-[72px] flex-none items-center justify-between gap-3 px-5 md:h-[92px] md:px-10 md:pt-3">
            <div className="flex min-w-0 items-center gap-2.5">
              {back && (
                <button
                  type="button"
                  onClick={back}
                  aria-label={t("back")}
                  className="grid h-8 w-8 flex-none place-items-center rounded-full border border-[#e4e3df] hover:bg-[#f6f5f2]">
                  <Icon name="chevron-left" className="h-4 w-4" />
                </button>
              )}
              <h2 className="truncate text-[20px] font-bold tracking-tight md:text-[22px]">{panelTitle}</h2>
            </div>
            <div className="flex flex-none items-center gap-1.5">
              {dirty ? (
                <>
                  <button
                    type="button"
                    aria-label={t("studio_undo")}
                    disabled={!past.length}
                    onClick={undo}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#f1f0ed] disabled:opacity-30">
                    <Icon name="rotate-ccw" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={t("studio_redo")}
                    disabled={!future.length}
                    onClick={redo}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#f1f0ed] disabled:opacity-30">
                    <Icon name="rotate-cw" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={cancel}
                    className="rounded-full border border-[#e4e3df] px-4 py-1.5 text-[13px] font-semibold hover:bg-[#f6f5f2]">
                    {t("cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    className="rounded-full bg-[#121212] px-4 py-1.5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                    data-testid="studio-save">
                    {saving ? t("studio_saving") : t("save")}
                  </button>
                </>
              ) : justSaved ? (
                <span className="flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-1.5 text-[13px] font-semibold text-white">
                  <Icon name="check" className="h-3.5 w-3.5" />
                  {t("studio_saved")}
                </span>
              ) : null}
            </div>
          </div>

          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-12 pt-1 text-[14px] md:px-10">
            {!screen && tab === "content" && (
              <>
                <div className="flex items-center gap-4">
                  <Avatar size="lg" imageSrc={data.avatarUrl} alt={data.name} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[16px] font-semibold">
                      {draft.name || t("studio_add_name")}
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-[#6b6a66]">
                      {draft.bio || t("studio_add_bio")}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => go("header")}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#e4e3df] px-3.5 py-1.5 text-[13px] font-semibold hover:bg-[#f6f5f2]">
                    <Icon name="pencil" className="h-3.5 w-3.5" />
                    {t("edit")}
                  </button>
                </div>

                <div className="mt-7 flex gap-6 border-b border-[#efeeeb]">
                  <span className="-mb-px border-b-[3px] border-[#121212] px-1 pb-2.5 text-[14px] font-semibold">
                    {t("event_types_page_title")}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setScreen({ kind: "assistant" })}
                    data-testid="studio-open-assistant"
                    className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#ecebe8] px-4 text-[14px] font-semibold hover:bg-[#e3e2de]">
                    <Icon name="message-circle" className="h-4 w-4" />
                    {t("studio_ask_assistant")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreen({ kind: "service" })}
                    data-testid="studio-add-service"
                    className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#121212] px-4 text-[14px] font-semibold text-white hover:opacity-90">
                    <Icon name="plus" className="h-4 w-4" />
                    {t("studio_add_service")}
                  </button>
                </div>

                <ul
                  className="mt-6 flex flex-col"
                  style={{ rowGap: 12 }}
                  data-testid="page-editor-services"
                  onDragOver={(e) => dragId !== null && e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    finishDrag();
                  }}>
                  {listServices.length === 0 && (
                    <li className="rounded-2xl border border-dashed border-[#e4e3df] p-6 text-center text-[13px] text-[#6b6a66]">
                      {t("page_editor_no_services")}
                    </li>
                  )}
                  {listServices.map((service, index) => {
                    const hidden = !!draft.hidden[service.id];
                    return (
                      <li
                        key={service.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", String(service.id));
                          setDragId(service.id);
                          setDragOrder(draft.order);
                        }}
                        onDragEnter={() => dragOver(service.id)}
                        onDragEnd={finishDrag}
                        className={classNames(
                          "group flex min-h-[72px] items-center gap-3.5 border border-[#ebeae6] bg-white py-3.5 pl-2 pr-3 shadow-[0_1px_3px_rgba(0,0,0,.04)] transition hover:border-[#dcdad5]",
                          dragId === service.id && "opacity-50"
                        )}
                        style={{ borderRadius: 22 }}>
                        <button
                          type="button"
                          aria-label={t("page_editor_drag_to_reorder", { title: service.title })}
                          title={t("page_editor_drag_to_reorder", { title: service.title })}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowUp") {
                              e.preventDefault();
                              move(index, -1);
                            }
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              move(index, 1);
                            }
                          }}
                          className="grid h-10 w-6 flex-none cursor-grab place-items-center rounded-lg text-[#a3a29d] hover:bg-[#f6f5f2] hover:text-[#121212] active:cursor-grabbing">
                          <GripDots />
                        </button>
                        <span
                          className="grid flex-none place-items-center"
                          style={{ width: 40, height: 40, background: "#f3f2ef", borderRadius: 14 }}>
                          <Icon name="clock" className="h-[17px] w-[17px]" />
                        </span>
                        <div
                          className={classNames("min-w-0 flex-1 transition-opacity", hidden && "opacity-45")}>
                          <div className="truncate text-[14.5px] font-semibold">{service.title}</div>
                          <div className="mt-0.5 truncate text-[12.5px] text-[#6b6a66]">
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
                        <button
                          type="button"
                          onClick={() => setScreen({ kind: "service", id: service.id })}
                          aria-label={t("studio_edit_service_named", { title: service.title })}
                          className="grid h-8 w-8 flex-none place-items-center rounded-full hover:bg-[#f1f0ed]">
                          <Icon name="ellipsis-vertical" className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {!screen && tab === "header" && (
              <div className="space-y-6">
                <FieldRow label={t("studio_profile_image")} hint={t("studio_profile_image_hint")}>
                  <div className="flex items-center gap-3">
                    <Avatar size="md" imageSrc={data.avatarUrl} alt={data.name} />
                    <label
                      className={classNames(
                        "cursor-pointer rounded-full border border-[#e4e3df] px-3.5 py-1.5 text-[13px] font-semibold hover:bg-[#f6f5f2]",
                        setPhoto.isPending && "pointer-events-none opacity-60"
                      )}>
                      {setPhoto.isPending ? t("studio_uploading_photo") : t("page_editor_change_photo")}
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        data-testid="studio-photo-input"
                        disabled={setPhoto.isPending}
                        onChange={(e) => {
                          void onPhotoPicked(e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </FieldRow>
                <div>
                  <label htmlFor="studio-name" className="text-[14px] font-semibold">
                    {t("studio_title_field")}
                  </label>
                  <input
                    id="studio-name"
                    value={draft.name}
                    maxLength={80}
                    onChange={(e) => update({ name: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-[#e4e3df] bg-white px-3 py-2.5 text-[14px] focus:border-[#121212] focus:outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="studio-bio" className="text-[14px] font-semibold">
                      {t("page_editor_bio")}
                    </label>
                    <span className="text-[11px] text-[#6b6a66]">
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
                    className="mt-1.5 w-full resize-y rounded-xl border border-[#e4e3df] bg-white px-3 py-2.5 text-[14px] leading-relaxed focus:border-[#121212] focus:outline-none"
                  />
                </div>
                <FieldRow label={t("studio_title_colour")} hint={t("studio_title_colour_hint")}>
                  <ColourInput
                    value={draft.style.titleColor ?? look.fg}
                    onChange={(value) => updateStyle({ titleColor: value })}
                  />
                </FieldRow>
              </div>
            )}

            {!screen && tab === "design" && !sub && (
              <>
                <RowCard
                  onClick={() => setSub("theme")}
                  icon={
                    <span
                      className="flex h-full w-full items-start rounded-lg p-1 text-[12px] font-bold"
                      style={{ background: look.theme.bg, color: look.theme.fg }}>
                      Aa
                    </span>
                  }
                  label={t("studio_theme")}
                  value={Object.keys(draft.style).length ? t("studio_custom") : look.theme.label}
                />
                <div className="mb-2.5 mt-5 px-1 text-[14px] font-semibold">{t("studio_customize")}</div>
                <div className="space-y-2.5">
                  <RowCard
                    onClick={() => setSub("wallpaper")}
                    icon={
                      <span className="h-full w-full rounded-lg" style={{ background: look.background }} />
                    }
                    label={t("studio_wallpaper")}
                    value={
                      draft.style.wallpaper?.kind === "gradient" ? t("studio_gradient") : t("studio_fill")
                    }
                  />
                  <RowCard
                    onClick={() => setSub("buttons")}
                    icon={
                      <span
                        className="grid h-full w-full place-items-center rounded-lg"
                        style={{ background: look.background }}>
                        <span
                          className="block h-3 w-6 border"
                          style={{
                            borderRadius: look.radius,
                            background: look.buttonBg,
                            borderColor: look.buttonBorder,
                          }}
                        />
                      </span>
                    }
                    label={t("studio_buttons")}
                    value={t(`studio_fill_${draft.style.button?.fill ?? "solid"}`)}
                  />
                  <RowCard
                    onClick={() => setSub("text")}
                    icon={
                      <span
                        className="grid h-full w-full place-items-center text-[14px] font-semibold"
                        style={{ fontFamily: look.font }}>
                        Aa
                      </span>
                    }
                    label={t("studio_text")}
                    value={PAGE_FONTS[draft.style.font ?? "albert"].label}
                  />
                  <RowCard
                    onClick={() => setSub("colours")}
                    icon={
                      <span className="flex h-full w-full overflow-hidden rounded-lg">
                        <span className="w-1/2" style={{ background: look.screenBg }} />
                        <span className="w-1/2" style={{ background: look.fg }} />
                      </span>
                    }
                    label={t("studio_colours")}
                    value=""
                  />
                  <RowCard
                    onClick={() => setSub("footer")}
                    icon={<Icon name="layout-dashboard" className="h-4 w-4" />}
                    label={t("studio_footer_title")}
                    value={data.brandingHidden ? t("studio_footer_off") : t("studio_footer_on")}
                  />
                </div>
              </>
            )}

            {!screen && tab === "design" && sub === "theme" && (
              <>
                <p className="text-[13px] text-[#6b6a66]">{t("studio_theme_hint")}</p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {PAGE_THEME_IDS.map((id: PageThemeId) => {
                    const option = PAGE_THEMES[id];
                    const selected = draft.pageTheme === id && !Object.keys(draft.style).length;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => update({ pageTheme: id, style: {} })}
                        className="text-left">
                        <span
                          className={classNames(
                            "flex aspect-[4/5] flex-col justify-between rounded-2xl p-2.5 transition",
                            selected
                              ? "ring-2 ring-[#121212] ring-offset-2"
                              : "ring-1 ring-black/5 hover:scale-[1.02]"
                          )}
                          style={{ background: option.bg, color: option.fg }}>
                          <span className="text-[18px] font-semibold">Aa</span>
                          <span
                            className="block h-5 w-full bg-white/85"
                            style={{ borderRadius: look.radius }}
                          />
                        </span>
                        <span className="mt-1 block text-center text-[12px] font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {!screen && tab === "design" && sub === "wallpaper" && (
              <div className="space-y-5">
                <Segmented
                  value={draft.style.wallpaper?.kind ?? "solid"}
                  options={[
                    { value: "solid", label: t("studio_fill") },
                    { value: "gradient", label: t("studio_gradient") },
                  ]}
                  onChange={(kind) =>
                    updateStyle({
                      wallpaper: {
                        kind: kind as "solid" | "gradient",
                        color: draft.style.wallpaper?.color ?? look.theme.bg,
                        color2: draft.style.wallpaper?.color2 ?? "#ffffff",
                      },
                    })
                  }
                />
                <FieldRow
                  label={
                    draft.style.wallpaper?.kind === "gradient" ? t("studio_top_colour") : t("studio_colour")
                  }>
                  <ColourInput
                    value={draft.style.wallpaper?.color ?? look.theme.bg}
                    onChange={(color) =>
                      updateStyle({
                        wallpaper: {
                          kind: draft.style.wallpaper?.kind ?? "solid",
                          ...draft.style.wallpaper,
                          color,
                        },
                      })
                    }
                  />
                </FieldRow>
                {draft.style.wallpaper?.kind === "gradient" && (
                  <FieldRow label={t("studio_bottom_colour")}>
                    <ColourInput
                      value={draft.style.wallpaper?.color2 ?? "#ffffff"}
                      onChange={(color2) =>
                        updateStyle({ wallpaper: { kind: "gradient", ...draft.style.wallpaper, color2 } })
                      }
                    />
                  </FieldRow>
                )}
              </div>
            )}

            {!screen && tab === "design" && sub === "buttons" && (
              <div className="space-y-6">
                <div>
                  <div className="text-[14px] font-semibold">{t("studio_button_style")}</div>
                  <div className="mt-2.5 grid grid-cols-3 gap-2.5">
                    {BUTTON_FILLS.map((fill: ButtonFill) => (
                      <OptionTile
                        key={fill}
                        selected={(draft.style.button?.fill ?? "solid") === fill}
                        onClick={() => updateStyle({ button: { ...draft.style.button, fill } })}
                        label={t(`studio_fill_${fill}`)}>
                        <span
                          className="block h-7 w-full border"
                          style={{
                            borderRadius: look.radius,
                            background:
                              fill === "solid" ? "#121212" : fill === "soft" ? "#12121226" : "transparent",
                            borderColor: fill === "outline" ? "#121212" : "transparent",
                          }}
                        />
                      </OptionTile>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[14px] font-semibold">{t("studio_corners")}</div>
                  <div className="mt-2.5 grid grid-cols-3 gap-2.5">
                    {BUTTON_SHAPES.map((shape: ButtonShape) => (
                      <OptionTile
                        key={shape}
                        selected={draft.pageButtonShape === shape}
                        onClick={() => update({ pageButtonShape: shape })}
                        label={t(`page_look_shape_${shape}`)}>
                        <span
                          className="block h-7 w-full bg-[#121212]"
                          style={{ borderRadius: BUTTON_RADII[shape] }}
                        />
                      </OptionTile>
                    ))}
                  </div>
                </div>
                <FieldRow label={t("studio_button_colour")}>
                  <ColourInput
                    value={draft.style.button?.color ?? "#ffffff"}
                    onChange={(color) => updateStyle({ button: { ...draft.style.button, color } })}
                  />
                </FieldRow>
                <FieldRow label={t("studio_button_text_colour")}>
                  <ColourInput
                    value={draft.style.button?.text ?? "#121212"}
                    onChange={(text) => updateStyle({ button: { ...draft.style.button, text } })}
                  />
                </FieldRow>
              </div>
            )}

            {!screen && tab === "design" && sub === "text" && (
              <div className="grid grid-cols-2 gap-2.5">
                {PAGE_FONT_IDS.map((font: PageFont) => (
                  <OptionTile
                    key={font}
                    selected={(draft.style.font ?? "albert") === font}
                    onClick={() => updateStyle({ font })}
                    label={PAGE_FONTS[font].label}>
                    <span
                      className="block text-[26px] font-semibold leading-none"
                      style={{ fontFamily: PAGE_FONTS[font].stack }}>
                      Aa
                    </span>
                  </OptionTile>
                ))}
              </div>
            )}

            {!screen && tab === "design" && sub === "colours" && (
              <div className="space-y-5">
                <FieldRow label={t("studio_page_text_colour")} hint={t("studio_page_text_colour_hint")}>
                  <ColourInput
                    value={draft.style.textColor ?? look.theme.fg}
                    onChange={(textColor) => updateStyle({ textColor })}
                  />
                </FieldRow>
                <FieldRow label={t("studio_title_colour")}>
                  <ColourInput
                    value={draft.style.titleColor ?? look.fg}
                    onChange={(titleColor) => updateStyle({ titleColor })}
                  />
                </FieldRow>
                <button
                  type="button"
                  onClick={() => update({ style: {} })}
                  className="text-[13px] font-medium text-[#6b6a66] underline">
                  {t("studio_reset_to_theme")}
                </button>
              </div>
            )}

            {!screen && tab === "design" && sub === "footer" && (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#efeeeb] px-4 py-3.5">
                <div>
                  <div className="text-[14px] font-semibold">{t("studio_footer")}</div>
                  <div className="text-[12px] text-[#6b6a66]">{t("studio_footer_hint")}</div>
                </div>
                <Toggle
                  on={!data.brandingHidden}
                  label={t("studio_footer")}
                  onChange={(on) => setBranding.mutate({ hideBranding: !on })}
                />
              </div>
            )}

            {!screen && tab === "calendar" && (
              <CalendarPanel
                style={draft.style}
                services={orderedServices}
                scope={calendarScope}
                onScopeChange={setCalendarScope}
                onChange={updateStyle}
              />
            )}

            {!screen && tab === "enhance" && (
              <>
                <p className="text-[13px] text-[#6b6a66]">{t("studio_enhance_intro_text")}</p>
                <div className="mt-4 space-y-2.5">
                  {ENHANCE_PROMPTS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setScreen({ kind: "assistant", prompt: t(key) })}
                      className="flex w-full items-center gap-3.5 rounded-2xl border border-[#efeeeb] bg-white px-4 py-3.5 text-left transition hover:border-[#dcdad5]">
                      <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-[#121212] text-white">
                        <Icon name="message-circle" className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-[14px] font-medium">{t(key)}</span>
                      <Icon name="chevron-right" className="h-4 w-4 text-[#9b9a95]" />
                    </button>
                  ))}
                </div>
              </>
            )}

            {screen?.kind === "assistant" && (
              <StudioAssistant initialPrompt={screen.prompt} onChanged={() => void refreshFromServer()} />
            )}

            {screen?.kind === "service" && (
              <ServiceForm
                key={screen.id ?? "new"}
                serviceId={screen.id}
                initial={
                  editingService
                    ? {
                        title: editingService.title,
                        length: editingService.length,
                        description: editingService.description ?? "",
                        requiresConfirmation: editingService.requiresConfirmation,
                      }
                    : undefined
                }
                onCancel={() => setScreen(null)}
                onDone={async (id) => {
                  await refreshFromServer();
                  showToast(screen.id ? t("studio_service_saved") : t("studio_service_created"), "success");
                  setScreen(null);
                  setPreviewServiceId(id);
                }}
              />
            )}
          </div>
        </div>

        {/* Preview, with plenty of room */}
        <div className="relative hidden min-w-0 flex-1 flex-col items-center justify-center gap-4 py-5 lg:flex">
          <div className="flex items-center gap-2.5">
            {previewServiceId !== null && tab !== "calendar" && (
              <button
                type="button"
                onClick={() => setPreviewServiceId(null)}
                className="flex items-center gap-1.5 rounded-full bg-[#ecebe8] px-3.5 py-2 text-[13px] font-semibold hover:bg-[#e3e2de]"
                data-testid="preview-back">
                <Icon name="chevron-left" className="h-3.5 w-3.5" />
                {t("studio_preview_back")}
              </button>
            )}
            <Segmented
              value={device}
              onChange={setDevice}
              options={[
                { value: "mobile", label: t("studio_preview_mobile") },
                { value: "web", label: t("studio_preview_web") },
              ]}
            />
          </div>
          <div className="flex w-full items-center justify-center gap-4">
            {device === "mobile" ? (
              <PhoneFrame
                variant="device"
                screenBg={look.screenBg}
                inkColor={look.fg}
                maxWidth={340}
                fill={!!previewPath}>
                {previewPath ? (
                  <LivePageFrame
                    key={previewPath}
                    path={previewPath}
                    look={studioLook}
                    title={t("studio_preview_calendar")}
                  />
                ) : (
                  <div data-testid="page-editor-preview">
                    <BookingPageProfile
                      name={draft.name || data.name}
                      avatar={
                        <Avatar
                          size="xl"
                          imageSrc={data.avatarUrl}
                          alt={data.name}
                          className="rounded-none!"
                        />
                      }
                      bio={draft.bio.trim() ? { text: draft.bio } : null}
                      services={visibleServices}
                      themeId={draft.pageTheme}
                      buttonShape={draft.pageButtonShape}
                      pageStyle={draft.style}
                      brandingHidden={data.brandingHidden}
                      onSelect={(service) => setPreviewServiceId(service.id)}
                      className="min-h-full"
                    />
                  </div>
                )}
              </PhoneFrame>
            ) : (
              <BrowserFrame
                url={`${typeof window === "undefined" ? "" : window.location.host}${previewPath ?? publicUrl ?? ""}`}>
                {previewPath ? (
                  <LivePageFrame
                    key={previewPath}
                    path={previewPath}
                    look={studioLook}
                    title={t("studio_preview_calendar")}
                  />
                ) : (
                  <div data-testid="page-editor-preview">
                    <BookingPageProfile
                      name={draft.name || data.name}
                      avatar={
                        <Avatar
                          size="xl"
                          imageSrc={data.avatarUrl}
                          alt={data.name}
                          className="rounded-none!"
                        />
                      }
                      bio={draft.bio.trim() ? { text: draft.bio } : null}
                      services={visibleServices}
                      themeId={draft.pageTheme}
                      buttonShape={draft.pageButtonShape}
                      pageStyle={draft.style}
                      brandingHidden={data.brandingHidden}
                      onSelect={(service) => setPreviewServiceId(service.id)}
                    />
                  </div>
                )}
              </BrowserFrame>
            )}
            <div className="flex flex-col gap-1 rounded-full bg-[#ecebe8] p-1.5">
              <button
                type="button"
                onClick={share}
                title={t("studio_share")}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-white">
                <Icon name="link" className="h-4 w-4" />
              </button>
              {publicUrl && (
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={t("page_editor_open_live")}
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-white">
                  <Icon name="external-link" className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type EditorData = RouterOutputs["viewer"]["pageLook"]["editor"];

function draftFrom(data: EditorData): Draft {
  return {
    name: data.name,
    bio: data.bio,
    pageTheme: data.pageTheme,
    pageButtonShape: data.pageButtonShape,
    style: data.pageStyle,
    order: data.services.map((s) => s.id),
    hidden: Object.fromEntries(data.services.map((s) => [s.id, s.hidden])),
  };
}

const PHOTO_SIZE_LIMIT = 5 * 1000000;
const PHOTO_SIZE_PX = 512;

/** Centre-crops to a square JPEG so any format the browser can open (HEIC, WebP…) is accepted by the upload. */
async function toSquareJpeg(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = PHOTO_SIZE_PX;
  canvas.height = PHOTO_SIZE_PX;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to prepare photo: canvas 2D context is unavailable");
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    PHOTO_SIZE_PX,
    PHOTO_SIZE_PX
  );
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.9);
}

function GripDots() {
  return (
    <span className="grid grid-cols-2" style={{ gap: 3 }} aria-hidden>
      {[0, 1, 2, 3, 4, 5].map((dot) => (
        <span key={dot} className="block rounded-full bg-current" style={{ width: 4, height: 4 }} />
      ))}
    </span>
  );
}

function RowCard(props: { icon: ReactNode; label: string; value: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="flex w-full items-center gap-3.5 rounded-2xl border border-[#efeeeb] bg-white px-3.5 py-3 text-left shadow-[0_1px_2px_rgba(0,0,0,.03)] transition hover:border-[#dcdad5]">
      <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#efeeeb] bg-[#f6f5f2] p-0.5">
        {props.icon}
      </span>
      <span className="flex-1 text-[14px] font-medium">{props.label}</span>
      <span className="text-[13px] text-[#6b6a66]">{props.value}</span>
      <Icon name="chevron-right" className="h-4 w-4 text-[#9b9a95]" />
    </button>
  );
}
