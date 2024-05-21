const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customers",
  },
  marketplace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "marketplaces",
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
    },
  ],
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "payments",
  },
  delivery: {
    type: String,
    enum: {
      values: [
        "Daily",
        "Weekly",
        "Monthly",
        "Quarterly",
        "Half-Yearly",
        "Yearly",
      ],
      message: `{VALUE} is not supported`,
    },
    default: "Daily",
  },
  startOn: {
    type: Date,
    default: Date.now(),
  },
  endAt: {
    type: Date,
    default: Date.now(),
  },
  active: {
    type: Boolean,
    default: true,
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

module.exports = mongoose.model("Subscription", subscriptionSchema);
