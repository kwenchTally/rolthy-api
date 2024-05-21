const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customers",
  },
  marketplace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "marketplaces",
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
  },
  quantity: {
    type: Number,
    default: 1,
  },
  discount: {
    type: Number,
    default: 0.0,
  },
  tax: {
    type: Number,
    default: 0.0,
  },
  removed: {
    type: Boolean,
    default: false,
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

module.exports = mongoose.model("Cart", cartSchema);
