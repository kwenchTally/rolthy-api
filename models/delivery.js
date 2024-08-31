const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  customer: {
    type: Map,
    default: {
      id: "",
      name: "",
      mobile: "",
      email: "",
      address: "",
    },
  },
  marketplace: {
    type: Map,
    default: {
      id: "",
      name: "",
      mobile: "",
      email: "",
      address: "",
    },
  },
  driver: {
    type: Map,
    default: {
      id: "",
      name: "",
      mobile: "",
      email: "",
      address: "",
    },
  },
  delivery_id: {
    type: String,
    default: "",
  },
  order: {
    type: Map,
    default: {
      id: "",
      mode: "",
      option: "",
      charge: 0.0,
    },
  },
  item: {
    type: Map,
    default: {
      id: "",
      name: "",
      category: "",
      company: "",
    },
  },
  subscription: {
    type: Map,
    default: null,
  },
  keyword: {
    type: String,
    default: "",
  },
  requests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "drivers",
      default: [],
    },
  ],
  assigned: {
    type: String,
    default: "",
  },
  suggested_route: {
    type: String,
    default: "",
  },
  delivery_route: {
    type: String,
    default: "",
  },
  start: {
    type: String,
    default: "",
  },
  end: {
    type: String,
    default: "",
  },
  distance: {
    type: String,
    default: "",
  },
  duration: {
    type: String,
    default: "",
  },
  start_time: {
    type: String,
    default: "",
  },
  reach_time: {
    type: String,
    default: "",
  },
  time_taken: {
    type: String,
    default: "",
  },
  origin: [
    {
      type: Number,
      default: 0.0,
    },
  ],
  destination: [
    {
      type: Number,
      default: 0.0,
    },
  ],
  status: {
    type: String,
    enum: {
      values: ["Processing", "Started", "Finished"],
      message: `{VALUE} is not supported`,
    },
    default: "Processing",
  },
  //10min from gmap
  //before 10min, 10min, after 10min, after 20min
  //Early, On Time, Late, Extremely Late
  delivered: {
    type: String,
    enum: {
      values: ["Early", "On Time", "Late", "Extremely Late"],
      message: `{VALUE} is not supported`,
    },
    default: "On Time",
  },
  accepted: {
    type: Boolean,
    default: true,
  },
  completed: {
    type: Boolean,
    default: true,
  },
  violation: {
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

module.exports = mongoose.model("Delivery", deliverySchema);
