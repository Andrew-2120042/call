// Translations reference the product name as {{appName}} so a rebrand never touches locale files.
// Kept as CommonJS because next-i18next.config.js is loaded by Next.js without transpilation.
const process = require("node:process");

const APP_NAME_FOR_I18N = process.env.NEXT_PUBLIC_APP_NAME || "Slotwise";

module.exports = { APP_NAME_FOR_I18N };
