// Dev helper: sends a correctly signed Polar subscription webhook to the local app, e.g. to put the
// local test user (id 4) on Pro:  node scripts/dev/send-polar-webhook.mts subscription.active active <ISO time>

import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import process from "node:process";

const env = readFileSync("/Users/andrewwilson/my projects/cal-fork/.env", "utf8");
const secret = env.match(/^POLAR_WEBHOOK_SECRET="?([^"\n]+)"?$/m)![1];
const [type, status, modified, mode] = process.argv.slice(2);
const body = JSON.stringify({
  type,
  timestamp: modified,
  data: {
    id: "sub_live_1",
    status,
    product_id: "prod_pro_test",
    customer_id: "cus_1",
    current_period_end: "2026-12-13T12:00:00.000Z",
    cancel_at_period_end: false,
    modified_at: modified,
    created_at: "2026-11-13T09:00:00.000Z",
    customer: { external_id: "4" },
  },
});
const id = "msg_" + modified;
const ts = String(Math.floor(Date.now() / 1000));
const key = Buffer.from(secret.slice(6), "base64");
let sig = createHmac("sha256", key).update(`${id}.${ts}.${body}`).digest("base64");
if (mode === "bad") sig = sig.replace(/^./, sig[0] === "A" ? "B" : "A");
const res = await fetch("http://localhost:3000/api/billing/polar/webhook", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "webhook-id": id,
    "webhook-timestamp": ts,
    "webhook-signature": `v1,${sig}`,
  },
  body,
});
console.log(type, status, mode ?? "", "->", res.status, await res.text());
