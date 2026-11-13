"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui/components/button";
import { showToast } from "@calcom/ui/components/toast";

export default function WaitlistView() {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const list = trpc.viewer.waitlist.list.useQuery();
  const remove = trpc.viewer.waitlist.remove.useMutation({
    onSuccess: async () => {
      showToast(t("waitlist_removed"), "success");
      await utils.viewer.waitlist.list.invalidate();
    },
    onError: (error) => showToast(error.message, "error"),
  });

  if (list.isPending) return <p className="text-subtle">{t("loading")}</p>;
  if (!list.data?.length) {
    return (
      <div className="border-subtle rounded-lg border p-10 text-center">
        <p className="text-emphasis font-medium">{t("waitlist_empty_title")}</p>
        <p className="text-subtle mt-1 text-sm">{t("waitlist_empty_body")}</p>
      </div>
    );
  }

  return (
    <div className="border-subtle overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="text-subtle border-subtle border-b">
          <tr>
            <th className="px-4 py-3 font-medium">{t("waitlist_col_person")}</th>
            <th className="px-4 py-3 font-medium">{t("waitlist_col_time")}</th>
            <th className="px-4 py-3 font-medium">{t("waitlist_col_status")}</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {list.data.map((entry) => (
            <tr key={entry.uid} className="border-subtle border-b last:border-0">
              <td className="px-4 py-3">
                <span className="text-emphasis block font-medium">{entry.name}</span>
                <span className="text-subtle">{entry.email}</span>
              </td>
              <td className="text-default px-4 py-3">
                {entry.eventType.title}
                <span className="text-subtle block">
                  {dayjs(entry.startTime).format("ddd, MMM D, h:mma")}
                </span>
              </td>
              <td className="px-4 py-3">
                {entry.status === "OFFERED" && entry.offerExpiresAt
                  ? t("waitlist_status_offered", { time: dayjs(entry.offerExpiresAt).format("h:mma") })
                  : t("waitlist_status_waiting")}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  color="secondary"
                  size="sm"
                  loading={remove.isPending && remove.variables?.uid === entry.uid}
                  onClick={() => remove.mutate({ uid: entry.uid })}>
                  {t("remove")}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
