const { getErrorFromCatch } = require("../helper/functions");
const Driver = require("../models/driver");

const addDriver = async (req, res) => {
  try {
    cObj = new Driver(req.body);
    const result = await cObj.save();
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const updateDriver = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Driver.findByIdAndUpdate(_id, req.body, { new: true });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const deleteDriver = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Driver.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getDriver = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Driver.findById(_id)
      .populate({ path: "address", model: "Address" })
      .populate({ path: "documents", model: "Document" });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getAllDriver = async (req, res) => {
  try {
    const { sort, select } = req.query;
    const {
      token,
      firstname,
      lastname,
      mobile,
      email,
      location,
      address,
      documents,
      verified,
      active,
      deleted,
    } = req.body;
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
          $maxDistance: parseFloat(searchDistance) * 1000,
        },
      };

      Driver.ensureIndexes({ location: "2dsphere" });
    }

    if (address) {
      queryObject.address = address;
    }

    if (documents) {
      queryObject.documents = documents;
    }

    if (verified) {
      queryObject.verified = verified;
    }

    if (active) {
      queryObject.active = active;
    }

    if (deleted) {
      queryObject.deleted = deleted;
    }

    let apiData = Driver.find(queryObject)
      .populate({ path: "address", model: "Address" })
      .populate({ path: "documents", model: "Document" });
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
  getAllDriver,
  getDriver,
  addDriver,
  updateDriver,
  deleteDriver,
};
