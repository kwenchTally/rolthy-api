const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customers",
    require: [true, "customer must be provided"],
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    require: [true, "product must be provided"],
  },
  favourite: {
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
  createAt: {
    type: Date,
    default: Date.now(),
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

module.exports = mongoose.model("Favourite", favouriteSchema);
