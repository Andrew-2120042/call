import { describe, expect, it, vi } from "vitest";
import { normalizeDomain } from "../lib/normalizeDomain";
import { createVercelDomainHost } from "../lib/vercelDomainHost";
import type { StoredCustomDomain } from "../repositories/CustomDomainRepository";
import {
  CustomDomainService,
  type ICustomDomainRepository,
  type IDnsResolver,
} from "../services/CustomDomainService";

const NOW = new Date("2026-11-14T00:00:00.000Z");

function setup(opts: { entitled?: boolean; txt?: string[][] | Error; withHost?: boolean } = {}) {
  const rows = new Map<number, StoredCustomDomain>();
  const usernames = new Map<number, string>([
    [4, "pro"],
    [5, "other"],
  ]);
  const repository: ICustomDomainRepository = {
    findByUserId: async (userId) => rows.get(userId) ?? null,
    findByDomainIncludeUsername: async (domain) => {
      const row = [...rows.values()].find((r) => r.domain === domain);
      return row ? { ...row, user: { username: usernames.get(row.userId) ?? null } } : null;
    },
    isDomainTaken: async (domain, exceptUserId) =>
      [...rows.values()].some((r) => r.domain === domain && r.userId !== exceptUserId),
    upsertForUser: async ({ userId, domain, verificationToken }) => {
      rows.set(userId, { userId, domain, verificationToken, verifiedAt: null, lastCheckedAt: null });
    },
    markChecked: async (userId, verifiedAt, lastCheckedAt) => {
      const row = rows.get(userId);
      if (row) rows.set(userId, { ...row, verifiedAt, lastCheckedAt });
    },
    deleteForUser: async (userId) => {
      rows.delete(userId);
    },
  };
  let txt = opts.txt ?? [];
  const dns: IDnsResolver = {
    resolveTxt: vi.fn(async () => {
      if (txt instanceof Error) throw txt;
      return txt;
    }),
    resolveCname: vi.fn(async () => []),
  };
  const host = opts.withHost
    ? { addDomain: vi.fn().mockResolvedValue(undefined), removeDomain: vi.fn().mockResolvedValue(undefined) }
    : null;
  let entitled = opts.entitled ?? true;
  const service = new CustomDomainService({
    repository,
    dns,
    host,
    isEntitled: async () => entitled,
    reservedHosts: ["app.nodslot.test", "localhost", "vercel.app"],
    cnameTarget: "cname.nodslot.test",
    now: () => NOW,
  });
  return {
    service,
    host,
    rows,
    setTxt: (value: string[][] | Error) => {
      txt = value;
    },
    setEntitled: (value: boolean) => {
      entitled = value;
    },
  };
}

describe("normalizeDomain", () => {
  it("cleans pasted URLs", () => {
    expect(normalizeDomain(" https://Book.Example.com/30min?x=1 ")).toBe("book.example.com");
    expect(normalizeDomain("book.example.com:443")).toBe("book.example.com");
    expect(normalizeDomain("example.co.uk.")).toBe("example.co.uk");
  });

  it("rejects things that aren't hostnames", () => {
    for (const bad of [
      "",
      "localhost",
      "no spaces.com",
      "-bad.com",
      "bad-.com",
      "a..com",
      "http://",
      "1.2.3.4",
    ]) {
      expect(normalizeDomain(bad)).toBeNull();
    }
  });
});

