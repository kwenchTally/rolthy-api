const mongoose = require("mongoose");
const Location = require("../models/location");

const customerSchema = new mongoose.Schema({
  pic: {
    type: String,
    required: false,
    default: "",
  },
  firstname: {
    type: String,
    required: true,
    minlength: 3,
  },
  lastname: {
    type: String,
    required: true,
    minlength: 3,
  },
  mobile: {
    type: String,
    required: true,
    minlength: 10,
    unique: [true, "mobile number already present"],
  },
  email: {
    type: String,
    required: true,
    unique: [true, "email id already present"],
  },
  password: {
    type: String,
    required: true,
    minlength: [5, "minimum 5 character required"],
  },
  location: { type: Location.schema },
  address: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "addresses",
    },
  ],
  delivery_option: {
    type: String,
    default: "",
  },
  delivery_type: {
    type: String,
    default: "",
  },
  token: {
    type: String,
    required: false,
    default: "",
  },
  preference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "preferences",
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

customerSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Customer", customerSchema);
