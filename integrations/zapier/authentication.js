const { endpoint } = require("./lib");

// Users create the key in Calbee: Apps → Zapier → Generate API key.
module.exports = {
  type: "custom",
  fields: [
    {
      key: "apiKey",
      label: "Calbee API key",
      required: true,
      type: "password",
      helpText: "In Calbee, open Apps → Zapier and click **Generate API key**.",
    },
  ],
  test: async (z, bundle) => {
    const response = await z.request({ url: endpoint("me"), params: { apiKey: bundle.authData.apiKey } });
    response.throwForStatus();
    return response.data;
  },
  connectionLabel: (z, bundle) => bundle.inputData.username || bundle.inputData.email || "Calbee",
};
