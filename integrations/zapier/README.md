# Calbee on Zapier

Calbee's public app on Zapier. Booking triggers use REST hooks against `/api/integrations/zapier/*` in the
Calbee app, authenticated with a Calbee API key (created on Apps → Zapier in Calbee).

- `npm install` then `npx zapier-platform-cli validate` to check the definition.
- Deploy: `ZAPIER_DEPLOY_KEY=… npx zapier-platform-cli push` (deploy key from developer.zapier.com → Settings → Deploy keys).
- When the app's domain changes, set `CALBEE_APP_URL` in the integration's environment (`zapier env:set`) and push a new version.
