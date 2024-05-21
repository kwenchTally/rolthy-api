const { getErrorFromCatch } = require("../helper/functions");
const Product = require("../models/product");

const addProduct = async (req, res) => {
  try {
    cObj = new Product(req.body);
    const result = await cObj.save();
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const updateProduct = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Product.findByIdAndUpdate(_id, req.body, { new: true });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const deleteProduct = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Product.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getProduct = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Product.findById(_id).populate({
      path: "marketplace",
      model: "MarketPlace",
    });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getAllProduct = async (req, res) => {
  try {
    const { sort, select } = req.query;
    const {
      name,
      description,
      category,
      subcategory,
      price,
      marketplace,
      quantity,
      company,
      available,
      deleted,
      featured,
      rating,
      discount,
      distinct,
    } = req.body;
    const queryObject = {};

    if (name) {
      queryObject.name = { $regex: name, $options: "i" };
    }

    if (category) {
      queryObject.category = { $regex: category, $options: "i" };
    }

    if (subcategory) {
      queryObject.subcategory = { $regex: subcategory, $options: "i" };
    }

    if (price) {
      queryObject.price = price;
    }

    if (company) {
      queryObject.company = { $regex: company, $options: "i" };
    }

    if (marketplace) {
      queryObject.marketplace = marketplace;
    }

    if (available) {
      queryObject.available = available;
    }

    if (deleted) {
      queryObject.deleted = deleted;
    }

    if (rating) {
      queryObject.rating = rating;
    }

    if (discount) {
      queryObject.discount = discount;
    }

    let apiData = Product.find(queryObject).populate({
      path: "marketplace",
      model: "MarketPlace",
    });

    if (sort) {
      let sortFix = sort.replace(",", " ");
      apiData = apiData.sort(sortFix);
    }

    if (select) {
      let selectFix = select.split(",").join(" ");
      console.log(`select ${selectFix}`);
      apiData = apiData.select(selectFix);
    }

    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 25;
    let skip = (page - 1) * limit;

    if (distinct) {
      apiData = apiData.distinct(distinct);
    } else {
      apiData = apiData.skip(skip).limit(limit);
    }

    const data = await apiData;
    res.status(200).json({ count: data.length, data });
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

module.exports = {
  getAllProduct,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
};
