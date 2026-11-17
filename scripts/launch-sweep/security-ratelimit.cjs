const L = require("./lib.cjs");
(async () => { const T = await L.start(); const a = await T.login("free@example.com", "free"); const codes = {};
  for (let i = 0; i < 14; i++) { const r = await a.request.post(`${L.APP}/api/trpc/requestInsights/sendReply?batch=1`, { data: { 0: { json: { bookingUid: "nope-" + i, message: "hello there" } } } }); codes[r.status()] = (codes[r.status()] || 0) + 1; }
  console.log("sendReply x14:", codes); L.check("'Send reply' is cut off after 10 a minute", codes[429] >= 1 && !codes[500]); await T.browser.close(); process.exit(0); })();
