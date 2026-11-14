import classNames from "classnames";
import type { ReactNode } from "react";
import { Icon } from "@calcom/ui/components/icon";
import { useEffect, useId, useRef, useState } from "react";

const SWATCHES = [
  "#ffffff",
  "#121212",
  "#f4f3f0",
  "#e4edf5",
  "#e3ebe2",
  "#f6e7e1",
  "#f5edd2",
  "#2f3b52",
  "#7a3b2e",
  "#3d5a40",
];

export function FieldRow(props: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-[14px] font-semibold">{props.label}</div>
        {props.hint && <div className="text-[12px] text-[#6b6a66]">{props.hint}</div>}
      </div>
      {props.children}
    </div>
  );
}

export function OptionTile(props: {
  selected: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      aria-pressed={props.selected}
      className={classNames(
        "rounded-2xl border p-3 text-center transition",
        props.selected ? "border-[#121212] ring-1 ring-[#121212]" : "border-[#e4e3df] hover:border-[#bdbcb7]"
      )}>
      {props.children}
      <span className="mt-2 block text-[12px] font-medium">{props.label}</span>
    </button>
  );
}

export function Segmented<T extends string>(props: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex rounded-full bg-[#f1f0ed] p-1">
      {props.options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => props.onChange(option.value)}
          className={classNames(
            "rounded-full px-4 py-1.5 text-[13px] font-semibold transition",
            props.value === option.value ? "bg-white shadow-sm" : "text-[#6b6a66]"
          )}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Colour box: current colour (click for any colour), hex field and quick swatches. */
export function ColourInput(props: { value: string; onChange: (value: string) => void }) {
  const [text, setText] = useState(props.value);
  useEffect(() => setText(props.value), [props.value]);
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2 rounded-xl border border-[#e4e3df] py-1.5 pl-1.5 pr-3">
        <label
          className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-lg border border-black/10"
          style={{ background: props.value }}>
          <input
            type="color"
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Pick a colour"
          />
        </label>
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) props.onChange(e.target.value);
          }}
          className="w-[76px] border-0 bg-transparent p-0 font-mono text-[12px] uppercase focus:outline-none focus:ring-0"
          aria-label="Hex colour"
        />
      </div>
      <div className="flex gap-1">
        {SWATCHES.map((swatch) => (
          <button
            key={swatch}
            type="button"
            aria-label={swatch}
            onClick={() => props.onChange(swatch)}
            className="h-4 w-4 rounded-full border border-black/10"
            style={{ background: swatch }}
          />
        ))}
      </div>
    </div>
  );
}

export function Toggle(props: { on: boolean; label: string; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.on}
      aria-label={props.label}
      onClick={() => props.onChange(!props.on)}
      className={classNames(
        "relative h-6 w-10 flex-none rounded-full transition-colors",
        props.on ? "bg-[#121212]" : "bg-[#dcdbd7]"
      )}>
      <span
        className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
        // Inline transform so the knob position survives a stale dev stylesheet in Safari.
        style={{ transform: props.on ? "translateX(16px)" : "translateX(0)" }}
      />
    </button>
  );
}

type SelectOption<T extends string> = { value: T; label: string; hint?: string };

/** The editor's own dropdown, so it matches the rest of the panel instead of the browser's native menu. */
export function Select<T extends string>(props: {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  label: string;
  testId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = props.options.find((option) => option.value === props.value) ?? props.options[0];

  useEffect(() => {
    if (!open) return;
    setActive(
      Math.max(
        0,
        props.options.findIndex((option) => option.value === props.value)
      )
    );
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, props.options, props.value]);

  const choose = (value: T) => {
    props.onChange(value);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={props.label}
        data-testid={props.testId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            setOpen(true);
            return;
          }
          if (!open) return;
          if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((index) => Math.min(index + 1, props.options.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => Math.max(index - 1, 0));
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            choose(props.options[active].value);
          }
        }}
        className={classNames(
          "flex w-full items-center justify-between gap-3 border bg-white px-4 text-left text-[14px] font-medium transition",
          open ? "border-[#121212]" : "border-[#e4e3df] hover:border-[#bdbcb7]"
        )}
        style={{ height: 46, borderRadius: 14 }}>
        <span className="truncate">{selected?.label}</span>
        <Icon
          name="chevron-down"
          className={classNames(
            "h-4 w-4 flex-none text-[#6b6a66] transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={props.label}
          className="no-scrollbar absolute inset-x-0 z-30 mt-1.5 overflow-y-auto bg-white p-1.5"
          style={{
            maxHeight: 280,
            borderRadius: 16,
            boxShadow: "0 0 0 1px rgba(0,0,0,.06), 0 18px 40px -16px rgba(0,0,0,.28)",
          }}>
          {props.options.map((option, index) => {
            const isSelected = option.value === props.value;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setActive(index)}
                onClick={() => choose(option.value)}
                className={classNames(
                  "flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-[14px]",
                  index === active && "bg-[#f3f2ef]"
                )}
                style={{ borderRadius: 10 }}>
                <span className="min-w-0">
                  <span className={classNames("block truncate", isSelected && "font-semibold")}>
                    {option.label}
                  </span>
                  {option.hint && <span className="block text-[12px] text-[#6b6a66]">{option.hint}</span>}
                </span>
                {isSelected && <Icon name="check" className="h-4 w-4 flex-none" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
