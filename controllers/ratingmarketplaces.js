const { getErrorFromCatch } = require("../helper/functions");
const RatingMarketplace = require("../models/ratingmarketplace");

const addRatingMarketplace = async (req, res) => {
  try {
    cObj = new RatingMarketplace(req.body);
    const result = await cObj.save();
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const updateRatingMarketplace = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await RatingMarketplace.findByIdAndUpdate(_id, req.body, {
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

const deleteRatingMarketplace = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await RatingMarketplace.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getRatingMarketplace = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await RatingMarketplace.findById(_id)
      .populate({ path: "delivery_address", model: "Address" })
      .populate({ path: "customer", model: "Customer" })
      .populate({ path: "driver", model: "Driver" })
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

const getAllRatingMarketplace = async (req, res) => {
  try {
    const { filter, sort, select } = req.query;
    const {
      customer,
      marketplace,
      product,
      rating,
      review,
      active,
      deleted,
      date,
    } = req.body;
    const queryObject = {};

    if (customer) {
      queryObject.customer = { $eq: customer };
    }

    if (marketplace) {
      queryObject.marketplace = { $eq: marketplace };
    }

    if (filter) {
    }

    if (rating) {
      queryObject.rating = { $regex: rating, $options: "i" };
    }

    if (review) {
      queryObject.review = { $regex: review, $options: "i" };
    }

    if (active) {
      queryObject.active = active;
    }

    if (deleted) {
      queryObject.deleted = deleted;
    }

    if (date) {
      queryObject.createAt = { $regex: date, $options: "i" };
    }

    let apiData = RatingMarketplace.find(queryObject);

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
          populate: { path: "address", model: "Address" },
        });
      }
      if (selectFix.includes("marketplace")) {
        let filter = {};
        apiData.populate({
          path: "marketplace",
          model: "MarketPlace",
          match: filter,
        });
      }
    }

    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 25;
    let skip = (page - 1) * limit;

    apiData = apiData.skip(skip).limit(limit).sort({ createAt: -1 });

    const data = await apiData;
    res.status(200).json({ count: data.length, data });
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

module.exports = {
  getAllRatingMarketplace,
  getRatingMarketplace,
  addRatingMarketplace,
  updateRatingMarketplace,
  deleteRatingMarketplace,
};
