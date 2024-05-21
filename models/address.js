const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "",
  },
  street: {
    type: String,
    default: "",
  },
  appartment: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  state: {
    type: String,
    default: "",
  },
  zipcode: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
  country_code: {
    type: String,
    default: "",
  },
  location: {
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

module.exports = mongoose.model("Address", addressSchema);
