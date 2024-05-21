const { getErrorFromCatch } = require("../helper/functions");
const Marketplace = require("../models/marketplace");

const addMarketplace = async (req, res) => {
  try {
    cObj = new Marketplace(req.body);
    const result = await cObj.save();
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const updateMarketplace = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Marketplace.findByIdAndUpdate(_id, req.body, {
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

const deleteMarketplace = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Marketplace.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getMarketplace = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Marketplace.findById(_id)
      .populate({ path: "address", model: "Address" })
      .populate({ path: "items", model: "Product" });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getAllMarketplace = async (req, res) => {
  try {
    const { sort, select } = req.query;
    const {
      token,
      name,
      mobile,
      email,
      description,
      location,
      address,
      rating,
      available,
      deleted,
    } = req.body;
    const queryObject = {};

    if (name) {
      queryObject.name = { $regex: name, $options: "i" };
    }

    if (mobile) {
      queryObject.mobile = mobile;
    }

    if (email) {
      queryObject.email = { $regex: email, $options: "i" };
    }

    if (description) {
      queryObject.description = { $regex: description, $options: "i" };
    }

    if (token) {
      queryObject.token = token;
    }

    if (location) {
      const longitude = location.longitude;
      const latitude = location.latitude;
      const radius = location.radius;
      const searchDistance = radius != undefined ? radius : 1;
      queryObject.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseFloat(searchDistance) * 1000, // 1km
        },
      };
      Marketplace.ensureIndexes({ location: "2dsphere" });
    }

    if (address) {
      queryObject.address = address;
    }

    if (rating) {
      queryObject.rating = rating;
    }

    if (available) {
      queryObject.available = available;
    }

    if (deleted) {
      queryObject.deleted = deleted;
    }

    let apiData = Marketplace.find(queryObject)
      .populate({ path: "address", model: "Address" })
      .populate({ path: "items", model: "Product" });

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
    res.status(200).json({ count: data.length, data });
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

module.exports = {
  getAllMarketplace,
  getMarketplace,
  addMarketplace,
  updateMarketplace,
  deleteMarketplace,
};
