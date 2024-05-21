const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  mobile: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    default: "",
  },
  otp: {
    type: String,
    default: "",
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("OTP", otpSchema);
