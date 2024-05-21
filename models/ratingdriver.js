const mongoose = require("mongoose");

const ratingDriverSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "drivers",
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customers",
  },
  rating: {
    type: Number,
    default: 1,
  },
  review: {
    type: String,
    default: 0.0,
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

module.exports = mongoose.model("RatingDriver", ratingDriverSchema);
