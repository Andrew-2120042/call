"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import classNames from "@calcom/ui/classNames";
import type { IconName } from "@calcom/ui/components/icon";
import { Icon } from "@calcom/ui/components/icon";
import { showToast } from "@calcom/ui/components/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ONBOARDING_STEPS, OnboardingLayout } from "../../components/OnboardingLayout";
import type { PreviewService, PreviewTag } from "../../components/SetupPreviewCard";
import { SetupPreviewCard } from "../../components/SetupPreviewCard";

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
    options: (["coach", "therapist", "tutor", "fitness", "consultant", "creative", "other"] as const).map(
      (v) => ({
        value: v,
        id: v,
      })
    ),
  },
  {
    key: "length",
    id: "length",
    options: ([30, 45, 60, 90, 15] as const).map((v) => ({ value: v, id: String(v) })),
  },
  {
    key: "introCall",
    id: "intro",
    options: [
      { value: true, id: "yes" },
      { value: false, id: "no" },
    ],
  },
  {
    key: "approval",
    id: "approval",
    options: [
      { value: false, id: "instant" },
      { value: true, id: "approve" },
    ],
  },
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
  {
    key: "waitlist",
    id: "waitlist",
    options: [
      { value: true, id: "yes", pro: true },
      { value: false, id: "no" },
    ],
  },
  {
    key: "confirm",
    id: "confirm",
    options: [
      { value: true, id: "yes", pro: true },
      { value: false, id: "no" },
    ],
  },
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
  const { data: me } = trpc.viewer.me.get.useQuery();
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
  const choose = (value: Answers[keyof Answers]) =>
    setAnswers((current) => ({ ...current, [question.key]: value }));
  const next = () => (last ? apply.mutate(answers) : setStep(step + 1));
  const needsAddress = question.key === "location" && answers.location === "in_person";
  // Long lists read better as compact chips; two or three choices get a line explaining each.
  const asChips = question.options.length > 3;

  const services: PreviewService[] = [
    ...(answers.introCall ? [{ key: "intro", title: t("setup_q_sum_intro_title"), minutes: 15 }] : []),
    { key: "main", title: t(`setup_q_service_${answers.work}`), minutes: answers.length },
  ];
  const tags: PreviewTag[] = [
    {
      key: "approval",
      icon: answers.approval ? "user-check" : "zap",
      label: t(answers.approval ? "setup_q_tag_approve" : "setup_q_tag_instant"),
    },
    ...(answers.series
      ? [
          {
            key: "series",
            icon: "repeat" as const,
            label: t("setup_q_tag_series", { count: answers.series }),
          },
        ]
      : []),
    ...(answers.reminderHours
      ? [
          {
            key: "reminder",
            icon: "bell" as const,
            label: t(`setup_q_tag_reminder_${answers.reminderHours}`),
          },
        ]
      : []),
    ...(answers.waitlist
      ? [{ key: "waitlist", icon: "users" as const, label: t("setup_q_tag_waitlist") }]
      : []),
    ...(answers.confirm
      ? [{ key: "confirm", icon: "circle-check" as const, label: t("setup_q_tag_confirm") }]
      : []),
    ...(answers.location !== "later"
      ? [
          {
            key: "location",
            icon: LOCATION_ICON[answers.location],
            label: t(`setup_q_sum_location_${answers.location}`),
          },
        ]
      : []),
  ];
  const highlight: Record<string, string> = {
    work: "main",
    length: "main",
    introCall: "intro",
    approval: "approval",
    series: "series",
    reminderHours: "reminder",
    waitlist: "waitlist",
    confirm: "confirm",
    location: "location",
  };

  return (
    <OnboardingLayout
      userEmail=""
      progress={(1 + (step + 1) / QUESTIONS.length) / ONBOARDING_STEPS + 1 / ONBOARDING_STEPS}>
      <div className="flex h-full min-h-0 flex-col" data-testid="onboarding-questions">
        <p className="text-subtle text-[12px]">
          {t("setup_q_counter", { current: step + 1, total: QUESTIONS.length })}
        </p>
        <h1 className="text-emphasis mt-2 text-[22px] font-semibold leading-tight tracking-[-0.015em]">
          {t(`setup_q_${question.id}_title`)}
        </h1>
        <p className="text-subtle mt-1.5 text-[13px] leading-relaxed">{t(`setup_q_${question.id}_hint`)}</p>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
          {asChips ? (
            <div className="flex flex-wrap gap-2">
              {question.options.map((option) => {
                const selected = answers[question.key] === option.value;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => choose(option.value)}
                    aria-pressed={selected}
                    title={t(`setup_q_${question.id}_${option.id}_hint`)}
                    data-testid={`setup-option-${question.id}-${option.id}`}
                    className={classNames(
                      "inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-[13px] transition",
                      selected
                        ? "border-emphasis bg-subtle text-emphasis"
                        : "border-subtle text-default hover:border-default"
                    )}>
                    {selected && <Icon name="check" className="h-3.5 w-3.5" />}
                    {t(`setup_q_${question.id}_${option.id}`)}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
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
                      "flex w-full items-start gap-3 rounded-lg border px-3.5 py-3 text-left transition",
                      selected ? "border-emphasis bg-subtle" : "border-subtle hover:border-default"
                    )}>
                    <span
                      className={classNames(
                        "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border",
                        selected ? "border-emphasis bg-inverted" : "border-default"
                      )}
                      aria-hidden>
                      {selected && <span className="bg-default h-1.5 w-1.5 rounded-full" />}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="text-emphasis text-[13px] font-medium">
                          {t(`setup_q_${question.id}_${option.id}`)}
                        </span>
                        {option.pro && (
                          <span className="border-subtle text-subtle rounded border px-1 text-[10px] uppercase">
                            Pro
                          </span>
                        )}
                      </span>
                      <span className="text-subtle mt-0.5 block text-[12px] leading-snug">
                        {t(`setup_q_${question.id}_${option.id}_hint`)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {needsAddress && (
            <label className="mt-4 block">
              <span className="text-default text-[13px]">{t("setup_q_address")}</span>
              <input
                value={answers.address ?? ""}
                onChange={(event) => setAnswers((current) => ({ ...current, address: event.target.value }))}
                placeholder={t("setup_q_address_placeholder")}
                className="border-subtle bg-default text-default mt-1.5 h-9 w-full rounded-md border px-2.5 text-[13px] outline-none"
              />
            </label>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (step === 0 ? router.push("/onboarding/personal/settings") : setStep(step - 1))}
            className="border-subtle text-default hover:bg-subtle inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-[13px]">
            <Icon name="arrow-left" className="h-3.5 w-3.5" />
            {t("back")}
          </button>
          <button
            type="button"
            onClick={() => router.push("/onboarding/personal/calendar")}
            className="text-subtle hover:text-emphasis ml-auto text-[12px]">
            {t("setup_q_skip")}
          </button>
          <button
            type="button"
            onClick={next}
            disabled={apply.isPending}
            data-testid="onboarding-continue-btn"
            className="bg-inverted text-inverted inline-flex h-9 items-center gap-1.5 rounded-md px-4 text-[13px] font-medium disabled:opacity-50">
            {last ? t("setup_q_finish") : t("continue")}
            <Icon name="arrow-right" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <SetupPreviewCard
        name={me?.name}
        avatar={me?.avatarUrl}
        username={me?.username}
        bio={me?.bio}
        services={services}
        tags={tags}
        highlight={highlight[question.key]}
      />
    </OnboardingLayout>
  );
}

const LOCATION_ICON: Record<Answers["location"], IconName> = {
  meet: "video",
  zoom: "video",
  phone: "phone",
  in_person: "map-pin",
  later: "map-pin",
};
