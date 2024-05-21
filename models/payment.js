const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  reference: {
    type: String,
    default: "",
  },
  method: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "paymentmethods",
    require: [true, "user id must be provided"],
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customers",
    require: [true, "user id must be provided"],
  },
  amount: {
    type: Number,
    default: 0.0,
  },
  fee: {
    type: Number,
    default: 0.0,
  },
  status: {
    type: String,
    enum: {
      values: ["Pending", "Received", "Cancelled", "Declined", "Refunded"],
      message: `{VALUE} is not supported`,
    },
    default: "Pending",
  },
  keyword: {
    type: String,
    enum: {
      values: ["Order", "Reorder", "Subscription", "None"],
      message: `{VALUE} is not supported`,
    },
    default: "None",
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orders",
    },
  ],
  deleted: {
    type: Boolean,
    default: false,
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
