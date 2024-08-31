const mongoose = require("mongoose");

const advertisementSchema = new mongoose.Schema({
  pic: {
    type: String,
    default: "",
  },
  marketplace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "marketplaces",
    default: null,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    default: null,
  },
  viewedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customers",
      default: null,
    },
  ],
  reference: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    default: 0.0,
  },
  title: {
    type: String,
    default: "",
  },
  body: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  tag: {
    type: String,
    default: "none",
  },
  category: {
    type: String,
    enum: {
      values: ["none", "offer", "promotion", "sponsered", "advertise"],
      message: `{VALUE} is not supported`,
    },
    default: "none",
  },
  show: {
    type: Boolean,
    default: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  endAt: {
    type: Date,
    default: Date.now(),
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Advertisement", advertisementSchema);
