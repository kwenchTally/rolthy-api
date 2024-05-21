const { getErrorFromCatch } = require("../helper/functions");
const Order = require("../models/order");

const addOrder = async (req, res) => {
  try {
    cObj = new Order(req.body);
    const result = await cObj.save();
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const updateOrder = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Order.findByIdAndUpdate(_id, req.body, { new: true });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const deleteOrder = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Order.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getOrder = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Order.findById(_id)
      .populate({ path: "delivery_address", model: "Address" })
      .populate({ path: "customer", model: "Customer" })
      .populate({ path: "marketplace", model: "MarketPlace" })
      .populate({ path: "product", model: "Product" });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getAllOrder = async (req, res) => {
  try {
    const { filter, sort, select } = req.query;
    const {
      customer,
      marketplace,
      products,
      item,
      discount,
      price,
      payment,
      delivery_address,
      delivery_option,
      delivery_type,
      delivery_charge,
      quantity,
      tax,
      total,
      status,
      deleted,
      date,
    } = req.body;
    const queryObject = {};
    const customerObject = {};
    if (customer) {
      queryObject.customer = { $eq: customer };
    }

    if (marketplace) {
      queryObject.marketplace = { $eq: marketplace };
    }

    if (products) {
    }

    if (item) {
      queryObject.item = { $eq: item };
    }

    if (payment) {
      queryObject.payment = { $eq: payment };
    }

    if (delivery_address) {
      queryObject.delivery_address = { $eq: delivery_address };
    }

    if (delivery_option) {
      queryObject.delivery_option = { $eq: delivery_option };
    }

    if (delivery_type) {
      queryObject.delivery_type = { $eq: delivery_type };
    }

    if (delivery_charge) {
      queryObject.delivery_charge = { $eq: delivery_charge };
    }

    if (filter) {
    }

    if (price) {
      queryObject.price = { $eq: price };
    }

    if (quantity) {
      queryObject.quantity = { $eq: quantity };
    }

    if (tax) {
      queryObject.tax = { $eq: tax };
    }

    if (discount) {
      queryObject.discount = { $eq: discount };
    }

    if (total) {
      queryObject.total = { $eq: total };
    }

    if (status) {
      queryObject.status = { $eq: status };
    }

    if (deleted) {
      queryObject.deleted = deleted;
    }

    if (date) {
      queryObject.createAt = { $regex: date, $options: "i" };
    }

    let apiData = Order.find(queryObject);

    if (sort) {
      let sortFix = sort.replace(",", " ");
      console.log(`sort ${sortFix}`);
      apiData = apiData.sort(sortFix);
    }

    if (select) {
      let selectFix = select.split(",").join(" ");
      console.log(`select ${selectFix}`);
      apiData = apiData.select(selectFix);
      if (selectFix.includes("delivery_address")) {
        apiData = apiData.populate({
          path: "delivery_address",
          model: "Address",
        });
      }
      if (selectFix.includes("products")) {
        apiData = apiData.populate({
          path: "products",
          model: "Product",
          populate: {
            path: "marketplace",
            model: "MarketPlace",
            populate: [{ path: "address", model: "Address" }],
          },
        });
      }
      if (selectFix.includes("customer")) {
        let filter = {};
        apiData = apiData.populate({
          path: "customer",
          model: "Customer",
          match: filter,
          populate: { path: "address", model: "Address" },
        });
      }
      if (selectFix.includes("marketplace")) {
      }
      if (selectFix.includes("payment")) {
        apiData = apiData.populate({ path: "payment", model: "Payment" });
      }
    }

    apiData.populate([
      {
        path: "customer",
        model: "Customer",
        match: filter,
        populate: { path: "address", model: "Address" },
      },
      {
        path: "marketplace",
        model: "MarketPlace",
        populate: [{ path: "address", model: "Address" }],
      },
      { path: "delivery_address", model: "Address" },
      { path: "payment", model: "Payment" },
      {
        path: "products",
        model: "Product",
        populate: {
          path: "marketplace",
          model: "MarketPlace",
          populate: [{ path: "address", model: "Address" }],
        },
      },
      { path: "item", model: "Product" },
    ]);

    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 25;
    let skip = (page - 1) * limit;

    apiData = apiData.skip(skip).limit(limit).sort({ createAt: 1 });

    const data = await apiData;
    res.status(200).json({ count: data.length, data });
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

module.exports = {
  getAllOrder,
  getOrder,
  addOrder,
  updateOrder,
  deleteOrder,
};
