import { describe, expect, it } from "vitest";
import { isAppHost, routeCustomDomainPath } from "./customDomainRouting";

describe("routeCustomDomainPath", () => {
  it("maps the domain root and service slugs onto the owner's pages", () => {
    expect(routeCustomDomainPath("/", "pro")).toEqual({ kind: "rewrite", pathname: "/pro" });
    expect(routeCustomDomainPath("/30min", "pro")).toEqual({ kind: "rewrite", pathname: "/pro/30min" });
    expect(routeCustomDomainPath("/30min/embed", "pro")).toEqual({
      kind: "rewrite",
      pathname: "/pro/30min/embed",
    });
  });

  it("serves shared booking pages as-is", () => {
    for (const path of [
      "/booking/abc",
      "/reschedule/abc",
      "/waitlist/claim/t",
      "/attendance/confirm/t",
      "/pro/30min",
    ]) {
      expect(routeCustomDomainPath(path, "pro")).toEqual({ kind: "pass" });
    }
  });

  it("sends owner areas to the main app", () => {
    expect(routeCustomDomainPath("/auth/login", "pro")).toEqual({
      kind: "redirect-to-app",
      pathname: "/auth/login",
    });
    expect(routeCustomDomainPath("/settings/billing", "pro")).toEqual({
      kind: "redirect-to-app",
      pathname: "/settings/billing",
    });
  });
});

describe("isAppHost", () => {
  const urls = ["https://app.slotwise.test", "https://slotwise.test"];
  it("recognises the app's own hosts", () => {
    for (const host of [
      "app.slotwise.test",
      "SLOTWISE.test:443",
      "localhost:3000",
      "127.0.0.1",
      "x-y.vercel.app",
    ]) {
      expect(isAppHost(host, urls)).toBe(true);
    }
    expect(isAppHost("internal.example.com", urls, ["internal.example.com"])).toBe(true);
  });

  it("treats anything else as a custom domain", () => {
    expect(isAppHost("book.example.com", urls)).toBe(false);
    expect(isAppHost("app.slotwise.test.evil.com", urls)).toBe(false);
  });
});
