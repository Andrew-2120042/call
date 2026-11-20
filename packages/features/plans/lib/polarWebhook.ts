import { createHmac, timingSafeEqual } from "node:crypto";

/** Matches the Standard Webhooks default; protects against replays of captured deliveries. */
export const WEBHOOK_TOLERANCE_SECONDS = 5 * 60;

export class PolarWebhookSignatureError extends Error {}

export type PolarWebhookHeaders = {
  "webhook-id": string;
  "webhook-timestamp": string;
  "webhook-signature": string;
};

/**
 * Polar signs with Standard Webhooks (HMAC-SHA256 over `${id}.${timestamp}.${body}`, base64, sent as
 * space-separated `v1,<sig>` entries). Secrets created before 2026-09-08 use the UTF-8 bytes of the whole
 * `whsec_…` string as the key; newer ones use the base64-decoded remainder. Both are accepted, as the
 * official SDK does.
 */
const candidateKeys = (secret: string): Buffer[] => {
  const keys = [Buffer.from(secret, "utf8")];
  if (secret.startsWith("whsec_")) {
    const decoded = Buffer.from(secret.slice("whsec_".length), "base64");
    if (decoded.length > 0) keys.push(decoded);
  }
  return keys;
};

const sign = (key: Buffer, id: string, timestamp: string, body: Buffer) =>
  createHmac("sha256", key).update(`${id}.${timestamp}.`).update(body).digest();

export function verifyPolarWebhook(params: {
  body: Buffer;
  headers: PolarWebhookHeaders;
  secret: string;
  now?: Date;
}): unknown {
  const { body, headers, secret } = params;
  const id = headers["webhook-id"];
  const timestamp = headers["webhook-timestamp"];
  const signatureHeader = headers["webhook-signature"];
  if (!id || !timestamp || !signatureHeader) throw new PolarWebhookSignatureError("Missing webhook headers");

  const sentAt = Number(timestamp);
  const nowSeconds = Math.floor((params.now ?? new Date()).getTime() / 1000);
  if (!Number.isInteger(sentAt) || Math.abs(nowSeconds - sentAt) > WEBHOOK_TOLERANCE_SECONDS) {
    throw new PolarWebhookSignatureError("Webhook timestamp outside the allowed window");
  }

  const provided = signatureHeader
    .split(" ")
    .map((entry) => entry.split(","))
    .filter(([version, value]) => version === "v1" && !!value)
    .map(([, value]) => Buffer.from(value, "base64"));

  const valid = candidateKeys(secret).some((key) => {
    const expected = sign(key, id, timestamp, body);
    return provided.some(
      (candidate) => candidate.length === expected.length && timingSafeEqual(candidate, expected)
    );
  });
  if (!valid) throw new PolarWebhookSignatureError("Invalid webhook signature");

  try {
    return JSON.parse(body.toString("utf8"));
  } catch {
    throw new PolarWebhookSignatureError("Webhook body is not JSON");
  }
}

/** Test helper: produces headers exactly as Polar would for the given key scheme. */
export function signPolarWebhookForTest(params: {
  body: string;
  secret: string;
  scheme: "legacy" | "standard";
  id?: string;
  timestamp?: number;
}): PolarWebhookHeaders {
  const id = params.id ?? "msg_test";
  const timestamp = String(params.timestamp ?? Math.floor(Date.now() / 1000));
  const key =
    params.scheme === "legacy"
      ? Buffer.from(params.secret, "utf8")
      : Buffer.from(params.secret.slice("whsec_".length), "base64");
  const signature = sign(key, id, timestamp, Buffer.from(params.body)).toString("base64");
  return { "webhook-id": id, "webhook-timestamp": timestamp, "webhook-signature": `v1,${signature}` };
}

/** Dodo Payments signs with the same Standard Webhooks scheme, so it shares this verifier. */
export const verifyStandardWebhook = verifyPolarWebhook;
