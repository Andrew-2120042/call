# Nodslot for Make

Make apps are built in Make's web editor (or its VS Code extension), not pushed from a CLI. These files are the
exact contents to paste into each tab. The server side already exists: `/api/integrations/make/*` in the main app.

1. make.com → sign in → left menu **Custom apps** (or *Development*) → **Create a new app**.
   Name `nodslot`, label `Nodslot`, upload `../../packages/app-store/make/static/icon.svg` as a PNG, theme `#111111`.
2. **Base** tab → paste `base.json`. Replace `app.nodslot.site` with the real app domain.
3. **Connections** → Create connection `Nodslot API key` (type *Basic*):
   - Communication → `connection.communication.json` (replace the domain here too)
   - Parameters → `connection.parameters.json`
4. **Webhooks** → Create webhook `Booking events` (type *Dedicated*, connection = the one above):
   - Communication: Attach → `webhook.attach.json`, Detach → `webhook.detach.json`
   - Parameters → `webhook.parameters.json`
5. **Modules** → Create module `Watch bookings` (type *Instant trigger*, webhook = Booking events):
   - Communication → `module.watchBookings.communication.json`
   - Interface → `module.watchBookings.interface.json`
6. Test with a key from Nodslot (Apps → Make → Generate API key) and a real booking.
7. **Invite** (top right) → copy the invite link → set `MAKE_INVITE_LINK` in the app's env and run `seed-app-store`.
   Publishing to Make's public directory is a separate review you can request later; the invite link works now.
