// The Nodslot app URL, e.g. https://app.nodslot.com. Set once with: npx zapier env:set 1.0.0 BASE_URL=https://app.<domain>
const baseUrl = () => (process.env.BASE_URL || "https://app.nodslot.site").replace(/\/$/, "");

const endpoint = (name) => `${baseUrl()}/api/integrations/zapier/${name}`;

module.exports = { baseUrl, endpoint };
