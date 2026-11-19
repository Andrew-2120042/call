"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Icon } from "@calcom/ui/components/icon";
import { showToast } from "@calcom/ui/components/toast";
import Link from "next/link";
import { useState } from "react";

type Step = { id: string; done: boolean; href: string };

// Steps are grouped by what the person is trying to get done, not by where the setting lives.
const SECTIONS: { id: string; steps: string[] }[] = [
  { id: "page", steps: ["service", "hours", "photo", "bio"] },
  { id: "tools", steps: ["calendar", "video"] },
  { id: "booked", steps: ["first_booking"] },
];

/** The home page's getting-started list: short sections, one button per step, a progress bar on top. */
export function SetupChecklist({ setup, pageUrl }: { setup: readonly Step[]; pageUrl: string }) {
  const { t } = useLocale();
  const byId = new Map(setup.map((step) => [step.id, step]));
  const done = setup.filter((step) => step.done).length;
  if (done === setup.length) return null;
  const nextId = setup.find((step) => !step.done)?.id;

  return (
    <section className="mb-8" data-testid="setup-checklist">
      <h2 className="text-emphasis text-lg font-semibold tracking-[-0.01em]">{t("setup_checklist_title")}</h2>
      <p className="text-subtle mt-0.5 text-[13px]">{t("setup_checklist_subtitle", { done, total: setup.length })}</p>
      <div className="bg-emphasis mt-3 h-1 overflow-hidden rounded-full" aria-hidden>
        <div className="bg-inverted h-full rounded-full transition-all" style={{ width: `${(done / setup.length) * 100}%` }} />
      </div>
      <div className="mt-4 space-y-2">
        {SECTIONS.map((section) => {
          const steps = section.steps.map((id) => byId.get(id)).filter((step): step is Step => !!step);
          if (!steps.length) return null;
          return (
            <ChecklistSection
              key={section.id}
              id={section.id}
              steps={steps}
              nextId={nextId}
              pageUrl={pageUrl}
              defaultOpen={steps.some((step) => step.id === nextId)}
            />
          );
        })}
      </div>
    </section>
  );
}

function ChecklistSection({
  id,
  steps,
  nextId,
  pageUrl,
  defaultOpen,
}: {
  id: string;
  steps: Step[];
  nextId?: string;
  pageUrl: string;
  defaultOpen: boolean;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(defaultOpen);
  const done = steps.filter((step) => step.done).length;

  return (
    <div className="border-subtle rounded-lg border" data-testid={`setup-section-${id}`}>
      <button
        type="button"
        onClick={() => setOpen((was) => !was)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <span className="min-w-0 flex-1">
          <span className="text-emphasis block text-sm font-semibold">{t(`setup_section_${id}`)}</span>
          <span className="text-subtle block text-[12px]">{t(`setup_section_${id}_hint`)}</span>
        </span>
        <span className="text-subtle shrink-0 text-[12px]">{t("setup_section_progress", { done, total: steps.length })}</span>
        <Icon name={open ? "chevron-down" : "chevron-right"} className="text-subtle h-3.5 w-3.5 shrink-0" />
      </button>
      {open && (
        <ul className="border-subtle border-t">
          {steps.map((step) => (
            <li key={step.id} className="border-subtle flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0">
              <span
                className={classNames(
                  "grid h-4 w-4 shrink-0 place-items-center rounded border",
                  step.done ? "bg-inverted border-transparent" : "border-emphasis"
                )}
                aria-hidden>
                {step.done && <Icon name="check" className="text-inverted h-3 w-3" />}
              </span>
              <span className={classNames("min-w-0 flex-1 text-[13px]", step.done ? "text-muted line-through" : "text-default")}>
                {t(`setup_step_${step.id}`)}
              </span>
              {!step.done &&
                (step.id === "first_booking" ? (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(pageUrl);
                        showToast(t("home_link_copied"), "success");
                      } catch {
                        showToast(pageUrl, "warning");
                      }
                    }}
                    className={actionClass(step.id === nextId)}>
                    {t("setup_action_first_booking")}
                  </button>
                ) : (
                  <Link href={step.href} className={actionClass(step.id === nextId)} data-testid={`setup-action-${step.id}`}>
                    {t(`setup_action_${step.id}`)}
                  </Link>
                ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const actionClass = (primary: boolean) =>
  classNames(
    "inline-flex h-7 shrink-0 items-center rounded-md px-2.5 text-[12px] font-medium transition",
    primary ? "bg-inverted text-inverted" : "border-subtle text-default hover:bg-subtle border"
  );
