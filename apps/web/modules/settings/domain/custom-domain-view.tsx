"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui/components/button";
import { showToast } from "@calcom/ui/components/toast";
import Link from "next/link";
import { useState } from "react";

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

  if (query.isPending || !query.data) return null;
  const { domain, entitled } = query.data;

  if (!entitled && !domain) {
    return (
      <div className="border-subtle rounded-lg border p-6" data-testid="custom-domain-upgrade">
        <p className="text-default text-sm">{t("custom_domain_pro_only")}</p>
        <Link href="/settings/billing" className="mt-4 inline-block">
          <Button type="button">{t("custom_domain_upgrade")}</Button>
        </Link>
      </div>
    );
  }

  if (!domain) {
    return (
      <form
        className="border-subtle rounded-lg border p-6"
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

  return (
    <div className="border-subtle rounded-lg border p-6" data-testid="custom-domain-status">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-emphasis font-semibold">{domain.domain}</p>
          <p className="text-subtle text-sm" data-testid="custom-domain-state">
            {domain.verified
              ? t("custom_domain_live", { url: `https://${domain.domain}` })
              : t("custom_domain_waiting")}
          </p>
          {!entitled && <p className="text-error mt-1 text-sm">{t("custom_domain_paused")}</p>}
        </div>
        <div className="flex gap-2">
          <Button type="button" color="secondary" loading={verify.isPending} onClick={() => verify.mutate()}>
            {t("custom_domain_check")}
          </Button>
          <Button
            type="button"
            color="destructive"
            loading={remove.isPending}
            onClick={() => remove.mutate()}>
            {t("custom_domain_remove")}
          </Button>
        </div>
      </div>

      <p className="text-default mt-6 text-sm font-medium">{t("custom_domain_dns_intro")}</p>
      <table className="mt-2 w-full text-left text-sm">
        <thead className="text-subtle">
          <tr>
            <th className="py-1 pr-4 font-normal">{t("custom_domain_type")}</th>
            <th className="py-1 pr-4 font-normal">{t("custom_domain_name")}</th>
            <th className="py-1 font-normal">{t("custom_domain_value")}</th>
          </tr>
        </thead>
        <tbody>
          {domain.records.map((record) => (
            <tr key={record.type} className="border-subtle border-t">
              <td className="py-2 pr-4 font-mono">{record.type}</td>
              <td className="break-all py-2 pr-4 font-mono">{record.name}</td>
              <td className="break-all py-2 font-mono">{record.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {domain.lastCheckedAt && (
        <p className="text-subtle mt-3 text-xs">
          {t("custom_domain_last_checked", { time: dayjs(domain.lastCheckedAt).format("MMM D, h:mma") })}
        </p>
      )}
    </div>
  );
}
