const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
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
  category: {
    type: String,
    default: "",
  },
  subcategory: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    default: 0.0,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  company: {
    type: String,
    default: "",
  },
  marketplace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "marketplaces",
    require: [true, "marketplace must be provided"],
  },
  available: {
    type: Boolean,
    default: true,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0.0,
  },
  discount: {
    type: Number,
    default: 0.0,
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Product", productSchema);
