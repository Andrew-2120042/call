import process from "node:process";
import { APP_NAME, SUPPORT_MAIL_ADDRESS } from "@calcom/lib/constants";
import type { AppMeta } from "@calcom/types/App";

export const metadata = {
  name: `${APP_NAME} Video`,
  description: `${APP_NAME} Video is the built-in web-based video conferencing platform powered by Daily.co, which is minimalistic and lightweight, but has most of the features you need.`,
  installed: !!process.env.DAILY_API_KEY,
  type: "daily_video",
  variant: "conferencing",
  url: "https://daily.co",
  categories: ["conferencing"],
  logo: "icon.svg",
  publisher: APP_NAME,
  category: "conferencing",
  slug: "daily-video",
  title: `${APP_NAME} Video`,
  isGlobal: true,
  email: SUPPORT_MAIL_ADDRESS,
  appData: {
    location: {
      linkType: "dynamic",
      type: "integrations:daily",
      label: `${APP_NAME} Video`,
    },
  },
  key: { apikey: process.env.DAILY_API_KEY },
  dirName: "dailyvideo",
  isOAuth: false,
} as AppMeta;

export default metadata;
