import Image from "next/image";
import { FloatCard, Window } from "./window";

const Dot = ({ className }: { className: string }) => <span className={`inline-block h-1.5 w-1.5 rounded-full ${className}`} />;

export function BookingMock() {
  return (
    <div className="relative">
      <Window title="nodslot.site/maya/intro-call">
        <Image src="/shots/booking.png" alt="A Nodslot booking page" width={2160} height={1120} className="h-auto w-full" />
      </Window>
      <FloatCard className="absolute -bottom-5 right-4 w-60 sm:right-8">
        <p className="text-faint">New booking</p>
        <p className="mt-1 font-medium">Intro call with Sam Lee</p>
        <p className="text-muted mt-0.5">Tue 17 Nov · 9:30am · Google Meet</p>
      </FloatCard>
    </div>
  );
}

export function WaitlistMock() {
  const slots = [
    { t: "9:00am", s: "Booked" },
    { t: "10:00am", s: "Cancelled", hot: true },
    { t: "11:00am", s: "Booked" },
    { t: "2:00pm", s: "Booked" },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
      <Window title="Saturday · fully booked">
        <ul className="divide-y divide-line">
          {slots.map((slot) => (
            <li key={slot.t} className="flex items-center justify-between px-4 py-3 text-xs">
              <span className="tabular-nums">{slot.t}</span>
              <span className={slot.hot ? "text-amber-400" : "text-faint"}>{slot.s}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-line px-4 py-3 text-xs">
          <p className="text-faint">Waiting for 10:00am</p>
          <ol className="mt-2 space-y-1.5">
            <li className="flex items-center gap-2"><Dot className="bg-accent" /> Priya N. <span className="text-accent ms-auto">Offered</span></li>
            <li className="text-muted flex items-center gap-2"><Dot className="bg-line-strong" /> Tom R. <span className="ms-auto">2nd</span></li>
          </ol>
        </div>
      </Window>
      <div className="flex flex-col justify-center gap-3">
        <FloatCard>
          <p className="text-faint">Email to Priya</p>
          <p className="mt-1 text-sm font-medium">A spot opened up: Sat 10:00am</p>
          <p className="text-muted mt-1 leading-relaxed">The time you wanted is free. Claim it within 2 hours and it&apos;s yours.</p>
          <span className="bg-fg text-bg mt-3 inline-block rounded-full px-3 py-1 font-medium">Claim this time</span>
        </FloatCard>
        <FloatCard className="sm:ms-10">
          <p className="text-emerald-400">Claimed · booked automatically</p>
          <p className="text-muted mt-0.5">Calendar invites sent to you and Priya.</p>
        </FloatCard>
      </div>
    </div>
  );
}

export function NoShowMock() {
  const steps = [
    { when: "Mon 9:00am", what: "Booked", tone: "text-muted" },
    { when: "Thu 10:00am", what: "“Please confirm you’re coming” sent", tone: "text-muted" },
    { when: "Thu 4:12pm", what: "Confirmed in one click", tone: "text-emerald-400" },
    { when: "Fri 10:00am", what: "Session", tone: "text-fg" },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Window title="Booking timeline">
        <ol className="space-y-4 p-5 text-xs">
          {steps.map((s) => (
            <li key={s.when} className="flex gap-3">
              <span className="text-faint w-24 flex-none tabular-nums">{s.when}</span>
              <span className={s.tone}>{s.what}</span>
            </li>
          ))}
        </ol>
      </Window>
      <div className="flex flex-col justify-center gap-3">
        <FloatCard>
          <p className="text-faint">Didn&apos;t confirm by the deadline</p>
          <p className="mt-1 text-sm font-medium">Booking released · 3:00pm Friday</p>
          <p className="text-muted mt-1">You were told, and the time went to the next person on the waitlist.</p>
        </FloatCard>
        <FloatCard className="sm:ms-10">
          <p className="text-faint">Reminders</p>
          <p className="mt-1">1 day before · 1 hour before</p>
        </FloatCard>
      </div>
    </div>
  );
}

export function ApprovalMock() {
  return (
    <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
      <Window title="Bookings · Unconfirmed">
        <div className="space-y-3 p-5 text-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">Consultation · Wed 18 Nov, 2:00pm</p>
              <p className="text-muted mt-0.5">Jordan Blake · jordan@northfield.co</p>
            </div>
            <span className="rounded bg-amber-400/10 px-1.5 py-0.5 text-amber-400">Waiting</span>
          </div>
          <div className="rounded-lg border border-line bg-bg p-3">
            <p className="text-faint">Summary</p>
            <p className="mt-1 leading-relaxed">Runs a 6-person studio. Wants help moving 40 weekly clients off spreadsheets before January. Budget agreed.</p>
          </div>
          <div className="flex gap-2">
            <span className="bg-fg text-bg rounded-full px-3 py-1 font-medium">Accept</span>
            <span className="text-muted rounded-full border border-line-strong px-3 py-1">Decline</span>
          </div>
        </div>
      </Window>
      <div className="flex flex-col justify-center gap-3">
        <FloatCard>
          <p className="text-faint">Their answers</p>
          <p className="mt-1">What do you need help with?</p>
          <p className="text-muted mt-0.5">“We book everything in a shared sheet and…”</p>
        </FloatCard>
        <FloatCard className="sm:ms-10">
          <p className="text-emerald-400">Accepted · invites sent</p>
        </FloatCard>
      </div>
    </div>
  );
}

export function TeamMock() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  // Hours 9–17; values are how many of 4 people are free.
  const grid = [
    [4, 4, 3, 3, 2, 3, 4, 4],
    [3, 3, 2, 1, 0, 0, 2, 3],
    [4, 4, 4, 3, 3, 3, 2, 2],
    [2, 3, 3, 3, 4, 4, 3, 1],
    [4, 4, 3, 2, 2, 1, 1, 0],
  ];
  return (
    <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
      <Window title="Team · Who’s free this week">
        <div className="p-5">
          <div className="text-faint mb-2 grid grid-cols-[40px_repeat(8,1fr)] gap-1 text-[10px]">
            <span />
            {["9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p"].map((h) => <span key={h}>{h}</span>)}
          </div>
          {grid.map((row, i) => (
            <div key={days[i]} className="mb-1 grid grid-cols-[40px_repeat(8,1fr)] gap-1">
              <span className="text-faint text-[11px]">{days[i]}</span>
              {row.map((free, j) => (
                <span
                  key={j}
                  className="h-5 rounded-[3px]"
                  style={{ background: free ? `rgba(37,99,235,${0.18 + (free / 4) * 0.72})` : "var(--color-raised)" }}
                />
              ))}
            </div>
          ))}
        </div>
      </Window>
      <div className="flex flex-col justify-center gap-3">
        <FloatCard>
          <p className="text-amber-400">Nobody is free Tuesday, 1pm–3pm</p>
          <p className="text-muted mt-1">Spotted before a client tries to book it.</p>
        </FloatCard>
        <FloatCard className="sm:ms-10">
          <p className="text-faint">Round robin · Discovery call</p>
          <p className="mt-1">Next booking goes to <span className="text-fg">Lena</span> · 3 hosts</p>
        </FloatCard>
      </div>
    </div>
  );
}

export function HeroWindows() {
  return (
    <div className="relative mx-auto max-w-6xl">
      <Window title="Nodslot · Services" className="relative z-10">
        <Image src="/shots/dashboard.png" alt="The Nodslot dashboard" width={2560} height={1600} priority className="h-auto w-full" />
      </Window>
      <FloatCard className="absolute left-3 top-16 z-20 hidden w-64 md:block xl:-left-16">
        <p className="text-faint">Waitlist</p>
        <p className="mt-1 text-sm font-medium">Cancelled slot refilled</p>
        <p className="text-muted mt-0.5">Priya claimed Sat 10:00am in 4 minutes.</p>
      </FloatCard>
      <FloatCard className="absolute right-3 bottom-12 z-20 hidden w-60 md:block xl:-right-14">
        <p className="text-emerald-400">Confirmed</p>
        <p className="mt-1">3 of 3 clients confirmed for tomorrow.</p>
      </FloatCard>
    </div>
  );
}