describe("CustomDomainService", () => {
  it("only lets entitled users add a domain", async () => {
    const ctx = setup({ entitled: false });
    await expect(ctx.service.add(4, "book.example.com")).rejects.toThrow(/Pro plan/);
  });

  it("adds a domain with DNS instructions and connects it on the host", async () => {
    const ctx = setup({ withHost: true });
    const status = await ctx.service.add(4, "https://Book.Example.com/");
    expect(status.domain).toBe("book.example.com");
    expect(status.verified).toBe(false);
    expect(status.records).toEqual([
      {
        type: "TXT",
        name: "_nodslot-verify.book.example.com",
        value: expect.stringMatching(/^nodslot-[a-f0-9]{32}$/),
      },
      { type: "CNAME", name: "book.example.com", value: "cname.nodslot.test" },
    ]);
    expect(ctx.host?.addDomain).toHaveBeenCalledWith("book.example.com");
  });

  it("refuses invalid, reserved and already-claimed domains", async () => {
    const ctx = setup();
    await expect(ctx.service.add(4, "not a domain")).rejects.toThrow(/Enter a domain/);
    await expect(ctx.service.add(4, "app.nodslot.test")).rejects.toThrow(/can't be used/);
    await expect(ctx.service.add(4, "x.app.nodslot.test")).rejects.toThrow(/can't be used/);
    await expect(ctx.service.add(4, "evil.vercel.app")).rejects.toThrow(/can't be used/);
    await ctx.service.add(5, "book.example.com");
    await expect(ctx.service.add(4, "book.example.com")).rejects.toThrow(/another account/);
  });

  it("swaps domains: new token, old one released on the host", async () => {
    const ctx = setup({ withHost: true });
    const first = await ctx.service.add(4, "book.example.com");
    const again = await ctx.service.add(4, "book.example.com");
    expect(again.records[0].value).toBe(first.records[0].value);
    const second = await ctx.service.add(4, "meet.example.com");
    expect(second.records[0].value).not.toBe(first.records[0].value);
    expect(ctx.host?.removeDomain).toHaveBeenCalledWith("book.example.com");
  });

  it("verifies only when the TXT record holds the token, and un-verifies when it is removed", async () => {
    const ctx = setup();
    const status = await ctx.service.add(4, "book.example.com");
    const token = status.records[0].value;

    ctx.setTxt([["something-else"]]);
    expect((await ctx.service.verify(4)).verified).toBe(false);

    ctx.setTxt([["nodslot-", token.slice("nodslot-".length)]]); // long TXT values arrive in chunks
    const verified = await ctx.service.verify(4);
    expect(verified.verified).toBe(true);
    expect(verified.verifiedAt).toEqual(NOW);

    ctx.setTxt(Object.assign(new Error("ENOTFOUND"), { code: "ENOTFOUND" }));
    expect((await ctx.service.verify(4)).verified).toBe(false);
  });

  it("resolves only verified domains, and marks them inactive when the plan lapses", async () => {
    const ctx = setup();
    const status = await ctx.service.add(4, "book.example.com");
    expect(await ctx.service.resolve("book.example.com")).toEqual({ kind: "unknown" });

    ctx.setTxt([[status.records[0].value]]);
    await ctx.service.verify(4);
    expect(await ctx.service.resolve("BOOK.example.com:443")).toEqual({ kind: "active", username: "pro" });

    ctx.setEntitled(false);
    expect(await ctx.service.resolve("book.example.com")).toEqual({ kind: "inactive", username: "pro" });
    expect(await ctx.service.resolve("nobody.example.com")).toEqual({ kind: "unknown" });
  });

  it("removes the domain and releases it on the host", async () => {
    const ctx = setup({ withHost: true });
    await ctx.service.add(4, "book.example.com");
    await ctx.service.remove(4);
    expect(await ctx.service.get(4)).toBeNull();
    expect(ctx.host?.removeDomain).toHaveBeenCalledWith("book.example.com");
  });
});

describe("createVercelDomainHost", () => {
  const response = (status: number, body: unknown = {}) =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

  it("calls the project domains API with the team", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response(200, { name: "book.example.com" }));
    const host = createVercelDomainHost({ token: "tok", projectId: "prj_1", teamId: "team_1", fetchImpl });
    await host.addDomain("book.example.com");
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.vercel.com/v10/projects/prj_1/domains?teamId=team_1",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ name: "book.example.com" }) })
    );
  });

  it("treats an existing domain as success and surfaces other errors", async () => {
    const exists = vi.fn().mockResolvedValue(response(409, { error: { code: "domain_already_exists" } }));
    await expect(
      createVercelDomainHost({ token: "t", projectId: "p", fetchImpl: exists }).addDomain("a.com")
    ).resolves.toBeUndefined();
    const taken = vi
      .fn()
      .mockResolvedValue(
        response(409, { error: { code: "domain_already_in_use", message: "in use elsewhere" } })
      );
    await expect(
      createVercelDomainHost({ token: "t", projectId: "p", fetchImpl: taken }).addDomain("a.com")
    ).rejects.toThrow(/in use elsewhere/);
  });

  it("ignores 404 on removal", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response(404));
    await expect(
      createVercelDomainHost({ token: "t", projectId: "p", fetchImpl }).removeDomain("a.com")
    ).resolves.toBeUndefined();
  });
});
