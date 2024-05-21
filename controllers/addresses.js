const { getErrorFromCatch } = require("../helper/functions");
const Address = require("../models/address");

const addAddress = async (req, res) => {
  try {
    cObj = new Address(req.body);
    const result = await cObj.save();
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getAddress = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Address.findById(_id);

    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const updateAddress = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Address.findByIdAndUpdate(_id, req.body, { new: true });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const deleteAddress = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Address.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getAllAddress = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      mobile,
      email,
      location,
      address,
      active,
      deleted,
      sort,
      select,
    } = req.query;
    const queryObject = {};

    if (firstname) {
      queryObject.firstname = { $regex: firstname, $options: "i" };
    }

    if (lastname) {
      queryObject.lastname = { $regex: lastname, $options: "i" };
    }

    if (mobile) {
      queryObject.mobile = mobile;
    }

    if (email) {
      queryObject.email = { $regex: email, $options: "i" };
    }

    if (location) {
      queryObject.location = location;
    }

    if (address) {
      queryObject.address = address;
    }

    if (active) {
      queryObject.active = active;
    }

    if (deleted) {
      queryObject.deleted = deleted;
    }

    let apiData = Address.find(queryObject);
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
  getAllAddress,
  getAddress,
  addAddress,
  updateAddress,
  deleteAddress,
};
