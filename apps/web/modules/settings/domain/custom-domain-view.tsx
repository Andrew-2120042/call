"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui/components/button";
import { showToast } from "@calcom/ui/components/toast";
import Link from "next/link";
import { useState } from "react";
import { SettingsCardSkeleton } from "~/shell/skeletons";

export default function CustomDomainView() {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const query = trpc.viewer.customDomain.get.useQuery();
  const [input, setInput] = useState("");
  const refresh = () => utils.viewer.customDomain.get.invalidate();
  const onError = (error: { message: string }) => showToast(error.message, "error");

  const add = trpc.viewer.customDomain.add.useMutation({
    onSuccess: async () => {
      setInput("");
      await refresh();
    },
    onError,
  });
  const verify = trpc.viewer.customDomain.verify.useMutation({
    onSuccess: async (status) => {
      showToast(
        status.verified ? t("custom_domain_verified") : t("custom_domain_not_found_yet"),
        status.verified ? "success" : "warning"
      );
      await refresh();
    },
    onError,
  });
  const remove = trpc.viewer.customDomain.remove.useMutation({ onSuccess: refresh, onError });

  if (query.isPending || !query.data) return <SettingsCardSkeleton rows={1} />;
  const { domain, entitled } = query.data;

  if (!entitled && !domain) {
    return (
      <div className="bg-default border-subtle rounded-lg border p-6" data-testid="custom-domain-upgrade">
        <p className="text-default text-sm">{t("custom_domain_pro_only")}</p>
        <Link href="/upgrade" className="mt-4 inline-block">
          <Button type="button">{t("custom_domain_upgrade")}</Button>
        </Link>
      </div>
    );
  }

  if (!domain) {
    return (
      <form
        className="bg-default border-subtle rounded-lg border p-6"
        data-testid="custom-domain-add"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate({ domain: input });
        }}>
        <label className="text-emphasis block text-sm font-medium" htmlFor="custom-domain-input">
          {t("custom_domain_label")}
        </label>
        <p className="text-subtle mt-1 text-sm">{t("custom_domain_help")}</p>
        <div className="mt-3 flex gap-2">
          <input
            id="custom-domain-input"
            className="border-default w-full max-w-sm rounded-md border px-3 py-2 text-sm"
            placeholder="book.yourname.com"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="submit" loading={add.isPending} disabled={!input.trim()}>
            {t("custom_domain_connect")}
          </Button>
        </div>
      </form>
    );
  }

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showToast(t("custom_domain_copied"), "success");
    } catch {
      showToast(value, "warning");
    }
  };

  return (
    <div className="space-y-4" data-testid="custom-domain-status">
      <div className="bg-default border-subtle flex flex-wrap items-center justify-between gap-4 rounded-lg border p-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <p className="text-emphasis truncate text-lg font-semibold">{domain.domain}</p>
            <span
              className={
                domain.verified
                  ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                  : "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700"
              }
              data-testid="custom-domain-state">
              <span
                className={
                  domain.verified
                    ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                    : "h-1.5 w-1.5 rounded-full bg-amber-500"
                }
              />
              {domain.verified ? t("custom_domain_status_live") : t("custom_domain_status_waiting")}
            </span>
          </div>
          <p className="text-subtle mt-1 text-sm">
            {domain.verified ? t("custom_domain_live_hint") : t("custom_domain_waiting")}
          </p>
          {!entitled && <p className="text-error mt-1 text-sm">{t("custom_domain_paused")}</p>}
        </div>
        <div className="flex gap-2">
          {domain.verified && (
            <a href={`https://${domain.domain}`} target="_blank" rel="noreferrer">
              <Button color="secondary">{t("custom_domain_open")}</Button>
            </a>
          )}
          <Button color="minimal" loading={remove.isPending} onClick={() => remove.mutate()}>
            {t("custom_domain_remove")}
          </Button>
        </div>
      </div>

      {!domain.verified && (
        <div className="bg-default border-subtle rounded-lg border p-6">
          <p className="text-emphasis font-semibold">
            <span className="text-subtle mr-2">1</span>
            {t("custom_domain_step_records")}
          </p>
          <p className="text-subtle mt-1 text-sm">{t("custom_domain_dns_intro")}</p>
          <div className="mt-4 space-y-3">
            {domain.records.map((record) => (
              <div key={record.type} className="border-subtle rounded-lg border p-4">
                <span className="bg-subtle text-emphasis rounded-md px-2 py-0.5 text-xs font-semibold">
                  {record.type}
                </span>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: t("custom_domain_name"), value: record.name },
                    { label: t("custom_domain_value"), value: record.value },
                  ].map((field) => (
                    <div key={field.label} className="min-w-0">
                      <p className="text-subtle text-xs">{field.label}</p>
                      <div className="bg-muted mt-1 flex items-center gap-2 rounded-xl px-3 py-2">
                        <span className="text-emphasis min-w-0 flex-1 break-all text-sm">{field.value}</span>
                        <button
                          type="button"
                          onClick={() => copy(field.value)}
                          className="text-emphasis flex-none text-xs font-semibold hover:underline">
                          {t("custom_domain_copy")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!domain.verified && (
        <div className="bg-default border-subtle flex flex-wrap items-center justify-between gap-4 rounded-lg border p-6">
          <div>
            <p className="text-emphasis font-semibold">
              <span className="text-subtle mr-2">2</span>
              {t("custom_domain_step_check")}
            </p>
            <p className="text-subtle mt-1 text-sm">
              {domain.lastCheckedAt
                ? t("custom_domain_last_checked", {
                    time: dayjs(domain.lastCheckedAt).format("MMM D, h:mma"),
                  })
                : t("custom_domain_not_checked")}
            </p>
          </div>
          <Button loading={verify.isPending} onClick={() => verify.mutate()}>
            {t("custom_domain_check")}
          </Button>
        </div>
      )}
    </div>
  );
}
