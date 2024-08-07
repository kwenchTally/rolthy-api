const mongoose = require("mongoose");

const preferenceSchema = new mongoose.Schema({
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
  age: {
    type: Number,
  },
  gender: {
    type: String,
  },
  slot: {
    type: String,
  },
  questions: {
    type: Array,
    default: [],
  },
  favPlaces: {
    type: Array,
    default: [],
  },
  favProducts: {
    type: Array,
    default: [],
  },
  deliveryOn: {
    type: Array,
    default: [],
  },
  preferedDelivery: {
    type: Map,
    default: {},
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

module.exports = mongoose.model("Preference", preferenceSchema);
