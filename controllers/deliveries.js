const { getErrorFromCatch } = require("../helper/functions");
const Delivery = require("../models/delivery");
const { mailTo, smsTo } = require("../controllers/sendgrid");
const { addNotification, addNotification1 } = require("../controllers/fcm");
const Customer = require("../models/customer");
const Driver = require("../models/driver");
const Marketplace = require("../models/marketplace");
const Order = require("../models/order");
const Payment = require("../models/payment");

sendDeliveryUpdates = async (result, body) => {
  try {
    // if (result.driver.get("id") !== "") {
    //   Messages for delivery:

    // Customer App:
    // Your Order has been out for delivery and arriving soon. Please collect it from our delivery executive.
    // Your Order has been successfully delivered. Please enjoy our service again.
    // Driver App:
    // Dear delivery partner your request for Order ID has been sent for approval. please wait for the confirmation.
    // Dear delivery partner your delivery has been assigned for Order ID.

    // console.log(result);

    // const orderId = result._id.toString();
    // const paymentId = result.reference;
    // const amount = result.amount;
    // const orderType = result.keyword;

    // let customerName = `${result.customer.firstname} ${result.customer.lastname}`;
    // let customerEmail = result.customer.email;
    // let customerMobile = result.customer.mobile;

    // if (result.customer.firstname == undefined && customer != undefined)
    //   customerName = `${customer.firstname} ${customer.lastname}`;
    // if (customerEmail == undefined && customer != undefined)
    //   customerEmail = customer.email;
    // if (customerMobile == undefined && customer != undefined)
    //   customerMobile = customer.mobile;

    // console.log(result.status);
    // const driverData = JSON.parse(result.driver);
    // console.log(driverData.name);
    // console.log(result.driver);
    // console.log(result.driver["name"]);
    // console.log(result.driver.name);
    // console.log(result.driver.get("name"));

    // console.log(result.driver.get("id"));
    // const customer = await Customer.find({
    //   // _id: new ObjectId(result.customer.get("id")),
    //   _id: result.customer.get("id").toString(),
    // });
    // const driver = await Driver.find({
    //   _id: result.driver.get("id").toString(),
    // });
    // const customer = await Customer.findById({
    //   _id: result.customer.get("id").toString(),
    // });
    let customer;
    try {
      customer = await Customer.findById({
        // _id: result.driver.get("id").toString(),
        _id: result.customer.get("id"),
      });
    } catch (e) {
      console.log(e);
    }
    // const driver = await Driver.find({
    //   _id: result.driver.get("id").toString(),
    // });
    // const driver = await Driver.findById({
    //   // _id: result.driver.get("id").toString(),
    //   _id: result.driver.get("id"),
    // });

    let driver;
    try {
      driver = await Driver.findById({
        // _id: result.driver.get("id").toString(),
        _id: result.driver.get("id"),
      });
    } catch (e) {
      console.log(e);
    }
    // const market = await Marketplace.find({ _id: result.marketplace.get("id") });
    // const order = await Order.find({ _id: req.body.customer });
    // const payment = await Payment.find({ _id: req.body.customer });

    // let customerEmail = customer[0].email;
    // let customerMobile = customer[0].mobile;

    // let driverEmail = driver[0].email;
    // let driverMobile = driver[0].mobile;

    // let marketEmail = market.email;
    // let marketMobile = market.mobile;

    // if (req.body.customer != undefined) {}
    // const fcmToken = customer[0].token;
    // const fcmTokenCustomer = customer[0].token;
    // const fcmTokenDriver = driver[0].token;

    // console.log(customer);
    // console.log(driver);

    const subject = `${process.env.APP_NAME.toUpperCase()}-DELIVERY`;
    // const msg = `Dear ${customerName}, Thank you for the purchase. Your ${orderType} ref. ${orderId} with payment ref. ${paymentId} is confirmed for the amount $${amount}.`;
    // body: `Your ${req.body.keyword} has been placed successfully. Thank you for ${req.body.keyword}.`,
    // body: `Your Order has been out for delivery and arriving soon. Please collect it from our delivery executive.`,
    // body: `Your Order has been successfully delivered. Please enjoy our service again.`,
    // body: `Dear delivery partner your request for Order ID has been sent for approval. please wait for the confirmation.`,
    // body: `Dear delivery partner your delivery has been assigned for Order ID.`,

    let msg = "";
    let fcmToken;
    let email;
    let mobile;
    if (result.status === "Processing") {
      // msg = `Dear delivery partner, Your request for Order ID has been sent for approval. please wait for the confirmation.`;
      // msg = `Dear delivery partner, Your delivery has been assigned for Order ID.`;

      if (body.request) {
        msg = `Dear ${result.driver.get(
          "name"
        )}, Your request for Order ref. ${result.order.get(
          "id"
        )} has been sent for delivery approval. please wait for the confirmation.`;
        // msg = `Dear ${result.driver.get(
        //   "name"
        // )}, Your request for Order ref. ${result.order.get(
        //   "id"
        // )} between slot has been sent for delivery approval. please wait for the confirmation.`;
      } else if (body.assign) {
        msg = `Dear ${result.driver.get(
          "name"
        )}, Your delivery has been assigned for order ref. ${result.order.get(
          "id"
        )}.`;
        // msg = `Dear ${result.driver.get(
        //   "name"
        // )}, Your delivery has been assigned for Order ref. ${result.order.get(
        //   "id"
        // )} beetween slot.`;
        // msg = `Dear ${result.driver.name}, You have assigned Order ref. ${result.order.id} for the delivery.`;
      }

      // email = driver[0].email;
      // mobile = driver[0].mobile;
      // fcmToken = driver[0].token;
      email = driver.email;
      mobile = driver.mobile;
      fcmToken = driver.token;
    } else if (result.status === "Started") {
      // msg = `Your Order has been out for delivery and arriving soon. Please collect it from our delivery executive.`;
      //Your ${orderType.toLowerCase()} ref. ${orderId} with payment ref. ${paymentId} is confirmed for the amount $${amount}.
      // msg = `Dear ${customerName}, Your Order has been out for the delivery and arriving soon. Please collect it from our delivery executive.`;
      msg = `Dear ${result.customer.get(
        "name"
      )}, Your Order ref. ${result.order.get(
        "id"
      )} has been out for the delivery and arriving soon. Please collect it from our delivery executive.`;

      email = customer.email;
      mobile = customer.mobile;
      fcmToken = customer.token;
    } else if (result.status === "Finished") {
      // msg = `Your Order has been successfully delivered. Please enjoy our service again.`;
      // msg = `Dear ${customerName}, Your Order has been successfully delivered. Please enjoy our service again.`;
      msg = `Dear ${result.customer.get(
        "name"
      )}, Your Order ref. ${result.order.get(
        "id"
      )} has been successfully delivered. Please enjoy our service again.`;

      email = customer.email;
      mobile = customer.mobile;
      fcmToken = customer.token;
    }

    // console.log(result);
    console.log(`msg: ${msg}`);
    console.log(email);
    console.log(mobile);
    console.log(fcmToken);

    try {
      ///Emil
      const sendEmailData = {
        // to: [customerEmail],
        to: [email],
        subject: subject,
        text: msg,
      };
      await mailTo(sendEmailData);
    } catch (err) {
      console.log("Email sending Error:");
      console.log(err);
    }

    try {
      //SMS
      const sendSMSData = {
        // to: customerMobile,
        to: mobile,
        subject: subject,
        text: msg,
      };
      // await smsTo(sendSMSData);
    } catch (err) {
      console.log("SMS sending Error:");
      console.log(err);
    }

    try {
      // FCM
      const data = {
        title: subject,
        body: msg,
        image: "",
        token: fcmToken,
      };
      await addNotification1(data);
    } catch (err) {
      console.log("Notification Error:");
      console.log(err);
    }
    // }
  } catch (e) {
    console.log("sendDeliveryUpdates err:");
    console.log(e);
  }
};

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
    let data;

    console.log(req.body.request);
    console.log(req.body.assign);
    if (
      // req.body.request.delivery !== undefined ||
      // req.body.assign.delivery !== undefined
      req.body.request !== undefined ||
      req.body.assign !== undefined
    ) {
      data = await Delivery.findById(_id);
      // data = await Delivery.findById({ _id });
      // data = data[0];
      // console.log(data);
      // console.log(data.requests.includes(req.body.request.delivery));

      if (data === null) {
        return res.status(200).json({ error: "id not found" });
      }

      // console.log(data);

      if (req.body.request !== undefined) {
        // console.log(data.requests);
        // if (data.requests == null) {
        if (data.requests === undefined) {
          data.requests = req.body.request.delivery;
        } else {
          let reqExists = false;

          data.requests.map((e0) => {
            // console.log(`e ${e0[0]}`);
            if (e0 === req.body.request.delivery) {
              reqExists = true;
              // break;
              return;
            }
          });

          // console.log(`reqExists ${reqExists}`);
          const tmpRequests = [...data.requests, req.body.request.delivery];
          console.log(tmpRequests);
          data.requests = tmpRequests;
        }
      } else if (req.body.assign !== undefined) {
        data.assigned = req.body.assign.delivery;
        if (req.body.driver) {
          data.driver = req.body.driver;
        }
      }

      data = await Delivery.findByIdAndUpdate(_id, data, {
        new: true,
      });

      // console.log(data);
    } else {
      data = await Delivery.findByIdAndUpdate(_id, req.body, {
        new: true,
      });

      if (data === null) {
        return res.status(200).json({ error: "id not found" });
      }
    }

    // if (data === null) {
    //   return res.status(200).json({ error: "id not found" });
    // }

    // let delivery = await Delivery.findById(_id);
    // await sendDeliveryUpdates(delivery);
    // await sendDeliveryUpdates(req.body)
    await sendDeliveryUpdates(data, req.body);

    res.status(200).json(data);
  } catch (e) {
    console.log(e);
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
      order,
      item,
      subscription,
      keyword,
      assigned,
      requests,
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

    if (order) {
      queryObject.order = order;
    }

    if (item) {
      queryObject.item = item;
    }

    if (subscription) {
      queryObject.subscription = subscription;
    }

    if (keyword) {
      queryObject.keyword = keyword;
    }

    if (assigned) {
      queryObject.assigned = assigned;
    }

    if (requests) {
      queryObject.requests = requests;
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
      const date = new Date(createAt);
      const date1 = new Date(createAt).setDate(date.getDate() + 1);
      console.log(`${date}\n${date1}`);
      queryObject.createAt = {
        $gte: date,
        $lte: date1,
      };
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
