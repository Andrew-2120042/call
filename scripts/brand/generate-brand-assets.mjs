#!/usr/bin/env node
// Regenerates every brand asset (wordmarks, favicons, app icons, manifest) from the two
// source SVGs in apps/web/public/brand and NEXT_PUBLIC_APP_NAME. Run after any rebrand:
//   node scripts/brand/generate-brand-assets.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const publicDir = join(repoRoot, "apps/web/public");
const brandDir = join(publicDir, "brand");

function readEnvAppName() {
  if (process.env.NEXT_PUBLIC_APP_NAME) return process.env.NEXT_PUBLIC_APP_NAME;
  try {
    const env = readFileSync(join(repoRoot, ".env"), "utf8");
    const match = env.match(/^NEXT_PUBLIC_APP_NAME=["']?([^"'\n]+)["']?$/m);
    if (match) return match[1];
  } catch {
    // .env is optional in CI; fall through to the default.
  }
  return "Nodslot";
}

const escapeXml = (value) =>
  value.replace(
    /[<>&"']/g,
    (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" })[char]
  );

const appName = readEnvAppName();
const markSvg = readFileSync(join(brandDir, "mark.svg"), "utf8");
const appIconSvg = readFileSync(join(brandDir, "app-icon.svg"), "utf8");
const markInner = markSvg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");

// textLength pins the rendered width so the wordmark is identical across system fonts.
// Swap this for outlined paths once the final logotype exists.
function buildWordmark(color) {
  const textWidth = Math.round(appName.length * 12.2);
  const width = 26 + 8 + textWidth;
  return `<svg width="${width}" height="26" viewBox="0 0 ${width} 26" fill="none" xmlns="http://www.w3.org/2000/svg">
${markInner.replaceAll("#292929", color)}
  <text x="34" y="20" fill="${color}" font-family="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="19" font-weight="700" letter-spacing="-0.2" textLength="${textWidth}" lengthAdjust="spacingAndGlyphs">${escapeXml(appName)}</text>
</svg>
`;
}

writeFileSync(join(brandDir, "wordmark.svg"), buildWordmark("#292929"));
writeFileSync(join(brandDir, "wordmark-black.svg"), buildWordmark("#000000"));
writeFileSync(join(brandDir, "mark-white.svg"), markSvg.replaceAll("#292929", "#FFFFFF"));
writeFileSync(join(publicDir, "safari-pinned-tab.svg"), markSvg.replaceAll("#292929", "#000000"));

const squareIcons = {
  "favicon-16x16.png": 16,
  "favicon-32x32.png": 32,
  "apple-touch-icon.png": 180,
  "android-chrome-192x192.png": 192,
  "android-chrome-256x256.png": 256,
  "android-chrome-384x384.png": 384,
  "android-chrome-512x512.png": 512,
  "mstile-70x70.png": 70,
  "mstile-144x144.png": 144,
  "mstile-150x150.png": 150,
  "mstile-310x310.png": 310,
};

const iconBuffer = Buffer.from(appIconSvg);
for (const [file, size] of Object.entries(squareIcons)) {
  await sharp(iconBuffer, { density: 384 }).resize(size, size).png().toFile(join(publicDir, file));
}

// Wide Windows tile: icon centred on a matching background.
const tileIcon = await sharp(iconBuffer, { density: 384 }).resize(150, 150).png().toBuffer();
await sharp({ create: { width: 310, height: 150, channels: 4, background: "#292929" } })
  .composite([{ input: tileIcon, left: 80, top: 0 }])
  .png()
  .toFile(join(publicDir, "mstile-310x150.png"));

// ICO container holding PNG payloads (supported by every modern browser).
const icoSizes = [16, 32, 48];
const pngs = await Promise.all(
  icoSizes.map((size) => sharp(iconBuffer, { density: 384 }).resize(size, size).png().toBuffer())
);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(pngs.length, 4);
let offset = 6 + 16 * pngs.length;
const entries = pngs.map((png, index) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(icoSizes[index], 0);
  entry.writeUInt8(icoSizes[index], 1);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += png.length;
  return entry;
});
writeFileSync(join(publicDir, "favicon.ico"), Buffer.concat([header, ...entries, ...pngs]));

const manifestPath = join(publicDir, "site.webmanifest");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.name = appName;
manifest.short_name = appName;
manifest.description = "Booking that lets you decide who gets on your calendar.";
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Brand assets generated for "${appName}".`);
