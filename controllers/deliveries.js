const { getErrorFromCatch } = require("../helper/functions");
const Delivery = require("../models/delivery");
const { mailTo, smsTo } = require("../controllers/sendgrid");
const { addNotification, addNotification1 } = require("../controllers/fcm");
const Customer = require("../models/customer");
const Driver = require("../models/driver");

sendDeliveryUpdates = async (result, body) => {
  try {
    let customer;
    try {
      customer = await Customer.findById({
        _id: result.customer.get("id"),
      });
    } catch (e) {
      console.log(e);
    }

    let driver;
    try {
      driver = await Driver.findById({
        _id: result.driver.get("id"),
      });
    } catch (e) {
      console.log(e);
    }

    const subject = `${process.env.APP_NAME.toUpperCase()}-DELIVERY`;

    let msg = "";
    let fcmToken;
    let email;
    let mobile;
    if (result.status === "Processing") {
      if (body.request) {
        msg = `Dear ${result.driver.get(
          "name"
        )}, Your request for Order ref. ${result.order.get(
          "id"
        )} has been sent for delivery approval. please wait for the confirmation.`;
      } else if (body.assign) {
        msg = `Dear ${result.driver.get(
          "name"
        )}, Your delivery has been assigned for order ref. ${result.order.get(
          "id"
        )}.`;
      }

      email = driver.email;
      mobile = driver.mobile;
      fcmToken = driver.token;
    } else if (result.status === "Started") {
      msg = `Dear ${result.customer.get(
        "name"
      )}, Your Order ref. ${result.order.get(
        "id"
      )} has been out for the delivery and arriving soon. Please collect it from our delivery executive.`;

      email = customer.email;
      mobile = customer.mobile;
      fcmToken = customer.token;
    } else if (result.status === "Finished") {
      msg = `Dear ${result.customer.get(
        "name"
      )}, Your Order ref. ${result.order.get(
        "id"
      )} has been successfully delivered. Please enjoy our service again.`;

      email = customer.email;
      mobile = customer.mobile;
      fcmToken = customer.token;
    }

    try {
      ///Emil
      const sendEmailData = {
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
        to: mobile,
        subject: subject,
        text: msg,
      };
      await smsTo(sendSMSData);
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

    if (req.body.request !== undefined || req.body.assign !== undefined) {
      data = await Delivery.findById(_id);
      if (data === null) {
        return res.status(200).json({ error: "id not found" });
      }

      if (req.body.request !== undefined) {
        if (data.requests === undefined) {
          data.requests = req.body.request.delivery;
        } else {
          let reqExists = false;
          data.requests.map((e0) => {
            if (e0 === req.body.request.delivery) {
              reqExists = true;
              return;
            }
          });

          const tmpRequests = [...data.requests, req.body.request.delivery];
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
    } else {
      data = await Delivery.findByIdAndUpdate(_id, req.body, {
        new: true,
      });

      if (data === null) {
        return res.status(200).json({ error: "id not found" });
      }
    }

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
    const { sort, select, count, isTotal } = req.query;
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
      delivered,
      accepted,
      completed,
      violation,
    } = req.body;
    const queryObject = {};

    if (customer) {
      queryObject.customer = customer;
      // queryObject.customer = { $eq: customer };
    }

    if (marketplace) {
      // queryObject.marketplace = marketplace;
      queryObject.marketplace = { $eq: marketplace };
    }

    if (driver) {
      // queryObject.driver = driver;
      queryObject.driver = { $eq: driver };
    }

    if (delivery_id) {
      // queryObject.delivery_id = { $regex: delivery_id, $options: "i" };
      queryObject.delivery_id = { $eq: delivery_id };
    }

    if (order_id) {
      // queryObject.order_id = { $regex: order_id, $options: "i" };
      queryObject.order_id = { $eq: order_id };
    }

    if (order) {
      queryObject.order = order;
      // queryObject.order = { $eq: order };
    }

    if (item) {
      queryObject.item = item;
      // queryObject.item = { $eq: item };
    }

    if (subscription) {
      // queryObject.subscription = subscription;
      queryObject.subscription = { $eq: subscription };
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

    if (delivered) {
      queryObject.delivered = delivered;
    }

    if (accepted) {
      queryObject.accepted = accepted;
    }

    if (completed) {
      queryObject.completed = completed;
    }

    if (violation) {
      queryObject.violation = violation;
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

    // apiData = apiData.skip(skip).limit(limit);

    // const data = await apiData;
    // res.status(200).json({ count: data.length, data });
    if (count) {
      if (isTotal) {
        apiData = apiData.estimatedDocumentCount(); //total
      } else {
        apiData = apiData.countDocuments(queryObject);
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
    res.status(400).json(getErrorFromCatch(e));
  }
};

async function getDeliverySummary(req, res) {
  const {
    marketplace,
    customer,
    item,
    order,
    driver,
    delivery_id,
    keyword,
    assigned,
    status,
    accepted,
    completed,
    violation,

    delivery_address,
    date,
    start,
    end,
    timePeriod,
  } = req.body;

  let startDate, endDate;
  let orderBetween;
  const now = new Date();

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
    default:
      throw new Error(
        'Invalid time period specified. Choose from "today", "week", "month", or "year".'
      );
  }

  orderBetween = {
    from: startDate.toISOString().split("T")[0],
    to: endDate.toISOString().split("T")[0],
  };

  const matchCriteria = {
    deleted: false,
    createAt: {
      $gte: startDate,
      $lt: endDate,
    },
  };

  if (marketplace) {
    matchCriteria["marketplace.id"] = marketplace;
  }

  if (customer) {
    matchCriteria["customer.id"] = customer;
  }

  if (item) {
    matchCriteria["item.id"] = item;
  }

  if (order) {
    matchCriteria["order.id"] = order;
  }

  if (driver) {
    matchCriteria["driver.id"] = driver;
  }

  if (delivery_id) {
    matchCriteria.delivery_id = delivery_id;
  }

  if (keyword) {
    matchCriteria.keyword = keyword;
  }

  if (assigned) {
    matchCriteria.assigned = assigned;
  }

  if (status) {
    matchCriteria.status = status;
  }

  if (accepted !== undefined) {
    matchCriteria.accepted = accepted;
  }

  if (completed !== undefined) {
    matchCriteria.completed = completed;
  }

  if (violation !== undefined) {
    matchCriteria.violation = violation;
  }

  const deliveries = await Delivery.aggregate([
    {
      $match: matchCriteria,
    },
    {
      $project: {
        deliveryOn: {
          $dateToString: { format: "%Y-%m-%d", date: "$createAt" },
          // $dateToString: { format: "%Y-%m-%d", date: "$start_time" },
        },
        customer: { id: 1, name: 1, email: 1, mobile: 1, address: 1 },
        marketplace: { id: 1, name: 1, email: 1, mobile: 1, address: 1 },
        driver: { id: 1, name: 1, email: 1, mobile: 1, address: 1 },
        item: { id: 1, name: 1, category: 1, company: 1 },
        order: { id: 1, mode: 1, option: 1, charge: 1 },
        delivery_id: 1,
        status: 1,
        keyword: 1,
        accepted: 1,
        completed: 1,
        violation: 1,
      },
    },
    {
      $sort: { deliveryOn: -1 },
    },
  ]);

  const totalDeliveries = deliveries.length;

  const result = {
    count: 1,
    result: {
      orderBetween,
      totalDeliveries,
      deliveries: deliveries.map((delivery) => ({
        delivery_id: delivery.delivery_id,
        deliveryOn: delivery.deliveryOn,
        customer: delivery.customer,
        marketplace: delivery.marketplace,
        driver: delivery.driver,
        item: delivery.item,
        order: delivery.order,
        status: delivery.status,
        keyword: delivery.keyword,
        accepted: delivery.accepted,
        completed: delivery.completed,
        violation: delivery.violation,
      })),
    },
  };

  console.log(result);
  res.status(200).json(result);
}

async function getDeliverySummary1(req, res) {
  const {
    marketplace,
    customer,
    item,
    order,
    driver,
    delivery_id,
    keyword,
    assigned,
    status,
    accepted,
    completed,
    violation,
    timePeriod,
    date,
    start,
    end,
  } = req.body;

  let startDate, endDate;
  let deliveryBetween;
  const now = new Date();

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

  deliveryBetween = {
    from: startDate.toISOString().split("T")[0],
    to: endDate.toISOString().split("T")[0],
  };

  const matchCriteria = {
    deleted: false,
    createAt: {
      $gte: startDate,
      $lt: endDate,
    },
  };

  if (marketplace) matchCriteria["marketplace.id"] = marketplace;
  if (customer) matchCriteria["customer.id"] = customer;
  if (item) matchCriteria["item.id"] = item;
  if (order) matchCriteria["order.id"] = order;
  if (driver) matchCriteria["driver.id"] = driver;
  if (delivery_id) matchCriteria.delivery_id = delivery_id;
  if (keyword) matchCriteria.keyword = keyword;
  if (assigned) matchCriteria.assigned = assigned;
  if (status) matchCriteria.status = status;
  if (accepted !== undefined) matchCriteria.accepted = accepted;
  if (completed !== undefined) matchCriteria.completed = completed;
  if (violation !== undefined) matchCriteria.violation = violation;

  const deliveries = await Delivery.aggregate([
    {
      $match: matchCriteria,
    },
    {
      $addFields: {
        start_time: { $dateFromString: { dateString: "$start_time" } },
        reach_time: { $dateFromString: { dateString: "$reach_time" } },
      },
    },
    {
      $project: {
        delivery_id: 1,
        customer: 1,
        marketplace: 1,
        suggested_route: 1,
        delivery_route: 1,
        start: 1,
        end: 1,
        distance: {
          $cond: {
            if: { $eq: ["$distance", ""] },
            then: "0 mi",
            else: "$distance",
          },
        },
        duration: {
          $cond: {
            if: { $eq: ["$duration", ""] },
            then: "0 mins",
            else: "$duration",
          },
        },
        start_time: 1,
        reach_time: 1,
        time_taken: {
          $cond: {
            if: { $eq: ["$time_taken", ""] },
            then: "00:00:00",
            else: "$time_taken",
          },
        },
        time_taken1: {
          $let: {
            vars: {
              seconds: {
                $dateDiff: {
                  startDate: "$start_time",
                  endDate: "$reach_time",
                  unit: "second",
                },
              },
              hours: {
                $floor: {
                  $divide: [
                    {
                      $dateDiff: {
                        startDate: "$start_time",
                        endDate: "$reach_time",
                        unit: "second",
                      },
                    },
                    3600,
                  ],
                },
              },
              minutes: {
                $floor: {
                  $mod: [
                    {
                      $divide: [
                        {
                          $dateDiff: {
                            startDate: "$start_time",
                            endDate: "$reach_time",
                            unit: "second",
                          },
                        },
                        60,
                      ],
                    },
                    60,
                  ],
                },
              },
              secondsMod: {
                $mod: [
                  {
                    $dateDiff: {
                      startDate: "$start_time",
                      endDate: "$reach_time",
                      unit: "second",
                    },
                  },
                  60,
                ],
              },
            },
            in: {
              $concat: [
                {
                  $cond: {
                    if: { $lt: [{ $strLenCP: { $toString: "$$hours" } }, 2] },
                    then: { $concat: ["0", { $toString: "$$hours" }] },
                    else: { $toString: "$$hours" },
                  },
                },
                ":",
                {
                  $cond: {
                    if: { $lt: [{ $strLenCP: { $toString: "$$minutes" } }, 2] },
                    then: { $concat: ["0", { $toString: "$$minutes" }] },
                    else: { $toString: "$$minutes" },
                  },
                },
                ":",
                {
                  $cond: {
                    if: {
                      $lt: [{ $strLenCP: { $toString: "$$secondsMod" } }, 2],
                    },
                    then: { $concat: ["0", { $toString: "$$secondsMod" }] },
                    else: { $toString: "$$secondsMod" },
                  },
                },
              ],
            },
          },
        },
        origin: 1,
        destination: 1,
      },
    },
    {
      $group: {
        _id: {
          deliveryOn: {
            // $dateToString: { format: "%Y-%m-%d", date: "$createAt" },
            $dateToString: { format: "%Y-%m-%d", date: "$start_time" },
          },
          status: "$status",
          accepted: "$accepted",
          completed: "$completed",
          violation: "$violation",
          driver: "$driver",
        },
        totalDeliveries: { $sum: 1 },
        deliveries: {
          $push: {
            delivery_id: "$delivery_id",
            customer: "$customer",
            marketplace: "$marketplace",
            suggested_route: "$suggested_route",
            delivery_route: "$delivery_route",
            start: "$start",
            end: "$end",
            distance: "$distance",
            duration: "$duration",
            start_time: "$start_time",
            reach_time: "$reach_time",
            time_taken: "$time_taken",
            time_taken1: "$time_taken1",
            origin: "$origin",
            destination: "$destination",
          },
        },
        totalDistance: {
          $sum: {
            $toDouble: { $arrayElemAt: [{ $split: ["$distance", " "] }, 0] },
          },
        },
        totalDuration: {
          $sum: {
            $toDouble: { $arrayElemAt: [{ $split: ["$duration", " "] }, 0] },
          },
        },
        totalTimeTaken: {
          $sum: {
            $toDouble: { $arrayElemAt: [{ $split: ["$time_taken", ":"] }, 2] },
          },
        },
        totalTimeTaken1: {
          $sum: {
            $toDouble: { $arrayElemAt: [{ $split: ["$time_taken1", ":"] }, 2] },
          },
        },
      },
    },
    {
      $sort: { "_id.deliveryOn": -1 },
    },
    {
      $project: {
        _id: 0,
        deliveryOn: "$_id.deliveryOn",
        totalDeliveries: "$totalDeliveries",
        totalDistance: { $concat: [{ $toString: "$totalDistance" }, " mi"] },
        totalDuration: { $concat: [{ $toString: "$totalDuration" }, " mins"] },
        totalTimeTaken: {
          $concat: [{ $toString: "$totalTimeTaken" }, " secs"],
        },
        totalTimeTaken1: {
          $concat: [{ $toString: "$totalTimeTaken1" }, " secs"],
        },
        status: "$_id.status",
        accepted: "$_id.accepted",
        completed: "$_id.completed",
        violation: "$_id.violation",
        driver: "$_id.driver",
        deliveries: "$deliveries",
      },
    },
  ]);

  const totalDeliveries = deliveries.reduce(
    (acc, curr) => acc + curr.totalDeliveries,
    0
  );
  const totalDistance = deliveries.reduce(
    (acc, curr) => acc + parseFloat(curr.totalDistance),
    0
  );
  const totalDuration = deliveries.reduce(
    (acc, curr) => acc + parseFloat(curr.totalDuration),
    0
  );
  const totalTimeTaken = deliveries.reduce(
    (acc, curr) => acc + parseFloat(curr.totalTimeTaken),
    0
  );

  const result = {
    count: 1,
    result: {
      deliveryBetween,
      totalDeliveries,
      totalDistance: `${totalDistance} mi`,
      totalDuration: `${totalDuration} mins`,
      totalTimeTaken: `${totalTimeTaken} secs`,
      deliveriesByDate: deliveries,
    },
  };

  console.log(result);
  res.status(200).json(result);
}

module.exports = {
  getAllDelivery,
  getDelivery,
  addDelivery,
  updateDelivery,
  deleteDelivery,
  getDeliverySummary,
  getDeliverySummary1,
};
