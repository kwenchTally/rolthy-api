const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customers",
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "drivers",
  },
  marketplace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "marketplaces",
  },
  title: {
    type: String,
    required: [true, "title must be provided"],
  },
  body: {
    type: String,
    required: [true, "body must be provided"],
  },
  dataTitle: {
    type: String,
    default: "",
  },
  dataBody: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: {
      values: ["Pending", "Received", "Delivered", "Viewed"],
      message: `{VALUE} is not supported`,
    },
    default: "Received",
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
