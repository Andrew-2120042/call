import type {
  CalendarLayout,
  CalendarMode,
  CalendarStyle,
  CalendarTimeFormat,
  CalendarVisibilityKey,
  SlotShape,
} from "@calcom/features/booking-page-theme/calendar";
import {
  CALENDAR_LAYOUTS,
  CALENDAR_MODES,
  CALENDAR_TIME_FORMATS,
  resolveCalendar,
  SLOT_RADII,
  SLOT_SHAPES,
} from "@calcom/features/booking-page-theme/calendar";
import type { PageStyle } from "@calcom/features/booking-page-theme/themes";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { IconName } from "@calcom/ui/components/icon";
import { Icon } from "@calcom/ui/components/icon";
import type { ReactNode } from "react";
import { ColourInput, FieldRow, OptionTile, Segmented, Toggle } from "./studio-controls";

const LAYOUT_ICONS: Record<CalendarLayout, IconName> = {
  month_view: "calendar-days",
  week_view: "calendar-range",
  column_view: "columns-3",
};

const SHOWN_KEYS: CalendarVisibilityKey[] = ["avatar", "description", "duration", "location"];

type Props = {
  style: PageStyle;
  services: { id: number; title: string }[];
  /** null edits the page-wide calendar; a service id edits that service's own override. */
  scope: number | null;
  onScopeChange: (scope: number | null) => void;
  onChange: (patch: PageStyle) => void;
};

export function CalendarPanel({ style, services, scope, onScopeChange, onChange }: Props) {
  const { t } = useLocale();
  const override = scope === null ? undefined : style.calendarByService?.[String(scope)];
  const calendar = resolveCalendar(style.calendar, override);

  const setCalendar = (patch: CalendarStyle) => {
    if (scope === null) {
      onChange({ calendar: { ...style.calendar, ...patch } });
      return;
    }
    onChange({
      calendarByService: { ...style.calendarByService, [String(scope)]: { ...override, ...patch } },
    });
  };

  const resetOverride = () => {
    if (scope === null) return;
    const { [String(scope)]: _removed, ...rest } = style.calendarByService ?? {};
    onChange({ calendarByService: rest });
  };

  const setShown = (key: CalendarVisibilityKey, shown: boolean) => {
    const hide = calendar.hide.filter((hidden) => hidden !== key);
    setCalendar({ hide: shown ? hide : [...hide, key] });
  };

  return (
    <div className="space-y-7">
      <div>
        <label htmlFor="calendar-scope" className="text-[14px] font-semibold">
          {t("studio_calendar_applies_to")}
        </label>
        <select
          id="calendar-scope"
          value={scope === null ? "all" : String(scope)}
          onChange={(e) => onScopeChange(e.target.value === "all" ? null : Number(e.target.value))}
          className="mt-1.5 w-full rounded-xl border border-[#e4e3df] bg-white px-3 py-2.5 text-[14px] focus:border-[#121212] focus:outline-none">
          <option value="all">{t("studio_calendar_all_services")}</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.title}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-[12px] text-[#6b6a66]">
          {scope === null
            ? t("studio_calendar_scope_all_hint")
            : override
              ? t("studio_calendar_scope_custom_hint")
              : t("studio_calendar_scope_inherit_hint")}
        </p>
        {override && (
          <button
            type="button"
            onClick={resetOverride}
            className="mt-2 rounded-full border border-[#e4e3df] px-3.5 py-1.5 text-[12.5px] font-semibold hover:bg-[#f6f5f2]">
            {t("studio_calendar_reset_service")}
          </button>
        )}
      </div>

      <Section title={t("studio_calendar_layout")} hint={t("studio_calendar_layout_hint")}>
        <div className="grid grid-cols-3 gap-2.5">
          {CALENDAR_LAYOUTS.map((layout) => (
            <OptionTile
              key={layout}
              selected={calendar.layout === layout}
              onClick={() => setCalendar({ layout })}
              label={t(`studio_calendar_layout_${layout}`)}>
              <span className="grid h-8 place-items-center">
                <Icon name={LAYOUT_ICONS[layout]} className="h-5 w-5" />
              </span>
            </OptionTile>
          ))}
        </div>
        <ToggleRow
          label={t("studio_calendar_allow_switch")}
          on={calendar.allowLayoutSwitch}
          onChange={(allowLayoutSwitch) => setCalendar({ allowLayoutSwitch })}
        />
      </Section>

      <Section title={t("studio_calendar_colours")}>
        <Segmented
          value={calendar.mode}
          options={CALENDAR_MODES.map((mode: CalendarMode) => ({
            value: mode,
            label: t(`studio_calendar_${mode}`),
          }))}
          onChange={(mode) =>
            setCalendar({ mode, panelColor: undefined, accent: undefined, accentText: undefined })
          }
        />
        <FieldRow label={t("studio_calendar_panel_colour")} hint={t("studio_calendar_panel_colour_hint")}>
          <ColourInput value={calendar.panelColor} onChange={(panelColor) => setCalendar({ panelColor })} />
        </FieldRow>
        <FieldRow label={t("studio_calendar_accent")} hint={t("studio_calendar_accent_hint")}>
          <ColourInput value={calendar.accent} onChange={(accent) => setCalendar({ accent })} />
        </FieldRow>
        <FieldRow label={t("studio_calendar_accent_text")}>
          <ColourInput value={calendar.accentText} onChange={(accentText) => setCalendar({ accentText })} />
        </FieldRow>
      </Section>

      <Section title={t("studio_calendar_slots")}>
        <div className="grid grid-cols-3 gap-2.5">
          {SLOT_SHAPES.map((slotShape: SlotShape) => (
            <OptionTile
              key={slotShape}
              selected={calendar.slotShape === slotShape}
              onClick={() => setCalendar({ slotShape })}
              label={t(`page_look_shape_${slotShape}`)}>
              <span
                className="block border border-[#121212] py-1 text-[11px] font-semibold"
                style={{ borderRadius: SLOT_RADII[slotShape] }}>
                9:30
              </span>
            </OptionTile>
          ))}
        </div>
        <FieldRow label={t("studio_calendar_time_format")} hint={t("studio_calendar_time_format_hint")}>
          <Segmented
            value={calendar.timeFormat}
            options={CALENDAR_TIME_FORMATS.map((format: CalendarTimeFormat) => ({
              value: format,
              label: t(`studio_calendar_time_${format}`),
            }))}
            onChange={(timeFormat) => setCalendar({ timeFormat })}
          />
        </FieldRow>
        <ToggleRow
          label={t("studio_calendar_show_timezone")}
          on={!calendar.hide.includes("timezone")}
          onChange={(on) => setShown("timezone", on)}
        />
      </Section>

      <Section title={t("studio_calendar_shown")}>
        {SHOWN_KEYS.map((key) => (
          <ToggleRow
            key={key}
            label={t(`studio_calendar_show_${key}`)}
            on={!calendar.hide.includes(key)}
            onChange={(on) => setShown(key, on)}
          />
        ))}
      </Section>
    </div>
  );
}

function Section(props: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section>
      <div className="text-[15px] font-semibold">{props.title}</div>
      {props.hint && <p className="mt-0.5 text-[12px] text-[#6b6a66]">{props.hint}</p>}
      <div className="mt-3 flex flex-col" style={{ rowGap: 14 }}>
        {props.children}
      </div>
    </section>
  );
}

function ToggleRow(props: { label: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[14px]">{props.label}</span>
      <Toggle on={props.on} label={props.label} onChange={props.onChange} />
    </div>
  );
}
