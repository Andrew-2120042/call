import { ImageResponse } from "next/og";
import { site } from "@/site.config";

export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#090909",
        color: "#f5f5f5",
        padding: 80,
        fontFamily: "sans-serif",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 36, fontWeight: 600 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f5f5f5" }} />
        {site.name}
      </div>
      <div style={{ fontSize: 72, fontWeight: 600, letterSpacing: -2, lineHeight: 1.05, maxWidth: 900 }}>{site.tagline}</div>
      <div style={{ fontSize: 28, color: "#a3a3a3" }}>Free booking link · Waitlist · No-show protection · Teams</div>
    </div>,
    size
  );
}
