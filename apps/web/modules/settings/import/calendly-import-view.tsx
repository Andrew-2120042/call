"use client";

import { timeZoneLabel } from "@calcom/lib/timeZoneLabel";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui/components/button";
import { showToast } from "@calcom/ui/components/toast";
import Link from "next/link";
import { useState } from "react";

export default function CalendlyImportView() {
  const { t } = useLocale();
  const [token, setToken] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [scheduleUri, setScheduleUri] = useState<string | null>(null);
  const [makeDefault, setMakeDefault] = useState(false);
  const onError = (error: { message: string }) => showToast(error.message, "error");

  const preview = trpc.viewer.calendlyImport.preview.useMutation({
    onSuccess: (data) => {
      setPicked(new Set(data.services.filter((s) => !s.alreadyImported).map((s) => s.uri)));
      setScheduleUri(data.schedules.find((s) => s.isDefault)?.uri ?? data.schedules[0]?.uri ?? null);
    },
    onError,
  });
  const importRun = trpc.viewer.calendlyImport.run.useMutation({
    onSuccess: (result) => {
      showToast(t("calendly_import_done", { count: result.created.length }), "success");
      setToken("");
    },
    onError,
  });

  const toggle = (uri: string) =>
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(uri)) next.delete(uri);
      else next.add(uri);
      return next;
    });

  if (importRun.data) {
    const result = importRun.data;
    return (
      <div className="border-subtle rounded-lg border p-6" data-testid="calendly-import-result">
        <p className="text-emphasis font-semibold">
          {t("calendly_import_done", { count: result.created.length })}
        </p>
        <ul className="text-default mt-3 list-disc pl-5 text-sm">
          {result.created.map((c) => (
            <li key={c.id}>
              {c.title} <span className="text-subtle">/{c.slug}</span>
            </li>
          ))}
          {result.skipped.map((s) => (
            <li key={s.title} className="text-subtle">
              {t("calendly_import_skipped", { title: s.title })}
            </li>
          ))}
          {result.scheduleId && <li>{t("calendly_import_schedule_done")}</li>}
        </ul>
        <div className="mt-4 flex gap-2">
          <Link href="/event-types">
            <Button type="button">{t("calendly_import_view_services")}</Button>
          </Link>
          <Link href="/availability">
            <Button type="button" color="secondary">
              {t("calendly_import_view_availability")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form
        className="border-subtle rounded-lg border p-6"
        data-testid="calendly-import-token"
        onSubmit={(e) => {
          e.preventDefault();
          preview.mutate({ token });
        }}>
        <label htmlFor="calendly-token" className="text-emphasis block text-sm font-medium">
          {t("calendly_import_token_label")}
        </label>
        <p className="text-subtle mt-1 text-sm">{t("calendly_import_token_help")}</p>
        <div className="mt-3 flex gap-2">
          <input
            id="calendly-token"
            type="password"
            autoComplete="off"
            className="border-default w-full max-w-md rounded-md border px-3 py-2 text-sm"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <Button type="submit" loading={preview.isPending} disabled={token.trim().length < 20}>
            {t("calendly_import_preview")}
          </Button>
        </div>
      </form>

      {preview.data && (
        <div className="border-subtle rounded-lg border p-6" data-testid="calendly-import-preview">
          <p className="text-subtle text-sm">
            {t("calendly_import_account", {
              name: preview.data.account.name,
              email: preview.data.account.email,
            })}
          </p>

          <p className="text-emphasis mt-4 font-medium">{t("calendly_import_services")}</p>
          {preview.data.services.length === 0 && (
            <p className="text-subtle text-sm">{t("calendly_import_no_services")}</p>
          )}
          <ul className="mt-2 space-y-2">
            {preview.data.services.map((service) => (
              <li key={service.uri}>
                <label className="text-default flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    disabled={service.alreadyImported}
                    checked={picked.has(service.uri)}
                    onChange={() => toggle(service.uri)}
                  />
                  {service.title} · {t("calendly_import_minutes", { count: service.length })}
                  {service.hidden && <span className="text-subtle">({t("hidden")})</span>}
                  {service.alreadyImported && (
                    <span className="text-subtle">({t("calendly_import_already")})</span>
                  )}
                </label>
              </li>
            ))}
          </ul>

          {preview.data.schedules.length > 0 && (
            <>
              <p className="text-emphasis mt-6 font-medium">{t("calendly_import_hours")}</p>
              <ul className="mt-2 space-y-2">
                <li>
                  <label className="text-default flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      checked={scheduleUri === null}
                      onChange={() => setScheduleUri(null)}
                    />
                    {t("calendly_import_hours_skip")}
                  </label>
                </li>
                {preview.data.schedules.map((schedule) => (
                  <li key={schedule.uri}>
                    <label className="text-default flex items-start gap-2 text-sm">
                      <input
                        type="radio"
                        className="mt-1"
                        checked={scheduleUri === schedule.uri}
                        onChange={() => setScheduleUri(schedule.uri)}
                      />
                      <span>
                        {schedule.name} <span className="text-subtle">({timeZoneLabel(schedule.timeZone)})</span>
                        <span className="text-subtle block">{schedule.summary}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              {scheduleUri && (
                <label className="text-default mt-3 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={makeDefault}
                    onChange={(e) => setMakeDefault(e.target.checked)}
                  />
                  {t("calendly_import_make_default")}
                </label>
              )}
            </>
          )}

          <div className="mt-6">
            <Button
              type="button"
              loading={importRun.isPending}
              disabled={picked.size === 0 && !scheduleUri}
              onClick={() =>
                importRun.mutate({
                  token,
                  serviceUris: Array.from(picked),
                  scheduleUri,
                  makeScheduleDefault: makeDefault,
                })
              }>
              {t("calendly_import_run")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
