import { describe, expect, it } from "vitest";
import { isCronRequestAuthorized } from "./isCronRequestAuthorized";

const request = (header: string | null, query?: string) => ({
  headers: new Headers(header ? { authorization: header } : {}),
  nextUrl: new URL(`https://app.test/api/cron/x${query ? `?apiKey=${query}` : ""}`),
});

describe("isCronRequestAuthorized", () => {
  it("accepts the key in the header or the query string", () => {
    expect(isCronRequestAuthorized(request("secret"), "secret")).toBe(true);
    expect(isCronRequestAuthorized(request(null, "secret"), "secret")).toBe(true);
  });

  it("rejects wrong, missing or differently sized keys", () => {
    expect(isCronRequestAuthorized(request("nope"), "secret")).toBe(false);
    expect(isCronRequestAuthorized(request(null), "secret")).toBe(false);
    expect(isCronRequestAuthorized(request("secret-longer"), "secret")).toBe(false);
  });

  it("rejects everything when no key is configured", () => {
    expect(isCronRequestAuthorized(request("anything"), undefined)).toBe(false);
  });
});
