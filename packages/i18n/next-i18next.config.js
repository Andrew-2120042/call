const path = require("node:path");
const i18n = require("../../i18n.json");
const { APP_NAME_FOR_I18N } = require("./brand");

/** @type {import("next-i18next").UserConfig} */
const config = {
  i18n: {
    defaultLocale: i18n.locale.source,
    locales: i18n.locale.targets.concat([i18n.locale.source]),
  },
  fallbackLng: {
    default: ["en"],
    zh: ["zh-CN"],
  },
  reloadOnPrerender: process.env.NODE_ENV !== "production",
  localePath: path.resolve(__dirname, "./locales"),
  interpolation: {
    defaultVariables: { appName: APP_NAME_FOR_I18N },
  },
};

module.exports = config;
