const { getErrorFromCatch } = require("../helper/functions");
const Notification = require("../models/notification");

const addNotification = async (req, res) => {
  try {
    cObj = new Notification(req.body);
    const result = await cObj.save();
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getNotification = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Notification.findById(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const updateNotification = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Notification.findByIdAndUpdate(_id, req.body, {
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

const deleteNotification = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Notification.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getAllNotification = async (req, res) => {
  try {
    const { sort, select } = req.query;
    const {
      customer,
      marketplace,
      driver,
      title,
      body,
      dataTitle,
      dataBody,
      status,
      deleted,
      date,
    } = req.body;
    const queryObject = {};

    if (customer) {
      queryObject.customer = { $eq: customer };
    }

    if (marketplace) {
      queryObject.marketplace = { $regex: marketplace, $options: "i" };
    }

    if (driver) {
      queryObject.driver = { $regex: driver, $options: "i" };
    }

    if (title) {
      queryObject.title = { $regex: title, $options: "i" };
    }

    if (body) {
      queryObject.body = { $regex: body, $options: "i" };
    }

    if (dataTitle) {
      queryObject.dataTitle = { $regex: dataTitle, $options: "i" };
    }

    if (dataBody) {
      queryObject.dataBody = { $regex: dataBody, $options: "i" };
    }

    if (status) {
      queryObject.status = { $regex: status, $options: "i" };
    }

    if (deleted) {
      queryObject.deleted = deleted;
    }

    if (date) {
      queryObject.createAt = { $regex: date, $options: "i" };
    }

    let apiData = Notification.find(queryObject);

    if (sort) {
      let sortFix = sort.replace(",", " ");
      console.log(`sort ${sortFix}`);
      apiData = apiData.sort(sortFix);
    }

    if (select) {
      let selectFix = select.split(",").join(" ");
      console.log(`select ${selectFix}`);
      apiData = apiData.select(selectFix);

      if (selectFix.includes("customer")) {
        apiData.populate({
          path: "customer",
          model: "Customer",
          match: {},
          populate: { path: "address", model: "Address" },
        });
      }
      if (selectFix.includes("marketplace")) {
        apiData.populate({
          path: "marketplace",
          model: "MarketPlace",
          populate: [
            { path: "address", model: "Address" },
            { path: "items", model: "Product" },
          ],
        });
      }
      if (selectFix.includes("driver")) {
        apiData.populate({
          path: "driver",
          model: "Driver",
          populate: [
            { path: "address", model: "Address" },
            { path: "documents", model: "Document" },
          ],
        });
      }
    }

    apiData.populate([
      {
        path: "customer",
        model: "Customer",
        match: {},
        populate: { path: "address", model: "Address" },
      },
      {
        path: "marketplace",
        model: "MarketPlace",
        populate: [
          { path: "address", model: "Address" },
          { path: "items", model: "Product" },
        ],
      },
      {
        path: "driver",
        model: "Driver",
        populate: [
          { path: "address", model: "Address" },
          { path: "documents", model: "Document" },
        ],
      },
    ]);

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
  getAllNotification,
  getNotification,
  addNotification,
  updateNotification,
  deleteNotification,
};
