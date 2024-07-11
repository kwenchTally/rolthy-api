const { getErrorFromCatch } = require("../helper/functions");
const Delivery = require("../models/delivery");

const addDelivery = async (req, res) => {
  try {
    cObj = new Delivery(req.body);
    let result = await cObj.save();
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const updateDelivery = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Delivery.findByIdAndUpdate(_id, req.body, {
      new: true,
    });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const deleteDelivery = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Delivery.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getDelivery = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Delivery.findById(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getAllDelivery = async (req, res) => {
  try {
    const { sort, select } = req.query;
    const {
      customer,
      marketplace,
      driver,
      delivery_id,
      order_id,
      start,
      end,
      origin,
      destination,
      distance,
      duration,
      start_time,
      reach_time,
      time_taken,
      suggested_route,
      delivery_route,
      status,
      active,
      deleted,
      createAt,
    } = req.body;
    const queryObject = {};

    if (customer) {
      queryObject.customer = customer;
    }

    if (marketplace) {
      queryObject.marketplace = marketplace;
    }

    if (driver) {
      queryObject.driver = driver;
    }

    if (delivery_id) {
      queryObject.delivery_id = { $regex: delivery_id, $options: "i" };
    }

    if (order_id) {
      queryObject.order_id = { $regex: order_id, $options: "i" };
    }

    if (start) {
      queryObject.start = { $regex: start, $options: "i" };
    }

    if (end) {
      queryObject.end = { $regex: end, $options: "i" };
    }

    if (origin) {
      queryObject.origin = { $regex: origin, $options: "i" };
    }

    if (destination) {
      queryObject.destination = { $regex: destination, $options: "i" };
    }

    if (distance) {
      queryObject.distance = { $regex: distance, $options: "i" };
    }

    if (duration) {
      queryObject.duration = { $regex: duration, $options: "i" };
    }

    if (start_time) {
      queryObject.start_time = { $regex: start_time, $options: "i" };
    }

    if (reach_time) {
      queryObject.reach_time = { $regex: reach_time, $options: "i" };
    }

    if (time_taken) {
      queryObject.time_taken = { $regex: time_taken, $options: "i" };
    }

    if (suggested_route) {
      queryObject.suggested_route = { $regex: suggested_route, $options: "i" };
    }

    if (delivery_route) {
      queryObject.delivery_route = { $regex: delivery_route, $options: "i" };
    }

    if (status) {
      queryObject.status = status;
    }

    if (active) {
      queryObject.active = active;
    }

    if (deleted) {
      queryObject.deleted = deleted;
    }

    if (createAt) {
      queryObject.createAt = { $regex: createAt, $options: "i" };
    }

    let apiData = Delivery.find(queryObject);

    if (sort) {
      let sortFix = sort.replace(",", " ");
      console.log(`sort ${sortFix}`);
      apiData = apiData.sort(sortFix);
    }

    if (select) {
      let selectFix = select.split(",").join(" ");
      console.log(`select ${selectFix}`);
      apiData = apiData.select(selectFix);
    }

    let filter = {};
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 25;
    let skip = (page - 1) * limit;

    apiData = apiData.skip(skip).limit(limit);

    const data = await apiData;
    res.status(200).json({ count: data.length, data });
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

module.exports = {
  getAllDelivery,
  getDelivery,
  addDelivery,
  updateDelivery,
  deleteDelivery,
};
