const { getErrorFromCatch } = require("../helper/functions");
const Order = require("../models/order");
const Payment = require("../models/payment");
const Customer = require("../models/customer");
const Marketplace = require("../models/marketplace");
const Subscription = require("../models/subscription");
const Delivery = require("../models/delivery");
const { mailTo, smsTo } = require("../controllers/sendgrid");
const { addNotification, addNotification1 } = require("../controllers/fcm");

const addPayment = async (req, res) => {
  try {
    let result;
    let result2;
    let query;
    if (req.body.subscriptions) {
      const result1 = await Order.insertMany(req.body.orders);
      let obj = { ...req.body };
      obj.orders = result1.map((e) => e._id);
      cObj = new Payment(obj);

      result2 = await cObj.save();
      let sobj = { ...req.body.subscriptions };
      sobj.payment = result2.id;

      query = sobj;

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
    } else if (req.body.orders) {
      const result1 = await Order.insertMany(req.body.orders);

      let obj = { ...req.body };
      obj.orders = result1.map((e) => e._id);
      query = obj;

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
    } else {
      query = req.body;
      cObj = new Payment(req.body);
      result = await cObj.save();
    }

    let result1;
    try {
      let addr = [];
      let keyword = result.keyword;
      if (keyword === undefined) result.payment.keyword;
      if (keyword === undefined) {
        console.log("subscription");
        result1 = Payment.find({ _id: result.payment._id });
        result1 = await result1.populate([
          {
            path: "orders",
            model: "Order",
            populate: [
              { path: "item", model: "Product" },
              { path: "products", model: "Product" },
              { path: "delivery_address", model: "Address" },
              { path: "customer", model: "Customer" },
              {
                path: "marketplace",
                model: "MarketPlace",
                populate: [{ path: "address", model: "Address" }],
              },
            ],
          },
        ]);

        result1 = result1[0];
        const r0 = result1.orders.map((e) => {
          return {
            customer: {
              id: e.customer._id.toString(),
              name: `${e.customer.firstname} ${e.customer.lastname}`,
              mobile: e.customer.mobile,
              email: e.customer.email,
              address: `${
                e.delivery_address.street === ""
                  ? ""
                  : `${e.delivery_address.street}, `
              }${
                e.delivery_address.appartment === ""
                  ? ""
                  : `${e.delivery_address.appartment}, `
              }${e.delivery_address.city}, ${e.delivery_address.state} ${
                e.delivery_address.zipcode
              }, ${e.delivery_address.country}`,
            },
            marketplace: {
              id: e.marketplace._id.toString(),
              name: `${e.marketplace.name}`,
              mobile: e.marketplace.mobile,
              email: e.marketplace.email,
              address: `${
                e.marketplace.address[0].street === ""
                  ? ""
                  : `${e.marketplace.address[0].street}, `
              }${
                e.marketplace.address[0].appartment === ""
                  ? ""
                  : `${e.marketplace.address[0].appartment}, `
              }${e.marketplace.address[0].city}, ${
                e.marketplace.address[0].state
              } ${e.marketplace.address[0].zipcode}, ${
                e.marketplace.address[0].country
              }`,
            },
            item: {
              id: e.item._id.toString(),
              name: e.item.name,
              category: `${e.item.category} [ ${e.item.subcategory} ]`,
              company: e.item.company,
            },
            order: {
              id: e._id.toString(),
              mode: e.delivery_option,
              option: e.delivery_type,
              charge: e.delivery_charge,
            },

            subscription: {
              id: result._id.toString(),
              shipping: result.delivery,
              slot: "",
              from: new Date(result.startOn),
              to: new Date(result.endAt),
            },
          };
        });

        addr = r0;
      } else {
        console.log("order, reorder");
        result1 = Payment.find({ _id: result._id });
        result1 = await result1.populate([
          {
            path: "orders",
            model: "Order",
            populate: [
              { path: "item", model: "Product" },
              { path: "products", model: "Product" },
              { path: "delivery_address", model: "Address" },
              { path: "customer", model: "Customer" },
              {
                path: "marketplace",
                model: "MarketPlace",
                populate: [{ path: "address", model: "Address" }],
              },
            ],
          },
        ]);

        result1 = result1[0];

        const r0 = result1.orders.map((e) => {
          return {
            customer: {
              id: e.customer._id.toString(),
              name: `${e.customer.firstname} ${e.customer.lastname}`,
              mobile: e.customer.mobile,
              email: e.customer.email,
              address: `${
                e.delivery_address.street === ""
                  ? ""
                  : `${e.delivery_address.street}, `
              }${
                e.delivery_address.appartment === ""
                  ? ""
                  : `${e.delivery_address.appartment}, `
              }${e.delivery_address.city}, ${e.delivery_address.state} ${
                e.delivery_address.zipcode
              }, ${e.delivery_address.country}`,
            },
            marketplace: {
              id: e.marketplace._id.toString(),
              name: `${e.marketplace.name}`,
              mobile: e.marketplace.mobile,
              email: e.marketplace.email,
              address: `${
                e.marketplace.address[0].street === ""
                  ? ""
                  : `${e.marketplace.address[0].street}, `
              }${
                e.marketplace.address[0].appartment === ""
                  ? ""
                  : `${e.marketplace.address[0].appartment}, `
              }${e.marketplace.address[0].city}, ${
                e.marketplace.address[0].state
              } ${e.marketplace.address[0].zipcode}, ${
                e.marketplace.address[0].country
              }`,
            },
            item: {
              id: e.item._id.toString(),
              name: e.item.name,
              category: `${e.item.category} [ ${e.item.subcategory} ]`,
              company: e.item.company,
            },
            order: {
              id: e._id.toString(),
              mode: e.delivery_option,
              option: e.delivery_type,
              charge: e.delivery_charge,
            },
          };
        });

        addr = r0;
      }

      addr.map(async (e) => {
        const dData = {
          customer: e.customer,
          marketplace: e.marketplace,
          item: e.item,
          order: e.order,
          keyword: result1.keyword,
        };
        if (keyword === undefined) {
          dData["subscription"] = e.subscription;
        }
        const dObj = new Delivery(dData);
        const dResult = await dObj.save();
      });

      let msg;
      let msg1;
      const res2 = req.body.subscriptions !== undefined ? result2 : result;

      const orderId = res2._id.toString();
      const paymentId = res2.reference;
      const amount = res2.amount;
      const orderType = res2.keyword;
      let customerName = `${res2.customer.firstname} ${res2.customer.lastname}`;
      let customerEmail = res2.customer.email;
      let customerMobile = res2.customer.mobile;

      const customer = result.customer;

      if (res2.customer.firstname == undefined && customer != undefined)
        customerName = `${customer.firstname} ${customer.lastname}`;
      if (customerEmail == undefined && customer != undefined)
        customerEmail = customer.email;
      if (customerMobile == undefined && customer != undefined)
        customerMobile = customer.mobile;

      msg = `Dear ${customerName}, Thank you for the purchase. Your ${orderType.toLowerCase()} ref. ${orderId} with payment ref. ${paymentId} is confirmed for the amount $${amount}.`;
      ///customer email
      try {
        const sendPurchaseEmailData1 = {
          to: [customerEmail],
          subject: `${process.env.APP_NAME.toUpperCase()}-PURCHASE`,
          text: msg,
        };
        await mailTo(sendPurchaseEmailData1);
      } catch (e) {
        console.log("email sending error");
      }
      ///customer sms
      try {
        const sendPurchaseSMSData1 = {
          to: customerMobile,
          subject: `${process.env.APP_NAME.toUpperCase()}-PURCHASE`,
          text: msg,
        };
        await smsTo(sendPurchaseSMSData1);
      } catch (err) {
        console.log("SMS sending Error:");
        console.log(err);
      }

      //customer
      try {
        if (req.body.customer != undefined) {
          const res1 = await Customer.find({ _id: req.body.customer });
          const data = {
            title: `${process.env.APP_NAME.toUpperCase()}-PURCHASE`,
            body: `Your ${req.body.keyword} has been placed successfully. Thank you for ${req.body.keyword}.`,
            image: "",
            token: res1[0].token,
          };
          await addNotification1(data);
        }
      } catch (e) {
        console.log("Error Notification:");
        console.log(e);
      }
      //marketplace
      let itemFields = "";
      let customerStr = "";
      let index = 0;
      let rs2 = res2.orders.map((e) => {
        itemFields += `${e.item.name} [qty.: ${e.item.quantity}]${
          index > res2.length - 1 ? ", " : ""
        }`;
        index++;
      });

      res2.orders.map(async (e) => {
        let res1 = await Marketplace.find({ _id: e.marketplace });
        res1 = res1[0];
        let marketplaceName = `${res1.name}`;
        let marketplaceEmail = res1.email;
        let marketplaceMobile = res1.mobile;

        ///marketplace email
        const msg1 = `Dear marketplace partner, You have received ${req.body.keyword.toLowerCase()} of ${itemFields} for reference id: ${res2._id.toString()}.`;
        const sendPurchaseEmailData2 = {
          to: [marketplaceEmail],
          subject: `${process.env.APP_NAME.toUpperCase()}-NOTIFICATION`,
          text: msg1,
        };
        await mailTo(sendPurchaseEmailData2);
        ///marketplace sms
        try {
          const sendPurchaseSMSData2 = {
            to: marketplaceMobile,
            subject: `${process.env.APP_NAME.toUpperCase()}-NOTIFICATION`,
            text: msg1,
          };
          await smsTo(sendPurchaseSMSData2);
        } catch (err) {
          console.log("SMS sending Error:");
          console.log(err);
        }
        ///marketplace notification
        try {
          const data = {
            title: `${process.env.APP_NAME.toUpperCase()}-NOTIFICATION`,
            body: msg1,
            image: "",
            token: res1[0].token,
          };
          await addNotification1(data);
        } catch (e) {
          console.log("Error Notification:");
          console.log(e);
        }
      });
    } catch (e) {
      console.log("Error Delivery add:");
      console.log(e);
    }

    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const SendPurchaseNotification = async (result, customer, marketplace) => {
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

    let rs1 = result.orders.map((e) => {
      const e1 = {
        item: {
          id: e.item._id.toString(),
          name: e.item.name,
          qty: e.quantity,
          price: e.price,
        },
        customer: {
          id: e.customer._id.toString(),
          name: `${e.customer.firstname} ${e.customer.lastname}`,
          mobile: e.customer.mobile,
          email: e.customer.email,
          address: `${
            e.delivery_address.street === ""
              ? ""
              : `${e.delivery_address.street}, `
          }${
            e.delivery_address.appartment === ""
              ? ""
              : `${e.delivery_address.appartment}, `
          }${e.delivery_address.city}, ${e.delivery_address.state} ${
            e.delivery_address.zipcode
          }, ${e.delivery_address.country}`,
        },
      };
      return e1;
    });

    let itemFields = "";
    let customerStr = "";
    let index = 0;
    let rs2 = rs1.map((e) => {
      itemFields += `${e.item.name} [x${e.item.qty}]${
        index > rs1.length - 1 ? ", " : ""
      }`;
      index++;
    });

    let marketplaceName = `${result.marketplace.firstname} ${result.marketplace.lastname}`;
    let marketplaceEmail = result.marketplace.email;
    let marketplaceMobile = result.marketplace.mobile;

    if (result.marketplace.firstname == undefined && marketplace != undefined)
      marketplaceName = `${marketplace.firstname} ${marketplace.lastname}`;
    if (marketplaceEmail == undefined && marketplace != undefined)
      marketplaceEmail = marketplace.email;
    if (marketplaceMobile == undefined && marketplace != undefined)
      marketplaceMobile = marketplace.mobile;

    const msg1 = `Dear marketplace partner, You have received an ${req.body.keyword} of ${itemFields}.`;

    ///customer
    const msg = `Dear ${customerName}, Thank you for the purchase. Your ${orderType} ref. ${orderId} with payment ref. ${paymentId} is confirmed for the amount $${amount}.`;
    const sendPurchaseEmailData = {
      to: [customerEmail],
      subject: `${process.env.APP_NAME.toUpperCase()}-PURCHASE`,
      text: msg,
    };
    await mailTo(sendPurchaseEmailData);

    ///marketplace
    const sendPurchaseEmailData1 = {
      to: [customerEmail],
      subject: `${process.env.APP_NAME.toUpperCase()}-PURCHASE`,
      text: msg1,
    };
    await mailTo(sendPurchaseEmailData1);

    ///customer
    try {
      const sendPurchaseSMSData = {
        to: customerMobile,
        subject: `${process.env.APP_NAME.toUpperCase()}-PURCHASE`,
        text: msg,
      };
      await smsTo(sendPurchaseSMSData);
    } catch (err) {
      console.log("SMS sending Error:");
      console.log(err);
    }
    ///marketplace
    try {
      const sendPurchaseSMSData1 = {
        to: customerMobile,
        subject: `${process.env.APP_NAME.toUpperCase()}-PURCHASE`,
        text: msg1,
      };
      await smsTo(sendPurchaseSMSData1);
    } catch (err) {
      console.log("SMS sending Error:");
      console.log(err);
    }
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
      id,
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

    if (id) {
      queryObject._id = { $eq: id };
    }

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

    let apiData = Payment.find(queryObject);

    apiData.populate([
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
