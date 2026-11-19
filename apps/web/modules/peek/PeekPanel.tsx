"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { RouterOutputs } from "@calcom/trpc/react";
import { trpc } from "@calcom/trpc/react";
import classNames from "@calcom/ui/classNames";
import { Icon } from "@calcom/ui/components/icon";
import { SkeletonText } from "@calcom/ui/components/skeleton";
import { showToast } from "@calcom/ui/components/toast";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePeek } from "./peekStore";

export function PeekPanel() {
  const target = usePeek((state) => state.target);
  const close = usePeek((state) => state.close);

  useEffect(() => {
    if (!target) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, close]);

  if (!target) return null;
  return (
    <div className="fixed inset-0 z-50" data-testid="peek">
      <button type="button" aria-label="Close" className="absolute inset-0 h-full w-full bg-black/50" onClick={close} />
      <aside
        role="dialog"
        aria-modal="true"
        className="bg-default border-subtle absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col border-l shadow-2xl">
        <PeekContent kind={target.kind} uid={target.uid} onClose={close} />
      </aside>
    </div>
  );
}

function PeekContent({ kind, uid, onClose }: { kind: "booking" | "waitlist"; uid: string; onClose: () => void }) {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const { data, isPending, error } = trpc.viewer.home.peek.useQuery({ kind, uid });
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");

  const refresh = async () => {
    await Promise.all([
      utils.viewer.home.peek.invalidate(),
      utils.viewer.home.get.invalidate(),
      utils.viewer.home.calendar.invalidate(),
      utils.viewer.waitlist.list.invalidate(),
      utils.viewer.bookings.invalidate(),
    ]);
  };
  const confirm = trpc.viewer.bookings.confirm.useMutation({
    onSuccess: async (_, variables) => {
      showToast(t(variables.confirmed ? "peek_accepted" : "peek_declined"), "success");
      await refresh();
      onClose();
    },
    onError: (err) => showToast(err.message, "error"),
  });
  const remove = trpc.viewer.waitlist.remove.useMutation({
    onSuccess: async () => {
      showToast(t("waitlist_removed"), "success");
      await refresh();
      onClose();
    },
    onError: (err) => showToast(err.message, "error"),
  });

  const status = data
    ? data.kind === "waitlist"
      ? data.status === "OFFERED"
        ? { label: t("peek_status_offered"), tone: "text-sky-300 border-sky-400/40" }
        : { label: t("peek_status_waiting"), tone: "text-default border-subtle" }
      : data.isRequest
        ? { label: t("peek_status_request"), tone: "text-amber-300 border-amber-400/40" }
        : data.status === "CANCELLED" || data.status === "REJECTED"
          ? { label: t("peek_status_cancelled"), tone: "text-subtle border-subtle" }
          : { label: t("peek_status_booked"), tone: "text-emerald-300 border-emerald-400/40" }
    : null;

  return (
    <>
      <header className="border-subtle flex h-12 shrink-0 items-center gap-2 border-b px-4">
        {status && <span className={classNames("rounded border px-1.5 py-0.5 text-[11px]", status.tone)}>{status.label}</span>}
        <span className="text-subtle text-[12px]">{t(kind === "booking" ? "peek_title_booking" : "peek_title_waitlist")}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          data-testid="peek-close"
          className="text-subtle hover:text-emphasis hover:bg-subtle ml-auto grid h-7 w-7 place-items-center rounded-md">
          <Icon name="x" className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {error && <p className="text-error text-[13px]">{error.message}</p>}
        {isPending && <SkeletonText className="h-24 w-full" />}
        {data && (
          <div className="space-y-6">
            <section>
              <p className="text-emphasis text-lg font-medium">{data.person.name}</p>
              <a href={`mailto:${data.person.email}`} className="text-subtle hover:text-emphasis text-[13px]">
                {data.person.email}
              </a>
              {data.person.phone && <p className="text-subtle text-[13px]">{data.person.phone}</p>}
            </section>

            <Rows>
              <Row label={t("peek_service")} value={data.service} />
              <Row
                label={data.kind === "waitlist" ? t("peek_wants") : t("peek_when")}
                value={wantText(data, t)}
              />
              {data.person.timeZone && <Row label={t("peek_their_time_zone")} value={data.person.timeZone} />}
              {data.location && <Row label={t("peek_where")} value={data.location} />}
              {data.waitlist && (
                <>
                  <Row label={t("peek_place_in_line")} value={t("peek_position", { position: data.waitlist.position })} />
                  <Row label={t("peek_joined")} value={dayjs(data.waitlist.joinedAt).format("ddd D MMM, h:mma")} />
                  {data.waitlist.offerExpiresAt && (
                    <Row
                      label={t("peek_offer")}
                      value={t("peek_offer_until", {
                        slot: dayjs(data.waitlist.offerStartTime ?? data.startTime).format("ddd D MMM, h:mma"),
                        time: dayjs(data.waitlist.offerExpiresAt).format("h:mma"),
                      })}
                    />
                  )}
                </>
              )}
              {data.cancellationReason && <Row label={t("peek_cancel_reason")} value={data.cancellationReason} />}
            </Rows>

            {data.insight?.spamLikely && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3" data-testid="peek-spam-warning">
                <p className="text-[13px] font-medium text-red-300">{t("peek_spam_title")}</p>
                <p className="mt-0.5 text-[12px] text-red-200/80">{t("peek_spam_body")}</p>
              </div>
            )}

            {data.insight && (
              <section className="border-subtle rounded-lg border p-3">
                <p className="text-subtle text-[11px] uppercase tracking-[0.06em]">{t("peek_ai_summary")}</p>
                <p className="text-default mt-1.5 text-[13px] leading-relaxed">{data.insight.summary}</p>
                <p className="text-subtle mt-2 text-[12px]">
                  {t(`peek_fit_${data.insight.fit.toLowerCase()}`)}
                  {data.insight.spamLikely && ` · ${t("peek_spam_likely")}`}
                </p>
              </section>
            )}

            <section>
              <p className="text-subtle text-[11px] uppercase tracking-[0.06em]">{t("peek_answers")}</p>
              {data.answers.length ? (
                <dl className="mt-2 space-y-3">
                  {data.answers.map((answer) => (
                    <div key={answer.labelKey ?? answer.label}>
                      <dt className="text-subtle text-[12px]">{answer.labelKey ? t(answer.labelKey) : answer.label}</dt>
                      <dd className="text-default mt-0.5 whitespace-pre-line text-[13px]">{answer.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-subtle mt-2 text-[13px]">{t("peek_no_answers")}</p>
              )}
            </section>
          </div>
        )}
      </div>

      {data && (
        <footer className="border-subtle shrink-0 space-y-2 border-t px-5 py-3">
          {declining && (
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t("decline_note_placeholder")}
              rows={2}
              className="border-subtle bg-default text-default w-full rounded-md border px-2.5 py-2 text-[13px] outline-none"
            />
          )}
          <div className="flex items-center gap-2">
            {data.kind === "booking" && (
              <Link href={`/booking/${data.uid}`} className="text-subtle hover:text-emphasis mr-auto text-[12px]">
                {t("peek_open_full")}
              </Link>
            )}
            {data.kind === "waitlist" && <span className="mr-auto" />}
            {data.kind === "booking" && data.isRequest && data.id && (
              <>
                <FooterButton
                  onClick={() =>
                    declining
                      ? confirm.mutate({ bookingId: data.id as number, confirmed: false, reason: reason || undefined })
                      : setDeclining(true)
                  }
                  disabled={confirm.isPending}
                  testId="peek-decline">
                  {declining ? t("peek_send_decline") : t("decline")}
                </FooterButton>
                {!declining && (
                  <FooterButton
                    primary
                    onClick={() => confirm.mutate({ bookingId: data.id as number, confirmed: true })}
                    disabled={confirm.isPending}
                    testId="peek-accept">
                    {t("accept")}
                  </FooterButton>
                )}
              </>
            )}
            {data.kind === "waitlist" && (
              <FooterButton onClick={() => remove.mutate({ uid: data.uid })} disabled={remove.isPending} testId="peek-remove">
                {t("waitlist_remove_from")}
              </FooterButton>
            )}
          </div>
        </footer>
      )}
    </>
  );
}

type PeekData = RouterOutputs["viewer"]["home"]["peek"];

function wantText(data: PeekData, t: (key: string, values?: Record<string, string>) => string) {
  const when = `${dayjs(data.startTime).format("ddd D MMM, h:mma")} – ${dayjs(data.endTime).format("h:mma")}`;
  if (data.kind !== "waitlist" || !data.waitlist) return when;
  if (data.waitlist.kind === "ANY_TIME_ON_DAY" && data.waitlist.rangeStart)
    return t("peek_wants_any_time", { day: dayjs(data.waitlist.rangeStart).format("ddd D MMM") });
  if (data.waitlist.kind === "EARLIER_THAN_BOOKING" && data.waitlist.rangeEnd)
    return t("peek_wants_earlier", { time: dayjs(data.waitlist.rangeEnd).format("ddd D MMM, h:mma") });
  return when;
}

function Rows({ children }: { children: ReactNode }) {
  return <dl className="border-subtle divide-subtle divide-y rounded-lg border">{children}</dl>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 px-3 py-2 text-[13px]">
      <dt className="text-subtle w-32 shrink-0">{label}</dt>
      <dd className="text-default min-w-0 flex-1">{value}</dd>
    </div>
  );
}

function FooterButton(props: { children: ReactNode; onClick: () => void; disabled?: boolean; primary?: boolean; testId: string }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      data-testid={props.testId}
      className={classNames(
        "h-8 rounded-md px-3 text-[13px] font-medium transition disabled:opacity-50",
        props.primary ? "bg-inverted text-inverted" : "border-subtle text-default hover:bg-subtle border"
      )}>
      {props.children}
    </button>
  );
}
