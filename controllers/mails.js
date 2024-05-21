const { query } = require("express");
const { getErrorFromCatch } = require("../helper/functions");
const Mail = require("../models/mail");

const addMail = async (req, res) => {
  try {
    cObj = new Mail(req.body);
    const result = await cObj.save();
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getMail = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Mail.findById(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const updateMail = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Mail.findByIdAndUpdate(_id, req.body, { new: true });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const deleteMail = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Mail.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getAllMail = async (req, res) => {
  try {
    const {
      customer,
      marketplace,
      product,
      price,
      quantity,
      tax,
      total,
      status,
      deleted,
      date,
      sort,
      select,
    } = req.query;
    const queryObject = {};

    if (customer) {
    }

    if (marketplace) {
    }

    if (product) {
    }

    if (price) {
      queryObject.price = { $regex: price, $options: "i" };
    }

    if (quantity) {
      queryObject.quantity = { $regex: quantity, $options: "i" };
    }

    if (tax) {
      queryObject.tax = { $regex: tax, $options: "i" };
    }

    if (total) {
      queryObject.total = { $regex: total, $options: "i" };
    }

    if (status) {
      queryObject.status = { $regex: status, $options: "i" };
    }

    if (deleted) {
      queryObject.deleted = deleted;
    }

    if (date) {
      queryObject.createAt = { $regex: date, $options: "i" };
    }

    let apiData = Mail.find(queryObject);
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

    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 25;
    let skip = (page - 1) * limit;

    apiData = apiData.skip(skip).limit(limit);

    const data = await apiData;
    res.status(200).json({ data, count: data.length });
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

module.exports = {
  getAllMail,
  getMail,
  addMail,
  updateMail,
  deleteMail,
};
