const { getErrorFromCatch } = require("../helper/functions");
const PaymentMethod = require("../models/paymentmethod");

const addPaymentMethod = async (req, res) => {
  try {
    cObj = new PaymentMethod(req.body);
    const result = await cObj.save();
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const updatePaymentMethod = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await PaymentMethod.findByIdAndUpdate(_id, req.body, {
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

const deletePaymentMethod = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await PaymentMethod.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getPaymentMethod = async (req, res) => {
  try {
    const _id = req.body.id;
    let data = await PaymentMethod.findById(_id)
      .populate({ path: "customer", model: "Customer" })
      .populate({ path: "marketplace", model: "MarketPlace" })
      .populate({ path: "driver", model: "Driver" });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getAllPaymentMethod = async (req, res) => {
  try {
    const { sort, select } = req.query;
    const {
      customer,
      marketplace,
      driver,
      method,
      upi,
      card_no,
      card_code,
      card_name,
      active,
      deleted,
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

    if (method) {
      queryObject.method = { $regex: method, $options: "i" };
    }

    if (upi) {
      queryObject.upi = { $regex: upi, $options: "i" };
    }

    if (card_no) {
      queryObject.card_no = { $regex: card_no, $options: "i" };
    }

    if (card_code) {
      queryObject.card_code = { $regex: card_code, $options: "i" };
    }

    if (card_name) {
      queryObject.card_name = { $regex: card_name, $options: "i" };
    }

    if (active) {
      queryObject.active = active;
    }

    if (deleted) {
      queryObject.deleted = deleted;
    }

    let apiData = PaymentMethod.find(queryObject);

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

const getMethod = async (req, res) => {
  try {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    let sort = req.query.sort || "card_name";
    let genre = req.query.genre || "all";

    const genereOptions = ["All", "Credit Card", "Debit Card", "Upi"];

    genre == "All"
      ? (genre = [...genereOptions])
      : (genre = req.query.genre.split(","));
    req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);

    let sortBy = {};
    if (sort[1]) {
      sortBy[sort[0]] = sort[1];
    } else {
      sortBy[sort[0]] = "asc";
    }

    const paymenMehods = await PaymentMethod.find({
      name: { $regex: search, $options: "i" },
    })
      .where("genre")
      .in([...genre])
      .sort(sortBy)
      .skip(page * limit)
      .limit(limit);

    const total = await PaymentMethod.countDocuments({
      genre: { $in: [...genre] },
      name: { $regex: search, $options: "i" },
    });

    const response = {
      error: false,
      total,
      page: page + 1,
      limit,
      genres: genereOptions,
      paymenMehods,
    };

    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

const addMethod = async (req, res) => {
  try {
    const docs = await PaymentMethod.insertMany(methods);
    return Promise.resolve(docs);
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports = {
  getAllPaymentMethod,
  getPaymentMethod,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  getMethod,
};
