import type z from "zod";

import type { eventTypeBookingFields } from "@calcom/prisma/zod-utils";

const OPTION_FIELD_TYPES = new Set(["select", "radio", "multiselect", "checkbox"]);

type ParsedBookingField = z.infer<typeof eventTypeBookingFields>[number];

// Option fields store the option's value (e.g. "500-2000"); people reading emails need its label ("$500 to $2,000").
export const getOptionDisplayValue = (
  field: Pick<ParsedBookingField, "type" | "options">,
  value: unknown
): string | string[] | undefined => {
  if (!OPTION_FIELD_TYPES.has(field.type) || !field.options?.length) return undefined;
  const labelByValue = new Map(field.options.map((option) => [option.value, option.label]));
  const toLabel = (item: string) => labelByValue.get(item) ?? item;
  if (typeof value === "string") return toLabel(value);
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) return value.map(toLabel);
  return undefined;
};

export const formatOptionDisplayValue = (displayValue: string | string[]): string =>
  Array.isArray(displayValue) ? displayValue.join(", ") : displayValue;
