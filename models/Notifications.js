const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    data: { type: Object, required: true },
    read: { type: Array },
    delete: { type: Array },
    reciever: { type: Array },
    toAdmin: { type: Boolean },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notifications", NotificationSchema);
