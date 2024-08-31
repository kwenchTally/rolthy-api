const { getErrorFromCatch } = require("../helper/functions");
const Order = require("../models/order");
const mongoose = require("mongoose");

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
    const { filter, sort, select, count, isTotal, isCustomerCount } = req.query;
    const {
      customer,
      marketplace,
      products,
      item,
      discount,
      price,
      payment,
      delivery_address,
      delivery_slot,
      delivery_option,
      delivery_type,
      delivery_charge,
      quantity,
      tax,
      total,
      status,
      deleted,
      date,
      createAt,
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
      queryObject.delivery_address = delivery_address;
    }

    if (delivery_slot) {
      queryObject.delivery_slot = { $regex: delivery_slot, $options: "i" };
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

    if (createAt) {
      const date = new Date(createAt);
      const date1 = new Date(createAt).setDate(date.getDate() + 1);
      console.log(`${date}\n${date1}`);
      queryObject.createAt = {
        $gte: date,
        $lte: date1,
      };
    }

    let apiData = Order.find(queryObject);

    if (sort) {
      let sortFix = sort.replace(",", " ");
      console.log(`sort ${sortFix}`);
      apiData = apiData.sort(sortFix);
      // {createAt:-1}
      // apiData = apiData.sort("createAt");
      // apiData = apiData.sort({ sortFix: -1 });
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

    if (isCustomerCount) {
      const cutoffDate = new Date(
        new Date().setDate(new Date().getDate() - 30)
      );

      const customerCounts = await Order.aggregate([
        { $match: queryObject },
        { $group: { _id: "$customer", firstOrderDate: { $min: "$createAt" } } },
        {
          $project: {
            isNewCustomer: { $gte: ["$firstOrderDate", cutoffDate] },
          },
        },
        { $group: { _id: "$isNewCustomer", count: { $sum: 1 } } },
      ]);

      let newCustomersCount = 0;
      let oldCustomersCount = 0;

      customerCounts.forEach((doc) => {
        if (doc._id) {
          newCustomersCount = doc.count;
        } else {
          oldCustomersCount = doc.count;
        }
      });

      res.status(200).json({
        result: "success",
        data: { newCustomersCount, oldCustomersCount },
      });
    } else if (count) {
      const countQuery = {};
      if (customer) {
        countQuery.customer = { $eq: customer };
      }

      if (marketplace) {
        countQuery.marketplace = { $eq: marketplace };
      }

      if (item) {
        countQuery.item = { $eq: item };
      }

      if (payment) {
        countQuery.payment = { $eq: payment };
      }

      if (delivery_address) {
        countQuery.delivery_address = { $eq: delivery_address };
      }

      if (delivery_slot) {
        countQuery.delivery_slot = delivery_slot;
      }

      if (isTotal) {
        apiData = apiData.estimatedDocumentCount(); //total
      } else {
        apiData = apiData.countDocuments(countQuery);
      }
      const data = await apiData;
      res.status(200).json({ result: "success", data });
    } else {
      // apiData = apiData.skip(skip).limit(limit).sort({ createAt: 1 });
      apiData = apiData.skip(skip).limit(limit).sort({ createAt: -1 });
      const data = await apiData;
      res.status(200).json({ count: data.length, data });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json(getErrorFromCatch(e));
  }
};

async function getOrderSummary(req, res) {
  const {
    marketplace,
    customer,
    item,
    delivery_address,
    date,
    start,
    end,
    timePeriod,
  } = req.body;

  const now = new Date();
  let startDate, endDate;
  let orderBetween = {};

  switch (timePeriod) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;
    case "week":
      const startOfWeek = now.getDate() - now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek);
      endDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek + 7);
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear() + 1, 0, 1);
      break;
    case "date":
      startDate = new Date(`${date}T00:00:00.000Z`);
      endDate = new Date(`${date}T23:59:59.999Z`);
      break;
    case "dateRange":
      startDate = new Date(`${start}T00:00:00.000Z`);
      endDate = new Date(`${end}T23:59:59.999Z`);
      break;
    default:
      throw new Error(
        'Invalid time period specified. Choose from "today", "week", "month", or "year".'
      );
  }

  orderBetween = {
    from: `${startDate.toISOString().split("T")[0]}`,
    to: `${endDate.toISOString().split("T")[0]}`,
  };

  const matchCriteria = {
    deleted: false,
    createAt: {
      $gte: startDate,
      $lt: endDate,
    },
  };

  if (marketplace) {
    matchCriteria.marketplace = { $eq: marketplace };
  }

  if (customer) {
    // matchCriteria.customer = customer;
    matchCriteria.customer = mongoose.Types.ObjectId(customer);
  }

  if (item) {
    // matchCriteria.item = item;
    matchCriteria.item = mongoose.Types.ObjectId(item);
  }

  if (delivery_address) {
    // matchCriteria.delivery_address = delivery_address;
    matchCriteria.delivery_address = mongoose.Types.ObjectId(delivery_address);
  }

  const orders = await Order.aggregate([
    {
      $match: matchCriteria,
    },
    {
      $project: {
        slot: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [
                    { $gte: [{ $hour: "$createAt" }, 8] },
                    { $lt: [{ $hour: "$createAt" }, 10] },
                  ],
                },
                then: "8AM-10AM",
              },
              {
                case: {
                  $and: [
                    { $gte: [{ $hour: "$createAt" }, 10] },
                    { $lt: [{ $hour: "$createAt" }, 12] },
                  ],
                },
                then: "10AM-12PM",
              },
              {
                case: {
                  $and: [
                    { $gte: [{ $hour: "$createAt" }, 12] },
                    { $lt: [{ $hour: "$createAt" }, 14] },
                  ],
                },
                then: "12PM-2PM",
              },
              {
                case: {
                  $and: [
                    { $gte: [{ $hour: "$createAt" }, 14] },
                    { $lt: [{ $hour: "$createAt" }, 16] },
                  ],
                },
                then: "2PM-4PM",
              },
              {
                case: {
                  $and: [
                    { $gte: [{ $hour: "$createAt" }, 16] },
                    { $lt: [{ $hour: "$createAt" }, 18] },
                  ],
                },
                then: "4PM-6PM",
              },
              {
                case: {
                  $and: [
                    { $gte: [{ $hour: "$createAt" }, 18] },
                    { $lt: [{ $hour: "$createAt" }, 20] },
                  ],
                },
                then: "6PM-8PM",
              },
            ],
            default: "Other",
          },
        },
        total: 1,
        totalWithDelivery: { $add: ["$total", "$delivery_charge"] },
        createAt: 1,
        customer: { $toString: "$customer" },
        marketplace: { $toString: "$marketplace" },
      },
    },
    {
      $group: {
        _id: "$_id",
        slot: { $first: "$slot" },
        orderOn: {
          $first: { $dateToString: { format: "%Y-%m-%d", date: "$createAt" } },
        },
        totalWithDelivery: { $first: "$totalWithDelivery" },
        total: { $first: "$total" },
        customer: { $first: "$customer" },
        marketplace: { $first: "$marketplace" },
      },
    },
    {
      $sort: { orderOn: -1 },
    },
  ]);

  const totalOrders = orders.length;
  const totalAmount = orders.reduce(
    (acc, order) => acc + order.totalWithDelivery,
    0
  );
  const totalAmountWithoutDelivery = orders.reduce(
    (acc, order) => acc + order.total,
    0
  );

  const result = {
    customer: customer ? customer : orders[0]?.customer,
    marketplace: marketplace ? marketplace : orders[0]?.marketplace,
    totalOrders,
    amount: totalAmountWithoutDelivery.toFixed(2),
    total: totalAmount.toFixed(2),
    orderBetween,
    orders: orders.map((order) => ({
      order: order._id,
      orderOn: order.orderOn,
      slot: order.slot,
    })),
  };
  res.status(200).json(result);
}

