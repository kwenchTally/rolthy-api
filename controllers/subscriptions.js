const { getErrorFromCatch } = require("../helper/functions");
const Subscription = require("../models/subscription");

const addSubscription = async (req, res) => {
  try {
    cObj = new Subscription(req.body);
    let result = await cObj.save();
    result = await result.populate([
      {
        path: "customer",
        model: "Customer",
      },
      {
        path: "marketplace",
        model: "MarketPlace",
        populate: [
          { path: "address", model: "Address" },
          { path: "items", model: "Product" },
        ],
      },
      { path: "items", model: "Product" },
      { path: "payment", model: "Payment" },
    ]);
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const updateSubscription = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Subscription.findByIdAndUpdate(_id, req.body, {
      new: true,
    }).populate([
      {
        path: "customer",
        model: "Customer",
      },
      {
        path: "marketplace",
        model: "MarketPlace",
        populate: [
          { path: "address", model: "Address" },
          { path: "items", model: "Product" },
        ],
      },
      { path: "items", model: "Product" },
      { path: "payment", model: "Payment" },
    ]);

    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const deleteSubscription = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Subscription.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getSubscription = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Subscription.findById(_id)
      .populate({ path: "customer", model: "Customer" })
      .populate({ path: "marketplace", model: "MarketPlace" })
      .populate({ path: "items", model: "Product" })
      .populate({ path: "payment", model: "Payment" });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getAllSubscription = async (req, res) => {
  try {
    const { sort, select } = req.query;
    const {
      id,
      customer,
      marketplace,
      driver,
      items,
      payment,
      totalprice,
      starton,
      endat,
      active,
      deleted,
    } = req.body;
    const queryObject = {};

    if (id) {
      queryObject._id = { $eq: id };
    }

    if (customer) {
      queryObject.customer = { $eq: customer };
    }

    if (marketplace) {
      queryObject.marketplace = { $regex: marketplace, $options: "i" };
    }

    if (driver) {
      queryObject.driver = { $regex: driver, $options: "i" };
    }

    if (payment) {
      queryObject.payment = { $regex: payment, $options: "i" };
    }

    if (totalprice) {
      queryObject.totalprice = { $regex: totalprice, $options: "i" };
    }

    if (starton) {
      queryObject.starton = { $regex: starton, $options: "i" };
    }

    if (endat) {
      queryObject.endat = { $regex: endat, $options: "i" };
    }

    if (items) {
    }

    if (active) {
      queryObject.active = active;
    }

    if (deleted) {
      queryObject.deleted = deleted;
    }

    let apiData = Subscription.find(queryObject);

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
        let filter = {};

        apiData = apiData.populate({
          path: "customer",
          model: "Customer",
          match: filter,
        });
      }
      if (selectFix.includes("marketplace")) {
        apiData.populate({
          path: "marketplace",
          model: "MarketPlace",
          populate: [{ path: "address", model: "Address" }],
        });
      }
      if (selectFix.includes("driver")) {
        apiData.populate({ path: "driver", model: "Driver", populate: [] });
      }

      if (selectFix.includes("payment")) {
        apiData.populate({ path: "payment", model: "Payment", populate: [] });
      }

      if (selectFix.includes("items")) {
        apiData.populate({ path: "items", model: "Product", populate: [] });
      }
    }

    let filter = {};

    apiData.populate([
      {
        path: "customer",
        model: "Customer",
        match: filter,
      },
      {
        path: "marketplace",
        model: "MarketPlace",
        populate: [{ path: "address", model: "Address" }],
      },
      { path: "items", model: "Product" },
      { path: "payment", model: "Payment" },
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
  getAllSubscription,
  getSubscription,
  addSubscription,
  updateSubscription,
  deleteSubscription,
};
