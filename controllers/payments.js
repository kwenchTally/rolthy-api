const { getErrorFromCatch } = require("../helper/functions");
const Order = require("../models/order");
const Payment = require("../models/payment");
const Customer = require("../models/customer");
const Subscription = require("../models/subscription");
const { mailTo } = require("../controllers/sendgrid");
const { addNotification } = require("../controllers/fcm");

const addPayment = async (req, res) => {
  try {
    let result;
    if (req.body.subscriptions) {
      const result1 = await Order.insertMany(req.body.orders);
      let obj = { ...req.body };
      obj.orders = result1.map((e) => e._id);
      cObj = new Payment(obj);

      let result2 = await cObj.save();
      let sobj = { ...req.body.subscriptions };
      sobj.payment = result2.id;

      sObj = new Subscription(sobj);
      result = await sObj.save();
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
      console.log(JSON.stringify(result));
      await SendPurchaseNotification(result2, result.customer);
    } else if (req.body.orders) {
      const result1 = await Order.insertMany(req.body.orders);

      let obj = { ...req.body };
      obj.orders = result1.map((e) => e._id);
      cObj = new Payment(obj);
      result = await cObj.save();

      result = await result.populate([
        {
          path: "orders",
          model: "Order",
          populate: [
            { path: "item", model: "Product" },
            { path: "products", model: "Product" },
            { path: "delivery_address", model: "Address" },
          ],
        },
        { path: "customer", model: "Customer" },
        { path: "method", model: "PaymentMethod" },
      ]);

      console.log("\n");
      await SendPurchaseNotification(result);
    } else {
      cObj = new Payment(req.body);
      result = await cObj.save();
    }

    if (req.body.customer != undefined) {
      const res1 = await Customer.find({ _id: req.body.customer });
      const data = {
        title: "Rolthy purchase",
        body: `Your ${req.body.keyword} has been placed successfully. Thank you for ${req.body.keyword}.`,
        image: "",
        token: res1[0].token,
      };
      await addNotification(data);
    }

    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const SendPurchaseNotification = async (result, customer) => {
  try {
    const orderId = result._id.toString();
    const paymentId = result.reference;
    const amount = result.amount;
    const orderType = result.keyword;
    let customerName = `${result.customer.firstname} ${result.customer.lastname}`;
    let customerEmail = result.customer.email;
    let customerMobile = result.customer.mobile;

    if (result.customer.firstname == undefined && customer != undefined)
      customerName = `${customer.firstname} ${customer.lastname}`;
    if (customerEmail == undefined && customer != undefined)
      customerEmail = customer.email;
    if (customerMobile == undefined && customer != undefined)
      customerMobile = customer.mobile;

    const msg = `Dear ${customerName}, Thank you for the purchase. Your ${orderType} ref. ${orderId} with payment ref. ${paymentId} is confirmed for the amount $${amount}.`;
    const sendPurchaseEmailData = {
      to: [customerEmail],
      subject: "ROLTHY-PURCHASE",
      text: msg,
    };
    await mailTo(sendPurchaseEmailData);
  } catch (err) {
    console.log("email sending error");
  }
};

const updatePayment = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Payment.findByIdAndUpdate(_id, req.body, { new: true });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const deletePayment = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Payment.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getPayment = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Payment.findById(_id).populate({
      path: "orders",
      model: "Order",
    });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getAllPayment = async (req, res) => {
  try {
    const { sort, select } = req.query;
    const {
      reference,
      method,
      customer,
      amount,
      fee,
      status,
      products,
      deleted,
      date,
    } = req.body;
    const queryObject = {};

    if (reference) {
      queryObject.reference = { $eq: reference };
    }

    if (customer) {
      queryObject.customer = { $eq: customer };
    }

    if (method) {
      queryObject.method = { $regex: method, $options: "i" };
    }

    if (amount) {
      queryObject.amount = { $regex: amount, $options: "i" };
    }

    if (fee) {
      queryObject.fee = { $regex: fee, $options: "i" };
    }

    if (status) {
      queryObject.status = { $regex: status, $options: "i" };
    }

    if (products) {
    }

    if (deleted) {
      queryObject.deleted = deleted;
    }

    if (date) {
      queryObject.createAt = { $regex: date, $options: "i" };
    }

    let apiData = Payment.find(queryObject).populate([
      { path: "orders", model: "Order" },
      { path: "customer", model: "Customer" },
      { path: "method", model: "PaymentMethod" },
    ]);

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

    apiData.populate([
      {
        path: "orders",
        model: "Order",
        populate: [
          {
            path: "marketplace",
            model: "MarketPlace",
            populate: [{ path: "address", model: "Address" }],
          },
          { path: "delivery_address", model: "Address" },
          { path: "payment", model: "Payment" },
          { path: "item", model: "Product" },
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
  getAllPayment,
  getPayment,
  addPayment,
  updatePayment,
  deletePayment,
};