async function getOrderSummary1(req, res) {
  const {
    marketplace,
    customer,
    item,
    delivery_address,
    date,
    start,
    end,
    timePeriod,
  } = req.body;

  const now = new Date();
  let startDate, endDate;
  let orderBetween = {};

  switch (timePeriod) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;
    case "week":
      const startOfWeek = now.getDate() - now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek);
      endDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek + 7);
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear() + 1, 0, 1);
      break;
    case "date":
      startDate = new Date(`${date}T00:00:00.000Z`);
      endDate = new Date(`${date}T23:59:59.999Z`);
      break;
    case "dateRange":
      startDate = new Date(`${start}T00:00:00.000Z`);
      endDate = new Date(`${end}T23:59:59.999Z`);
      break;
    default:
      throw new Error(
        'Invalid time period specified. Choose from "today", "week", "month", or "year".'
      );
  }

  orderBetween = {
    from: `${startDate.toISOString().split("T")[0]}`,
    to: `${endDate.toISOString().split("T")[0]}`,
  };

  const matchCriteria = {
    deleted: false,
    createAt: {
      $gte: startDate,
      $lt: endDate,
    },
  };

  if (marketplace) {
    matchCriteria.marketplace = { $eq: marketplace };
  }

  if (customer) {
    matchCriteria.customer = { $eq: customer };
  }

  if (item) {
    matchCriteria.item = { $eq: item };
  }

  if (delivery_address) {
    matchCriteria.delivery_address = { $eq: delivery_address };
  }

  const orders = await Order.aggregate([
    {
      $match: matchCriteria,
    },
    {
      $project: {
        orderOn: {
          $dateToString: { format: "%Y-%m-%d", date: "$createAt" },
        },
        slot: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [
                    { $gte: [{ $hour: "$createAt" }, 8] },
                    { $lt: [{ $hour: "$createAt" }, 10] },
                  ],
                },
                then: "8AM-10AM",
              },
              {
                case: {
                  $and: [
                    { $gte: [{ $hour: "$createAt" }, 10] },
                    { $lt: [{ $hour: "$createAt" }, 12] },
                  ],
                },
                then: "10AM-12PM",
              },
              {
                case: {
                  $and: [
                    { $gte: [{ $hour: "$createAt" }, 12] },
                    { $lt: [{ $hour: "$createAt" }, 14] },
                  ],
                },
                then: "12PM-2PM",
              },
              {
                case: {
                  $and: [
                    { $gte: [{ $hour: "$createAt" }, 14] },
                    { $lt: [{ $hour: "$createAt" }, 16] },
                  ],
                },
                then: "2PM-4PM",
              },
              {
                case: {
                  $and: [
                    { $gte: [{ $hour: "$createAt" }, 16] },
                    { $lt: [{ $hour: "$createAt" }, 18] },
                  ],
                },
                then: "4PM-6PM",
              },
              {
                case: {
                  $and: [
                    { $gte: [{ $hour: "$createAt" }, 18] },
                    { $lt: [{ $hour: "$createAt" }, 20] },
                  ],
                },
                then: "6PM-8PM",
              },
            ],
            default: "Other",
          },
        },
        totalWithDelivery: { $add: ["$total", "$delivery_charge"] },
        total: 1,
        createAt: 1,
        customer: { $toString: "$customer" },
        marketplace: { $toString: "$marketplace" },
      },
    },
    {
      $group: {
        _id: "$orderOn",
        orders: {
          $push: {
            order: "$_id",
            orderOn: "$_id",
            slot: "$slot",
            amount: { $toString: "$total" },
          },
        },
        totalWithDelivery: { $sum: "$totalWithDelivery" },
        totalOrders: { $sum: 1 },
        totalAmount: { $sum: "$total" },
        customer: { $first: "$customer" },
        marketplace: { $first: "$marketplace" },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);

  const totalOrders = orders.reduce((acc, curr) => acc + curr.totalOrders, 0);
  const totalAmount = orders.reduce(
    (acc, curr) => acc + curr.totalWithDelivery,
    0
  );
  const totalAmountWithoutDelivery = orders.reduce(
    (acc, curr) => acc + curr.totalAmount,
    0
  );

  const result = {
    customer: customer ? customer : orders[0]?.customer,
    marketplace: marketplace ? marketplace : orders[0]?.marketplace,
    totalOrders,
    amount: totalAmountWithoutDelivery.toFixed(2),
    total: totalAmount.toFixed(2),
    orderBetween,
    allOrders: orders.map((order) => ({
      orderOn: order._id,
      totalOrders: order.totalOrders,
      amount: order.totalAmount.toFixed(2),
      total: order.totalWithDelivery.toFixed(2),
      orders: order.orders.map((o) => ({
        order: o.order,
        slot: o.slot,
        amount: o.amount,
      })),
    })),
  };
  console.log(result);
  res.status(200).json(result);
}

module.exports = {
  getAllOrder,
  getOrder,
  addOrder,
  updateOrder,
  deleteOrder,
  getOrderSummary,
  getOrderSummary1,
};
