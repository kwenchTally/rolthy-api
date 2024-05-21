const mongoose = require("mongoose");

const connectDB = (uri) => {
  console.log("connecting db...");
  return mongoose.connect(uri, {});
};

module.exports = connectDB;
