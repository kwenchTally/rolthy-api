const mongoose = require("mongoose");

const advertisementSchema = new mongoose.Schema({
  pic: {
    type: String,
    default: "",
  },
  marketplace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "marketplaces",
    require: [true, "marketplace must be provided"],
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    require: [true, "product must be provided"],
  },
  reference: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    default: 0.0,
  },
  description: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    enum: {
      values: ["None", "Offer", "Promotion", "Sponsered", "Advertise"],
      message: `{VALUE} is not supported`,
    },
    default: "None",
  },
  show: {
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
