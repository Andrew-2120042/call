"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { slugify } from "@calcom/lib/slugify";
import { trpc } from "@calcom/trpc/react";
import { showToast } from "@calcom/ui/components/toast";
import classNames from "classnames";
import Link from "next/link";
import { useState } from "react";
import { Toggle } from "./studio-controls";

const DURATIONS = [15, 30, 45, 60, 90];
const MAX_MINUTES = 720;

export type ServiceFormValues = {
  title: string;
  length: number;
  description: string;
  requiresConfirmation: boolean;
};

type Props = {
  /** Omitted to create a new service. */
  serviceId?: number;
  initial?: ServiceFormValues;
  onDone: (serviceId: number) => void;
  onCancel: () => void;
};

/** Create or quickly edit a service without leaving the editor. */
export function ServiceForm({ serviceId, initial, onDone, onCancel }: Props) {
  const { t } = useLocale();
  const [values, setValues] = useState<ServiceFormValues>(
    initial ?? { title: "", length: 30, description: "", requiresConfirmation: false }
  );
  const create = trpc.viewer.eventTypesHeavy.create.useMutation();
  const update = trpc.viewer.eventTypesHeavy.update.useMutation();
  const busy = create.isPending || update.isPending;
  const validLength = Number.isInteger(values.length) && values.length >= 5 && values.length <= MAX_MINUTES;
  const canSubmit = values.title.trim().length > 0 && validLength && !busy;

  const set = (patch: Partial<ServiceFormValues>) => setValues((current) => ({ ...current, ...patch }));

  const submit = async () => {
    if (!canSubmit) return;
    const title = values.title.trim();
    const description = values.description.trim() || null;
    try {
      if (serviceId) {
        await update.mutateAsync({
          id: serviceId,
          title,
          length: values.length,
          description,
          requiresConfirmation: values.requiresConfirmation,
        });
        onDone(serviceId);
        return;
      }
      const created = await create.mutateAsync({
        title,
        slug: slugify(title),
        length: values.length,
        description,
        hidden: false,
      });
      const id = created.eventType.id;
      // Approval isn't part of the create input, so it's applied right after.
      if (values.requiresConfirmation) await update.mutateAsync({ id, requiresConfirmation: true });
      onDone(id);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("studio_service_save_failed"), "error");
    }
  };

  return (
    <form
      className="flex flex-col"
      style={{ rowGap: 22 }}
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      data-testid="studio-service-form">
      <div>
        <label htmlFor="service-title" className="text-[14px] font-semibold">
          {t("studio_service_name")}
        </label>
        <input
          id="service-title"
          autoFocus
          value={values.title}
          maxLength={120}
          placeholder={t("studio_service_name_placeholder")}
          onChange={(event) => set({ title: event.target.value })}
          className="mt-1.5 w-full rounded-xl border border-[#e4e3df] bg-white px-3 py-2.5 text-[14px] focus:border-[#121212] focus:outline-none"
        />
      </div>

      <div>
        <div className="text-[14px] font-semibold">{t("studio_service_length")}</div>
        <div className="mt-2 flex flex-wrap items-center" style={{ gap: 8 }}>
          {DURATIONS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              aria-pressed={values.length === minutes}
              onClick={() => set({ length: minutes })}
              className={classNames(
                "rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition",
                values.length === minutes
                  ? "border-[#121212] bg-[#121212] text-white"
                  : "border-[#e4e3df] hover:border-[#bdbcb7]"
              )}>
              {t("service_minutes", { count: minutes })}
            </button>
          ))}
          <label className="flex items-center gap-1.5 text-[13px] text-[#6b6a66]">
            <input
              type="number"
              min={5}
              max={MAX_MINUTES}
              value={values.length}
              aria-label={t("studio_service_custom_length")}
              onChange={(event) => set({ length: Number(event.target.value) })}
              className="w-[72px] rounded-lg border border-[#e4e3df] px-2 py-1.5 text-[13px] text-[#121212] focus:border-[#121212] focus:outline-none"
            />
            {t("studio_service_minutes_unit")}
          </label>
        </div>
        {!validLength && (
          <p className="mt-1.5 text-[12px] text-[#b42318]">
            {t("studio_service_length_invalid", { max: MAX_MINUTES })}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="service-description" className="text-[14px] font-semibold">
          {t("studio_service_description")}
        </label>
        <textarea
          id="service-description"
          rows={3}
          value={values.description}
          maxLength={1000}
          placeholder={t("studio_service_description_placeholder")}
          onChange={(event) => set({ description: event.target.value })}
          className="mt-1.5 w-full resize-y rounded-xl border border-[#e4e3df] bg-white px-3 py-2.5 text-[14px] leading-relaxed focus:border-[#121212] focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[14px] font-semibold">{t("studio_service_approval")}</div>
          <div className="text-[12px] text-[#6b6a66]">{t("studio_service_approval_hint")}</div>
        </div>
        <Toggle
          on={values.requiresConfirmation}
          label={t("studio_service_approval")}
          onChange={(requiresConfirmation) => set({ requiresConfirmation })}
        />
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="submit"
          disabled={!canSubmit}
          className="h-11 flex-1 rounded-full bg-[#121212] px-5 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
          data-testid="studio-service-submit">
          {busy ? t("studio_saving") : serviceId ? t("save") : t("studio_service_create")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-full border border-[#e4e3df] px-5 text-[14px] font-semibold hover:bg-[#f6f5f2]">
          {t("cancel")}
        </button>
      </div>

      {serviceId && (
        <Link
          href={`/event-types/${serviceId}?tabName=setup`}
          className="text-center text-[13px] font-medium text-[#6b6a66] underline-offset-2 hover:underline">
          {t("studio_service_all_settings")}
        </Link>
      )}
    </form>
  );
}
