import type { StickerName } from "@/stickers/calbee-stickers";

// Picks an illustration that matches what a section is about, so in-article pictures relate to the text around them.
const RULES: [RegExp, StickerName][] = [
  [/waitlist|next in line|refill/i, "waitlist"],
  [/cancel/i, "cancelled"],
  [/no-show|remind|confirm-or-release/i, "bell"],
  [/approv|request|screen/i, "inbox"],
  [/\bAI\b|summar|assistant/i, "summary"],
  [/round robin|takes turns/i, "roundrobin"],
  [/team|staff|member/i, "team"],
  [/price|pricing|cost|\$|cheap|pay|billing|checkout/i, "coins"],
  [/free/i, "free"],
  [/ vs |versus|compare|comparison|head to head/i, "versus"],
  [/switch|migrat|import|move from|alternative/i, "swap"],
  [/email|rebook|follow.?up|template/i, "envelope"],
  [/video|zoom|meet|call/i, "video"],
  [/lead|attract|marketing/i, "magnet"],
  [/grow|more clients|revenue/i, "growth"],
  [/set ?up|settings|integrat|zapier|connect/i, "gear"],
  [/phone|mobile|sms|text/i, "phone"],
  [/time zone|lunch|break|hours|minute/i, "clock"],
  [/best|winner|pick|verdict|top/i, "trophy"],
  [/question|faq|how do|what is/i, "question"],
  [/notif|alert/i, "bell"],
  [/calendar|outlook|google|book/i, "calendar"],
];

export function stickerFor(text: string, fallback: StickerName = "calendar"): StickerName {
  for (const [re, name] of RULES) if (re.test(text)) return name;
  return fallback;
}
