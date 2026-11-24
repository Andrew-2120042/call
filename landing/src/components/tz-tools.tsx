"use client";

import { useEffect, useMemo, useState } from "react";

// Shared helpers for the free time zone tools. Everything runs in the visitor's browser with Intl; nothing is sent anywhere.
const FALLBACK_ZONES = [
  "UTC", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Madrid", "Europe/Amsterdam", "Africa/Lagos", "Africa/Johannesburg",
  "Asia/Dubai", "Asia/Kolkata", "Asia/Singapore", "Asia/Hong_Kong", "Asia/Tokyo", "Australia/Sydney", "Pacific/Auckland",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Toronto", "America/Sao_Paulo", "America/Mexico_City",
];
const allZones = (): string[] => {
  try {
    return (Intl as unknown as { supportedValuesOf: (k: string) => string[] }).supportedValuesOf("timeZone");
  } catch {
    return FALLBACK_ZONES;
  }
};
const label = (zone: string) => zone.replace(/_/g, " ").split("/").slice(-1)[0];

/** Offset of a zone from UTC, in minutes, at a given instant. */
function offsetMinutes(zone: string, at: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return Math.round((asUtc - at.getTime()) / 60000);
}
/** The instant that is `date` + `time` on the wall clock in `zone`. */
function instantIn(zone: string, date: string, time: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, hh, mm));
  return new Date(guess.getTime() - offsetMinutes(zone, guess) * 60000);
}
const fmt = (zone: string, at: Date, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { timeZone: zone, ...opts }).format(at);
const offsetLabel = (zone: string, at: Date) => {
  const m = offsetMinutes(zone, at);
  const sign = m >= 0 ? "+" : "-";
  const a = Math.abs(m);
  return `UTC${sign}${Math.floor(a / 60)}${a % 60 ? `:${String(a % 60).padStart(2, "0")}` : ""}`;
};

function ZonePicker({ onAdd, exclude }: { onAdd: (zone: string) => void; exclude: string[] }) {
  const [value, setValue] = useState("");
  const zones = useMemo(() => allZones().filter((z) => !exclude.includes(z)), [exclude]);
  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const match = zones.find((z) => z.toLowerCase() === value.toLowerCase()) ?? zones.find((z) => z.toLowerCase().includes(value.toLowerCase()));
        if (match) onAdd(match);
        setValue("");
      }}>
      <input
        list="tz-list"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a city or time zone, e.g. Tokyo"
        className="h-10 min-w-0 flex-1 rounded-md border border-line bg-surface px-3 text-[15px]"
      />
      <datalist id="tz-list">{zones.map((z) => <option key={z} value={z} />)}</datalist>
      <button type="submit" className="h-10 rounded-md border border-line px-4 text-[14px] hover:border-line-strong">Add</button>
    </form>
  );
}

