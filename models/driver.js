const mongoose = require("mongoose");
const Location = require("../models/location");

const driverSchema = new mongoose.Schema({
  pic: {
    type: String,
    required: false,
    default: "",
  },
  firstname: {
    type: String,
    required: true,
    minlength: 3,
  },
  lastname: {
    type: String,
    required: true,
    minlength: 3,
  },
  mobile: {
    type: String,
    required: true,
    minlength: 10,
    unique: [true, "mobile number already present"],
  },
  email: {
    type: String,
    required: true,
    unique: [true, "email id already present"],
  },
  password: {
    type: String,
    required: true,
    minlength: [5, "minimum 5 character required"],
  },
  location: { type: Location.schema },
  address: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "addresses",
    },
  ],
  documents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "documents",
    },
  ],
  verified: {
    type: String,
    enum: {
      values: ["None", "Approved", "In-Progress", "Rejected"],
      message: `{VALUE} is not supported`,
    },
    default: "None",
  },
  token: {
    type: String,
    required: false,
    default: "",
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

driverSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Driver", driverSchema);
