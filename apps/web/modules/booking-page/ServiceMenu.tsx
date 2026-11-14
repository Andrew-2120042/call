"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import type { IconName } from "@calcom/ui/components/icon";
import { Icon } from "@calcom/ui/components/icon";
import { showToast } from "@calcom/ui/components/toast";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";

// Space the menu needs below its button; with less room it opens upwards instead.
const MENU_ROOM = 320;

type Props = {
  service: { id: number; title: string; slug: string; length: number; description: string | null };
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onPreview: () => void;
  onMove: (to: "top" | "up" | "down") => void;
  /** After a duplicate or delete has been saved on the server. */
  onChanged: () => Promise<void>;
};

/** The ⋮ menu on a service card, like Linktree's: every action happens inside the editor. */
export function ServiceMenu({ service, isFirst, isLast, onEdit, onPreview, onMove, onChanged }: Props) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const duplicate = trpc.viewer.eventTypesHeavy.duplicate.useMutation();
  const remove = trpc.viewer.eventTypes.delete.useMutation();
  const busy = duplicate.isPending || remove.isPending;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setConfirmDelete(false);
  };

  const run = (action: () => void) => {
    close();
    action();
  };

  const onDuplicate = async () => {
    try {
      await duplicate.mutateAsync({
        id: service.id,
        title: t("studio_service_copy_title", { title: service.title }),
        slug: `${service.slug}-copy-${Date.now().toString(36)}`,
        description: service.description ?? "",
        length: service.length,
      });
      await onChanged();
      showToast(t("studio_service_duplicated"), "success");
      close();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("studio_service_save_failed"), "error");
    }
  };

  const onDelete = async () => {
    try {
      await remove.mutateAsync({ id: service.id });
      await onChanged();
      showToast(t("studio_service_deleted"), "success");
      close();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("studio_service_save_failed"), "error");
    }
  };

  const items: { icon: IconName; label: string; onClick: () => void; disabled?: boolean }[] = [
    { icon: "pencil", label: t("studio_menu_edit"), onClick: () => run(onEdit) },
    { icon: "eye", label: t("studio_menu_preview"), onClick: () => run(onPreview) },
    {
      icon: "arrow-up",
      label: t("studio_menu_move_top"),
      onClick: () => run(() => onMove("top")),
      disabled: isFirst,
    },
    {
      icon: "chevron-up",
      label: t("studio_menu_move_up"),
      onClick: () => run(() => onMove("up")),
      disabled: isFirst,
    },
    {
      icon: "chevron-down",
      label: t("studio_menu_move_down"),
      onClick: () => run(() => onMove("down")),
      disabled: isLast,
    },
    { icon: "copy", label: t("studio_menu_duplicate"), onClick: () => void onDuplicate() },
  ];

  return (
    <div
      ref={rootRef}
      className="relative flex-none"
      draggable={false}
      onDragStart={(e) => e.preventDefault()}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("studio_menu_open", { title: service.title })}
        data-testid="service-menu-button"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setOpenUp(window.innerHeight - rect.bottom < MENU_ROOM);
          setOpen((current) => !current);
          setConfirmDelete(false);
        }}
        className={classNames(
          "grid h-8 w-8 place-items-center rounded-full hover:bg-[#f1f0ed]",
          open && "bg-[#f1f0ed]"
        )}>
        <Icon name="ellipsis-vertical" className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={service.title}
          data-testid="service-menu"
          className={classNames(
            "absolute right-0 z-40 bg-white p-1.5",
            openUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
          )}
          style={{
            width: 232,
            borderRadius: 16,
            boxShadow: "0 0 0 1px rgba(0,0,0,.06), 0 18px 40px -16px rgba(0,0,0,.3)",
          }}>
          {confirmDelete ? (
            <div className="p-2.5">
              <p className="text-[13.5px] font-semibold">
                {t("studio_delete_confirm_title", { title: service.title })}
              </p>
              <p className="mt-1 text-[12.5px] leading-snug text-[#6b6a66]">
                {t("studio_delete_confirm_body")}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => void onDelete()}
                  disabled={busy}
                  data-testid="service-menu-confirm-delete"
                  className="h-9 flex-1 rounded-full bg-[#b42318] text-[13px] font-semibold text-white disabled:opacity-50">
                  {remove.isPending ? t("studio_deleting") : t("delete")}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="h-9 flex-1 rounded-full border border-[#e4e3df] text-[13px] font-semibold hover:bg-[#f6f5f2]">
                  {t("cancel")}
                </button>
              </div>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <MenuItem key={item.label} {...item} disabled={item.disabled || busy} />
              ))}
              <div className="my-1 h-px bg-[#efeeeb]" />
              <MenuItem
                icon="trash-2"
                label={t("studio_menu_delete")}
                danger
                disabled={busy}
                onClick={() => setConfirmDelete(true)}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem(props: {
  icon: IconName;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={props.disabled}
      onClick={props.onClick}
      className={classNames(
        "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13.5px] font-medium transition hover:bg-[#f3f2ef] disabled:pointer-events-none disabled:opacity-35",
        props.danger && "text-[#b42318]"
      )}
      style={{ borderRadius: 10 }}>
      <Icon name={props.icon} className="h-4 w-4 flex-none" />
      {props.label}
    </button>
  );
}
