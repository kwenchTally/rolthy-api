const mongoose = require("mongoose");
const Location = require("../models/location");

const marketplaceSchema = new mongoose.Schema({
  pic: {
    type: String,
    required: false,
    default: "",
  },
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  mobile: {
    type: String,
    required: true,
    minlength: 10,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: [true, "email id already present"],
  },
  description: {
    type: String,
    default: "",
  },
  delivery_slot: {
    type: String,
    enum: {
      values: ["Morning", "Afternoon", "Evening", "All", "None"],
      message: `{VALUE} is not supported`,
    },
    default: "None",
  },
  slot_time: {
    type: String,
    default: "",
  },
  opening: {
    type: String,
    default: "",
  },
  closing: {
    type: String,
    default: "",
  },
  location: { type: Location.schema },
  address: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "addresses",
    },
  ],
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
    },
  ],
  rating: {
    type: Number,
    default: 0.0,
  },
  token: {
    type: String,
    required: false,
    default: "",
  },
  available: {
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

marketplaceSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("MarketPlace", marketplaceSchema);
