"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import classNames from "@calcom/ui/classNames";
import { Icon } from "@calcom/ui/components/icon";
import { Logo } from "@calcom/ui/components/logo";
import { showToast } from "@calcom/ui/components/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Answers = {
  work: "coach" | "therapist" | "tutor" | "fitness" | "consultant" | "creative" | "other";
  length: 15 | 30 | 45 | 60 | 90;
  introCall: boolean;
  approval: boolean;
  series: 0 | 4 | 8 | 12;
  reminderHours: 0 | 1 | 24;
  waitlist: boolean;
  confirm: boolean;
  location: "meet" | "zoom" | "phone" | "in_person" | "later";
  address?: string;
};

type Option<K extends keyof Answers> = { value: Answers[K]; id: string; pro?: boolean };
type Question<K extends keyof Answers = keyof Answers> = { key: K; id: string; options: Option<K>[] };

// Every question changes something real; the right-hand summary shows exactly what will be set up.
const QUESTIONS: Question[] = [
  {
    key: "work",
    id: "work",
    options: (["coach", "therapist", "tutor", "fitness", "consultant", "creative", "other"] as const).map((v) => ({
      value: v,
      id: v,
    })),
  },
  {
    key: "length",
    id: "length",
    options: ([30, 45, 60, 90, 15] as const).map((v) => ({ value: v, id: String(v) })),
  },
  { key: "introCall", id: "intro", options: [{ value: true, id: "yes" }, { value: false, id: "no" }] },
  { key: "approval", id: "approval", options: [{ value: false, id: "instant" }, { value: true, id: "approve" }] },
  {
    key: "series",
    id: "series",
    options: ([0, 4, 8, 12] as const).map((v) => ({ value: v, id: String(v) })),
  },
  {
    key: "reminderHours",
    id: "reminder",
    options: ([24, 1, 0] as const).map((v) => ({ value: v, id: String(v) })),
  },
  { key: "waitlist", id: "waitlist", options: [{ value: true, id: "yes", pro: true }, { value: false, id: "no" }] },
  { key: "confirm", id: "confirm", options: [{ value: true, id: "yes", pro: true }, { value: false, id: "no" }] },
  {
    key: "location",
    id: "location",
    options: (["meet", "zoom", "phone", "in_person", "later"] as const).map((v) => ({ value: v, id: v })),
  },
] as Question[];

const DEFAULTS: Answers = {
  work: "coach",
  length: 30,
  introCall: true,
  approval: false,
  series: 0,
  reminderHours: 24,
  waitlist: false,
  confirm: false,
  location: "meet",
};

