// End-to-end check against a running Calbee app: node test.js <apiKey>  (CALBEE_APP_URL defaults to production)
const zapier = require("zapier-platform-core");
const App = require("./index");
const appTester = zapier.createAppTester(App);

(async () => {
  const authData = { apiKey: process.argv[2] };
  const me = await appTester(App.authentication.test, { authData });
  console.log("auth test ok, connected as:", me.username);
  const trigger = App.triggers.booking_created.operation;
  const sub = await appTester(trigger.performSubscribe, { authData, targetUrl: "https://hooks.zapier.com/hooks/standard/test/calbee" });
  console.log("subscribed, webhook id:", sub.id);
  const list = await appTester(trigger.performList, { authData });
  console.log("sample bookings returned:", list.length, list[0] ? Object.keys(list[0]).slice(0, 6).join(",") : "");
  await appTester(trigger.performUnsubscribe, { authData, subscribeData: sub });
  console.log("unsubscribed");
})().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