const useLocalZone = () => {
  const [zone, setZone] = useState("UTC");
  useEffect(() => setZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"), []);
  return zone;
};

export function TimeZoneConverter() {
  const local = useLocalZone();
  const [from, setFrom] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [targets, setTargets] = useState(["Europe/London", "America/New_York", "America/Los_Angeles", "Asia/Kolkata", "Australia/Sydney"]);
  useEffect(() => {
    setFrom(local);
    setDate(new Date().toISOString().slice(0, 10));
  }, [local]);
  if (!from || !date) return <div className="h-64 rounded-xl border border-line bg-surface" />;
  const at = instantIn(from, date, time);
  const fromDay = fmt(from, at, { weekday: "short", day: "numeric", month: "short" });
  return (
    <div className="rounded-2xl border border-line p-5 sm:p-6">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <select value={from} onChange={(e) => setFrom(e.target.value)} className="h-11 rounded-md border border-line bg-surface px-3 text-[15px]" aria-label="From time zone">
          {allZones().map((z) => <option key={z} value={z}>{z.replace(/_/g, " ")}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="h-11 rounded-md border border-line bg-surface px-3 text-[15px]" aria-label="Date" />
        <input type="time" value={time} onChange={(e) => e.target.value && setTime(e.target.value)} className="h-11 rounded-md border border-line bg-surface px-3 text-[15px]" aria-label="Time" />
      </div>
      <p className="text-muted mt-3 text-[14px]">{time} on {fromDay} in {label(from)} ({offsetLabel(from, at)}) is:</p>
      <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
        {targets.map((z) => {
          const day = fmt(z, at, { weekday: "short", day: "numeric", month: "short" });
          return (
            <li key={z} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{label(z)}</p>
                <p className="text-faint text-[13px]">{z.replace(/_/g, " ")} · {offsetLabel(z, at)}</p>
              </div>
              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="font-serif text-[24px] leading-none">{fmt(z, at, { hour: "numeric", minute: "2-digit" })}</p>
                  <p className={`mt-1 text-[13px] ${day === fromDay ? "text-faint" : "text-amber-400"}`}>{day}</p>
                </div>
                <button type="button" aria-label={`Remove ${label(z)}`} onClick={() => setTargets(targets.filter((t) => t !== z))} className="text-faint hover:text-fg px-1 text-[18px]">×</button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-4"><ZonePicker exclude={targets} onAdd={(z) => setTargets([...targets, z])} /></div>
    </div>
  );
}

export function MeetingPlanner() {
  const local = useLocalZone();
  const [zones, setZones] = useState<string[]>([]);
  const [date, setDate] = useState("");
  useEffect(() => {
    setZones([...new Set([local, "Europe/London", "America/New_York", "Asia/Kolkata"])].slice(0, 3));
    setDate(new Date().toISOString().slice(0, 10));
  }, [local]);
  if (!zones.length || !date) return <div className="h-96 rounded-xl border border-line bg-surface" />;
  const base = zones[0];
  const hours = Array.from({ length: 24 }, (_, h) => instantIn(base, date, `${String(h).padStart(2, "0")}:00`));
  const kind = (zone: string, at: Date) => {
    const h = Number(fmt(zone, at, { hour: "numeric", hourCycle: "h23" }));
    return h >= 9 && h < 17 ? "work" : (h >= 7 && h < 9) || (h >= 17 && h < 21) ? "edge" : "night";
  };
  const colour = { work: "bg-emerald-500/20 text-fg", edge: "bg-amber-500/15 text-fg/80", night: "text-faint" } as const;
  return (
    <div className="rounded-2xl border border-line p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="h-10 rounded-md border border-line bg-surface px-3 text-[15px]" aria-label="Date" />
        <div className="min-w-[240px] flex-1"><ZonePicker exclude={zones} onAdd={(z) => zones.length < 6 && setZones([...zones, z])} /></div>
      </div>
      <div className="text-muted mt-4 flex flex-wrap gap-4 text-[13px]">
        <span><span className="mr-1.5 inline-block h-3 w-3 rounded-sm bg-emerald-500/40 align-middle" />Working hours (9–5)</span>
        <span><span className="mr-1.5 inline-block h-3 w-3 rounded-sm bg-amber-500/30 align-middle" />Early or late</span>
        <span>★ Everyone in working hours</span>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[520px] text-[14px]">
          <thead className="bg-surface">
            <tr>
              <th className="w-8" />
              {zones.map((z, i) => (
                <th key={z} scope="col" className="px-3 py-2.5 text-left font-medium">
                  <span className="flex items-center justify-between gap-2">
                    {label(z)}
                    {i > 0 && <button type="button" aria-label={`Remove ${label(z)}`} onClick={() => setZones(zones.filter((x) => x !== z))} className="text-faint hover:text-fg">×</button>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((at) => {
              const all = zones.every((z) => kind(z, at) === "work");
              return (
                <tr key={at.getTime()} className="border-t border-line">
                  <td className="px-2 text-center text-amber-300">{all ? "★" : ""}</td>
                  {zones.map((z) => (
                    <td key={z} className={`px-3 py-1.5 tabular-nums ${colour[kind(z, at)]}`}>{fmt(z, at, { hour: "numeric", minute: "2-digit" })}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
