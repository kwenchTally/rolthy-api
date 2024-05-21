const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customers",
    require: [true, "customer must be provided"],
  },
  marketplace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "marketplaces",
    require: [true, "marketplace must be provided"],
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      default: [],
    },
  ],
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
  },
  price: {
    type: Number,
    default: 0.0,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  tax: {
    type: Number,
    default: 0.0,
  },
  discount: {
    type: Number,
    default: 0.0,
  },
  total: {
    type: Number,
    default: 0.0,
  },
  delivery_address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "addresses",
    require: [true, "delivery address must be provided"],
  },
  delivery_option: {
    type: String,
    default: "",
  },
  delivery_type: {
    type: String,
    default: "",
  },
  delivery_charge: {
    type: Number,
    default: 0.0,
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "payments",
    require: [true, "delivery address must be provided"],
  },
  status: {
    type: String,
    enum: {
      values: [
        "Pending",
        "Received",
        "Placed",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Declined",
        "Desputed",
        "Refunded",
      ],
      message: `{VALUE} is not supported`,
    },
    default: "Received",
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

module.exports = mongoose.model("Order", orderSchema);
