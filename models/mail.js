const mongoose = require("mongoose");

const mailSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "firstname must be provided"],
  },
  lastname: {
    type: String,
    required: [true, "lastname must be provided"],
  },
  description: {
    type: String,
    required: [true, "description must be provided"],
  },
  mobile: {
    type: String,
    required: [true, "mobile must be provided"],
  },
  email: {
    type: String,
    required: [true, "email must be provided"],
  },
  status: {
    type: String,
    enum: {
      values: ["Pending", "Received", "Delivered", "Viewed"],
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

module.exports = mongoose.model("Mail", mailSchema);
