import { randomBytes } from "node:crypto";
import { webhooks } from "@polar-sh/sdk/2026-10";
import { describe, expect, it, vi } from "vitest";
import { createPolarGateway } from "../lib/polarGateway";
import { PolarWebhookSignatureError, signPolarWebhookForTest, verifyPolarWebhook } from "../lib/polarWebhook";

const secret = `whsec_${randomBytes(24).toString("base64")}`;
const body = JSON.stringify({ type: "subscription.active", data: { id: "sub_1" } });

// The official SDK distinguishes signature failures from payload-shape failures, so a non-verification
// error means the SDK accepted the signature.
const sdkAcceptsSignature = async (headers: Record<string, string>, payload = body) => {
  try {
    await webhooks.validateEvent(payload, headers, secret);
    return true;
  } catch (error) {
    return !(error instanceof webhooks.PolarWebhookVerificationError);
  }
};

describe("verifyPolarWebhook", () => {
  it.each([
    "legacy",
    "standard",
  ] as const)("accepts %s-key signatures exactly like the official SDK", async (scheme) => {
    const headers = signPolarWebhookForTest({ body, secret, scheme });
    expect(await sdkAcceptsSignature(headers)).toBe(true);
    expect(verifyPolarWebhook({ body: Buffer.from(body), headers, secret })).toEqual(JSON.parse(body));
  });

  it("rejects a tampered body, like the official SDK", async () => {
    const headers = signPolarWebhookForTest({ body, secret, scheme: "standard" });
    const tampered = body.replace("sub_1", "sub_2");
    expect(await sdkAcceptsSignature(headers, tampered)).toBe(false);
    expect(() => verifyPolarWebhook({ body: Buffer.from(tampered), headers, secret })).toThrow(
      PolarWebhookSignatureError
    );
  });

  it("rejects a signature made with a different secret", () => {
    const headers = signPolarWebhookForTest({
      body,
      secret: `whsec_${randomBytes(24).toString("base64")}`,
      scheme: "standard",
    });
    expect(() => verifyPolarWebhook({ body: Buffer.from(body), headers, secret })).toThrow(
      /Invalid webhook signature/
    );
  });

  it("rejects replays outside the 5 minute window and missing headers", () => {
    const old = Math.floor(Date.now() / 1000) - 10 * 60;
    const headers = signPolarWebhookForTest({ body, secret, scheme: "standard", timestamp: old });
    expect(() => verifyPolarWebhook({ body: Buffer.from(body), headers, secret })).toThrow(/window/);
    expect(() =>
      verifyPolarWebhook({
        body: Buffer.from(body),
        headers: { "webhook-id": "", "webhook-timestamp": "", "webhook-signature": "" },
        secret,
      })
    ).toThrow(/Missing/);
  });

  it("accepts the valid entry when several signatures are sent", () => {
    const headers = signPolarWebhookForTest({ body, secret, scheme: "standard" });
    headers["webhook-signature"] = `v1,${randomBytes(32).toString("base64")} ${headers["webhook-signature"]}`;
    expect(() => verifyPolarWebhook({ body: Buffer.from(body), headers, secret })).not.toThrow();
  });
});

describe("createPolarGateway", () => {
  const okJson = (json: unknown) => new Response(JSON.stringify(json), { status: 201 });

  it("creates a checkout with the user's id and returns its url", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okJson({ url: "https://polar.test/c/1" }));
    const gateway = createPolarGateway({ accessToken: "polar_oat_x", environment: "sandbox", fetchImpl });
    const url = await gateway.createCheckoutUrl({
      productId: "prod_pro",
      userId: 4,
      email: "jordan@example.com",
      successUrl: "https://app.test/ok",
      returnUrl: "https://app.test/back",
    });
    expect(url).toBe("https://polar.test/c/1");
    const [calledUrl, init] = fetchImpl.mock.calls[0];
    expect(calledUrl).toBe("https://sandbox-api.polar.sh/v1/checkouts/");
    expect(init.headers.authorization).toBe("Bearer polar_oat_x");
    expect(JSON.parse(init.body)).toMatchObject({
      products: ["prod_pro"],
      external_customer_id: "4",
      customer_email: "jordan@example.com",
    });
  });

  it("opens a customer portal session on production", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okJson({ customer_portal_url: "https://polar.test/portal" }));
    const gateway = createPolarGateway({ accessToken: "t", environment: "production", fetchImpl });
    expect(await gateway.createPortalUrl({ userId: 4, returnUrl: "https://app.test" })).toBe(
      "https://polar.test/portal"
    );
    expect(fetchImpl.mock.calls[0][0]).toBe("https://api.polar.sh/v1/customer-sessions/");
  });

  it("surfaces Polar errors with the status code", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("nope", { status: 422 }));
    const gateway = createPolarGateway({ accessToken: "t", environment: "sandbox", fetchImpl });
    await expect(gateway.createPortalUrl({ userId: 4, returnUrl: "x" })).rejects.toThrow(/422/);
  });
});
