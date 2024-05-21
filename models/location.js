const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point", "Polygon"],
    default: "Point",
  },
  coordinates: {
    type: [Number],
  },
});

module.exports = mongoose.model("Location", locationSchema);
