// Translations reference the product name as {{appName}} so a rebrand never touches locale files.
// Kept as CommonJS because next-i18next.config.js is loaded by Next.js without transpilation.
// Uses the global `process` (no node:process import) because this config is also bundled for the browser.
const APP_NAME_FOR_I18N = process.env.NEXT_PUBLIC_APP_NAME || "Nodslot";

module.exports = { APP_NAME_FOR_I18N };
