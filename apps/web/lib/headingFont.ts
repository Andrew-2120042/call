import { Newsreader } from "next/font/google";

// The marketing site's serif, used only for onboarding and first-visit page intros so setup feels continuous
// with the landing page; the rest of the app keeps Inter.
export const headingFont = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});
