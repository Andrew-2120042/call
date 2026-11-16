"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Icon } from "@calcom/ui/components/icon";
import { useEffect, useState } from "react";

import { useBookingSearch } from "../hooks/useBookingSearch";

/** Type a name, email or service; the list filters as you type (debounced so we don't query every keystroke). */
export function BookingSearch({ onSearch }: { onSearch?: () => void }) {
  const { t } = useLocale();
  const [search, setSearch] = useBookingSearch();
  const [value, setValue] = useState(search);

  useEffect(() => setValue(search), [search]);
  useEffect(() => {
    if (value.trim() === search) return;
    const timer = setTimeout(() => {
      setSearch(value.trim());
      onSearch?.();
    }, 300);
    return () => clearTimeout(timer);
  }, [value, search, setSearch, onSearch]);

  return (
    <label className="border-default bg-default focus-within:border-emphasis flex h-9 w-full items-center gap-2 rounded-lg border px-3 transition md:w-64">
      <Icon name="search" className="text-subtle h-4 w-4 flex-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("search_bookings_placeholder")}
        aria-label={t("search_bookings_placeholder")}
        className="text-emphasis placeholder:text-subtle h-full w-full min-w-0 bg-transparent text-sm outline-none"
        data-testid="bookings-search"
      />
    </label>
  );
}
