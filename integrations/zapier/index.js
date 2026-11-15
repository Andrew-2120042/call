const authentication = require("./authentication");
const booking = require("./triggers/booking");

module.exports = {
  version: require("./package.json").version,
  platformVersion: require("zapier-platform-core").version,
  authentication,
  triggers: {
    [booking.created.key]: booking.created,
    [booking.requested.key]: booking.requested,
    [booking.rescheduled.key]: booking.rescheduled,
    [booking.cancelled.key]: booking.cancelled,
  },
};
