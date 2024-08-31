const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  pic: {
    type: String,
    required: false,
    default: "",
  },
  driver: {
    type: Map,
    default: {
      id: "",
      name: "",
      mobile: "",
      address: "",
    },
  },
  vehicle: {
    type: Map,
    default: {
      manufacturer: "",
      model: "",
      year: "",
      capacity: "",
    },
  },
  documents: {
    type: Map,
    default: {
      vehicleNumber: "",
      ownership: "",
      driverLicence: "",
      billOfSale: "",
      //VIN - Vehicle Identification Number
      chassisNumber: "",
      // Emissions/Smog Certificate
      smogCertificate: "",
      insurance: "",
    },
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

module.exports = mongoose.model("Vehicle", vehicleSchema);
