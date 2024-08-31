const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  pic: {
    type: String,
    required: false,
    default: "",
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  billing: {
    type: String,
    default: "",
  },
  billingPeriod: {
    type: Number,
    default: 1,
  },
  price: {
    type: Number,
    default: 0.0,
  },
  marketplace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "marketplaces",
    require: [true, "marketplace must be provided"],
  },
  sqPlanReference: {
    type: String,
    required: false,
    default: "",
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      require: [true, "marketplace must be provided"],
    },
  ],
  available: {
    type: Boolean,
    default: true,
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

module.exports = mongoose.model("Plan", planSchema);
