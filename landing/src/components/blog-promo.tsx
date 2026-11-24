import Image from "next/image";
import { type ReleaseImage, SHOTS } from "@/content/releases";
import { signupUrl, site } from "@/site.config";

type Pitch = { title: string; body: string; shot: ReleaseImage; button: string };

// The product pitch inside a post matches what the post is about, the way Zapier's banners match each article.
export function pitchFor(slug: string): Pitch {
  if (/waitlist|cancel/.test(slug))
    return { title: "Fill cancelled times automatically", body: `${site.name} offers a freed time to the next person on your waitlist, and they claim it in one click.`, shot: SHOTS.waitlist, button: "Try the waitlist free" };
  if (/no-show/.test(slug))
    return { title: "Stop losing sessions to no-shows", body: "Clients confirm before the day in one click. If they don't, the time goes back to your waitlist.", shot: SHOTS.upcoming, button: `Try ${site.name} free` };
  if (/approve|request|lead|clients/.test(slug))
    return { title: "Know who's booking before you say yes", body: "Every request comes with a short AI summary and a Good fit or Fit unclear label.", shot: SHOTS.requests, button: `Try ${site.name} free` };
  if (/team|round-robin|seat/.test(slug))
    return { title: "One booking link for your whole team", body: "Round robin, a shared team page and a team waitlist. $69 a month for up to 10 people.", shot: SHOTS.teams, button: "See the Team plan" };
  return { title: "A free booking link that keeps your calendar full", body: "Unlimited services, calendars, approvals and reminders, free, plus a waitlist on one service. Pro puts it on every service and adds AI request summaries.", shot: SHOTS.home, button: `Get ${site.name} free` };
}

/** A wide coloured banner between sections, with the product on the right. */
export function PromoBanner({ pitch }: { pitch: Pitch }) {
  return (
    <aside className="not-prose my-12 overflow-hidden rounded-2xl bg-[#cfeee6] text-black">
      <div className="grid items-center gap-6 p-7 sm:grid-cols-[1fr_1.1fr] sm:p-8">
        <div>
          <p className="font-serif text-[27px] leading-[1.15] tracking-[-0.01em]">{pitch.title}</p>
          <p className="mt-3 text-[16px] leading-relaxed text-black/75">{pitch.body}</p>
          <a href={signupUrl} className="mt-5 inline-flex h-11 items-center rounded-md bg-black px-5 text-[15px] font-medium text-white transition hover:bg-black/85">
            {pitch.button}
          </a>
        </div>
        <div className="overflow-hidden rounded-xl border border-black/10 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.5)]">
          <Image src={pitch.shot.src} alt={pitch.shot.alt} width={pitch.shot.width} height={pitch.shot.height} sizes="360px" className="block h-auto w-full" />
        </div>
      </div>
    </aside>
  );
}

/** A small coloured card that sits beside a paragraph on wide screens and above it on phones. */
export function PromoNote() {
  return (
    <aside className="my-6 rounded-xl bg-[#ffc876] p-6 text-center text-black sm:float-right sm:my-2 sm:ms-7 sm:w-[230px]">
      <p className="text-[19px] font-semibold leading-snug">Spend less time scheduling</p>
      <a href={signupUrl} className="mt-4 inline-flex h-10 items-center rounded-md bg-black px-4 text-[14px] font-medium text-white transition hover:bg-black/85">
        Get your free link
      </a>
    </aside>
  );
}
