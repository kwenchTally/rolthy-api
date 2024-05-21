const mongoose = require("mongoose");

const paymentmethodSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customers",
  },
  marketplace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "marketplaces",
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "drivers",
  },
  upi: {
    type: String,
    default: "",
  },
  card_method: {
    type: String,
    default: "",
  },
  card_option: {
    type: String,
    default: "",
  },
  card_expiry: {
    type: String,
    default: "",
  },
  card_no: {
    type: String,
    default: "",
  },
  card_code: {
    type: String,
    default: "",
  },
  card_name: {
    type: String,
    default: "",
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

module.exports = mongoose.model("PaymentMethod", paymentmethodSchema);
