const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "drivers",
    default: "",
  },
  image: {
    type: String,
    required: false,
    default: "",
  },
  document: {
    type: String,
    default: "",
  },
  new: {
    type: Boolean,
    default: true,
  },
  verified: {
    type: Boolean,
    default: false,
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

module.exports = mongoose.model("Document", documentSchema);
