import classNames from "classnames";
import type { CSSProperties } from "react";

/** One pulsing placeholder block. Sized with classes or style by the caller. */
export function Bone({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      className={classNames("bg-emphasis block animate-pulse rounded-md", className)}
      style={style}
    />
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={classNames("bg-default border-subtle rounded-2xl border p-5", className)}>{children}</div>
  );
}

/** Rows of avatar + two lines + trailing pill, for bookings, waitlist and similar lists. */
export function ListSkeleton({ rows = 5, avatar = true }: { rows?: number; avatar?: boolean }) {
  return (
    <div
      className="bg-default border-subtle overflow-hidden rounded-2xl border"
      aria-busy
      data-testid="list-skeleton">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className={classNames("flex items-center gap-3 px-5 py-4", index > 0 && "border-subtle border-t")}>
          {avatar && <Bone className="h-9 w-9 flex-none rounded-full" />}
          <div className="min-w-0 flex-1">
            <Bone className="h-4" style={{ width: `${38 - (index % 3) * 6}%` }} />
            <Bone className="mt-2 h-3" style={{ width: `${24 + (index % 2) * 8}%` }} />
          </div>
          <Bone className="h-6 w-20 flex-none rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3" aria-busy>
      {Array.from({ length: count }, (_, index) => (
        <Card key={index}>
          <Bone className="h-4 w-32" />
          <Bone className="mt-3 h-8 w-14" />
          <Bone className="mt-3 h-3 w-24" />
        </Card>
      ))}
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-5xl" aria-busy data-testid="home-skeleton">
      <div className="border-subtle flex items-center justify-between border-b pb-6">
        <Bone className="h-8 w-64" />
        <Bone className="h-10 w-52 rounded-full" />
      </div>
      <Bone className="mt-10 h-6 w-36" />
      <div className="mt-4">
        <StatsSkeleton />
      </div>
      <div className="mt-4">
        <ListSkeleton rows={4} />
      </div>
    </div>
  );
}

/** A settings-style card: title, hint, then form rows. */
export function SettingsCardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card className="p-6">
      <Bone className="h-5 w-40" />
      <Bone className="mt-2 h-3 w-64" />
      <div className="mt-6 flex flex-col gap-5">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index}>
            <Bone className="h-3 w-24" />
            <Bone className="mt-2 h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </Card>
  );
}

/** Title + description + cards, for settings pages that have no bespoke skeleton. */
export function SettingsPageSkeleton({ cards = 2 }: { cards?: number }) {
  return (
    <div aria-busy data-testid="settings-skeleton">
      <Bone className="h-7 w-48" />
      <Bone className="mt-2 h-4 w-72" />
      <div className="mt-6 flex flex-col gap-4">
        {Array.from({ length: cards }, (_, index) => (
          <SettingsCardSkeleton key={index} rows={index === 0 ? 3 : 2} />
        ))}
      </div>
    </div>
  );
}

export function PlansSkeleton() {
  return (
    <div aria-busy data-testid="plans-skeleton">
      <Card className="p-6">
        <Bone className="h-3 w-24" />
        <Bone className="mt-3 h-7 w-20" />
        <Bone className="mt-3 h-3 w-48" />
      </Card>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Card key={index} className="p-6">
            <Bone className="h-5 w-16" />
            <Bone className="mt-4 h-8 w-20" />
            <div className="mt-6 flex flex-col gap-3">
              {[0, 1, 2, 3, 4].map((line) => (
                <Bone key={line} className="h-3" style={{ width: `${88 - line * 9}%` }} />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** Page chrome (title + subtitle) with a list, for main-nav routes while the server component loads. */
export function PageListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-busy>
      <Bone className="h-7 w-40" />
      <Bone className="mt-2 h-4 w-80 max-w-full" />
      <div className="mt-6 flex gap-2">
        {[0, 1, 2, 3].map((index) => (
          <Bone key={index} className="h-8 w-24 rounded-lg" />
        ))}
      </div>
      <div className="mt-4">
        <ListSkeleton rows={rows} avatar={false} />
      </div>
    </div>
  );
}

export function AssistantSkeleton() {
  return (
    <div className="mx-auto flex max-w-[680px] flex-col items-center py-24" aria-busy>
      <Bone className="h-12 w-12 rounded-2xl" />
      <Bone className="mt-5 h-8 w-72" />
      <Bone className="mt-3 h-4 w-96 max-w-full" />
      <Bone className="mt-8 h-24 w-full rounded-3xl" />
      <div className="mt-6 grid w-full gap-2.5 sm:grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <Bone key={index} className="h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
