// Dev helper: a tiny fake of Calendly's v2 API for testing the importer without a Calendly account.
// Run: node scripts/dev/fake-calendly.mjs  (port 4010), then set CALENDLY_API_BASE_URL=http://127.0.0.1:4010
import http from "node:http";
import process from "node:process";

const TOKEN = "fake-calendly-token-for-local-testing-only";
const base = "http://127.0.0.1:4010";
const me = { uri: `${base}/users/U1`, name: "Jamie Rivera", email: "jamie@example.com", timezone: "America/New_York" };
const eventTypes = [
  { uri: `${base}/event_types/E1`, name: "Discovery Call", slug: "discovery-call", duration: 20, active: true, description_plain: "A quick intro." },
  { uri: `${base}/event_types/E2`, name: "Strategy Session", slug: "30min", duration: 90, active: true },
  { uri: `${base}/event_types/E3`, name: "Old Workshop", slug: "old-workshop", duration: 120, active: false },
];
const schedules = [
  {
    uri: `${base}/user_availability_schedules/S1`,
    name: "Working hours",
    default: true,
    timezone: "America/New_York",
    rules: [
      { type: "wday", wday: "monday", intervals: [{ from: "09:00", to: "12:00" }, { from: "13:00", to: "17:00" }] },
      { type: "wday", wday: "wednesday", intervals: [{ from: "10:00", to: "16:00" }] },
      { type: "wday", wday: "friday", intervals: [{ from: "09:00", to: "13:00" }] },
      { type: "date", date: "2026-12-25", intervals: [] },
    ],
  },
];

http
  .createServer((req, res) => {
    const send = (status, body) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(body));
    };
    if (req.headers.authorization !== `Bearer ${TOKEN}`) return send(401, { title: "Unauthenticated" });
    const url = new URL(req.url, base);
    if (url.pathname === "/users/me") return send(200, { resource: me });
    if (url.pathname === "/event_types") {
      // Two pages, to exercise pagination.
      const page = url.searchParams.get("page") === "2";
      return send(200, {
        collection: page ? eventTypes.slice(2) : eventTypes.slice(0, 2),
        pagination: { next_page: page ? null : `${base}/event_types?user=${encodeURIComponent(me.uri)}&page=2` },
      });
    }
    if (url.pathname === "/user_availability_schedules") return send(200, { collection: schedules });
    return send(404, { title: "Not found" });
  })
  .listen(4010, "127.0.0.1", () => process.stdout.write("fake calendly on 4010\n"));