/** Setup by answering a few plain questions; the answers create the person's services and their rules. */
export function PersonalQuestionsView() {
  const { t } = useLocale();
  const router = useRouter();
  const utils = trpc.useUtils();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(DEFAULTS);
  const apply = trpc.viewer.home.applySetup.useMutation({
    onSuccess: async (result) => {
      await utils.viewer.eventTypes.invalidate();
      if (result.skipped.waitlist || result.skipped.confirm) showToast(t("setup_q_pro_later"), "success");
      router.push("/onboarding/personal/calendar");
    },
    onError: (error) => showToast(error.message, "error"),
  });

  const question = QUESTIONS[step];
  const last = step === QUESTIONS.length - 1;
  const choose = (value: Answers[keyof Answers]) => setAnswers((current) => ({ ...current, [question.key]: value }));
  const next = () => (last ? apply.mutate(answers) : setStep(step + 1));
  const needsAddress = question.key === "location" && answers.location === "in_person";

  return (
    <div className="bg-default flex min-h-screen flex-col" data-testid="onboarding-questions">
      <header className="flex h-14 items-center px-6">
        <Logo small />
      </header>
      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-6 pb-16 pt-6 lg:grid-cols-[1fr_300px]">
        <section className="min-w-0">
          <button
            type="button"
            onClick={() => (step === 0 ? router.push("/onboarding/personal/settings") : setStep(step - 1))}
            aria-label={t("back")}
            className="text-subtle hover:text-emphasis -ml-1 grid h-7 w-7 place-items-center rounded-md">
            <Icon name="arrow-left" className="h-4 w-4" />
          </button>
          <p className="text-subtle mt-4 text-[12px]">
            {t("setup_q_counter", { current: step + 1, total: QUESTIONS.length })}
          </p>
          <h1 className="text-emphasis mt-2 text-2xl font-medium tracking-[-0.015em]">{t(`setup_q_${question.id}_title`)}</h1>
          <p className="text-subtle mt-1.5 max-w-xl text-[13px]">{t(`setup_q_${question.id}_hint`)}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {question.options.map((option) => {
              const selected = answers[question.key] === option.value;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => choose(option.value)}
                  aria-pressed={selected}
                  data-testid={`setup-option-${question.id}-${option.id}`}
                  className={classNames(
                    "flex min-h-[132px] flex-col rounded-lg border p-4 text-left transition",
                    selected ? "border-emphasis bg-subtle" : "border-subtle hover:border-default"
                  )}>
                  <span className="flex items-center gap-2">
                    <span className="text-emphasis text-[14px] font-medium">
                      {t(`setup_q_${question.id}_${option.id}`)}
                    </span>
                    {option.pro && (
                      <span className="border-subtle text-subtle rounded border px-1 text-[10px] uppercase">Pro</span>
                    )}
                  </span>
                  <span className="text-subtle mt-1 text-[12px] leading-relaxed">
                    {t(`setup_q_${question.id}_${option.id}_hint`)}
                  </span>
                  <span
                    className={classNames(
                      "mt-auto inline-flex h-7 items-center justify-center rounded-md text-[12px] font-medium",
                      selected ? "bg-inverted text-inverted" : "border-subtle text-default border"
                    )}>
                    {selected ? t("setup_q_selected") : t("setup_q_select")}
                  </span>
                </button>
              );
            })}
          </div>

          {needsAddress && (
            <label className="mt-4 block max-w-md">
              <span className="text-default text-[13px]">{t("setup_q_address")}</span>
              <input
                value={answers.address ?? ""}
                onChange={(event) => setAnswers((current) => ({ ...current, address: event.target.value }))}
                placeholder={t("setup_q_address_placeholder")}
                className="border-subtle bg-default text-default mt-1.5 h-8 w-full rounded-md border px-2.5 text-[13px] outline-none"
              />
            </label>
          )}

          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={next}
              disabled={apply.isPending}
              data-testid="onboarding-continue-btn"
              className="bg-inverted text-inverted h-8 rounded-md px-4 text-[13px] font-medium disabled:opacity-50">
              {last ? t("setup_q_finish") : t("continue")}
            </button>
            <button
              type="button"
              onClick={() => router.push("/onboarding/personal/calendar")}
              className="text-subtle hover:text-emphasis text-[12px]">
              {t("setup_q_skip")}
            </button>
          </div>
        </section>

        <aside className="border-subtle hidden h-fit rounded-lg border p-4 lg:block" data-testid="setup-summary">
          <p className="text-emphasis text-[13px] font-medium">{t("setup_q_summary_title")}</p>
          <p className="text-subtle mt-0.5 text-[12px]">{t("setup_q_summary_hint")}</p>
          <ul className="mt-4 space-y-2.5 text-[12px]">
            {answers.introCall && <SummaryItem text={t("setup_q_sum_intro")} />}
            <SummaryItem
              text={t("setup_q_sum_main", {
                title: t(`setup_q_service_${answers.work}`),
                length: answers.length,
              })}
            />
            <SummaryItem text={t(answers.approval ? "setup_q_sum_approve" : "setup_q_sum_instant")} />
            {answers.series > 0 && <SummaryItem text={t("setup_q_sum_series", { count: answers.series })} />}
            <SummaryItem
              text={answers.reminderHours ? t(`setup_q_sum_reminder_${answers.reminderHours}`) : t("setup_q_sum_no_reminder")}
            />
            {answers.waitlist && <SummaryItem text={t("setup_q_sum_waitlist")} />}
            {answers.confirm && <SummaryItem text={t("setup_q_sum_confirm")} />}
            <SummaryItem text={t(`setup_q_sum_location_${answers.location}`)} />
          </ul>
        </aside>
      </main>
    </div>
  );
}

function SummaryItem({ text }: { text: string }) {
  return (
    <li className="text-default flex gap-2">
      <Icon name="check" className="text-subtle mt-0.5 h-3 w-3 shrink-0" />
      <span>{text}</span>
    </li>
  );
}
