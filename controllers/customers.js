const { getErrorFromCatch } = require("../helper/functions");
const Customer = require("../models/customer");
const Address = require("../models/address");
const { createCustomerForAPI } = require("../controllers/square");

const addCustomer = async (req, res) => {
  try {
    const { mobile, email, address } = req.body;
    var queryObject = {};

    if (mobile) {
      queryObject.mobile = mobile;
    }

    let user = await Customer.find(queryObject);

    if (user.length != 0) {
      return res.status(400).json({ error: "mobile-exists" });
    }

    queryObject = {};
    if (email) {
      queryObject.email = { $regex: email, $options: "i" };
    }
    user = await Customer.find(queryObject);

    if (user.length != 0) {
      return res.status(400).json({ error: "email-exists" });
    }

    aObj = new Address(address[0]);
    const address1 = await aObj.save();
    req.body.address[0] = address1._id;

    console.log(req.body);
    cObj = new Customer(req.body);
    let result = await cObj.save();
    result = await result.populate({ path: "address", model: "Address" });

    try {
      const req1 = {
        firstname: cObj["firstname"],
        lastname: cObj["lastname"],
        company_name: "",
        email: cObj["email"],
        phone: cObj["mobile"],
        // note: "Customer",
        note: `customer/${cObj["_id"]}`,
        // "address": {
        //   "street": "500 Electric Ave",
        //   "appartment": "Suite 600",
        //   "city": "New York",
        //   "state": "NY",
        //   "zipcode": "10003",
        //   "country": "US"
        // }
      };
      const res1 = await createCustomerForAPI(req1);
      if (res1 != null) {
        const updateData = cObj;
        updateData.sqReference = res1.customer.id;

        const _id = cObj["_id"];
        let data = await Customer.findByIdAndUpdate(_id, updateData, {
          new: true,
        });

        if (data === null) {
          return res.status(200).json({ error: "id not found" });
        }
        data = await data.populate({ path: "address", model: "Address" });
        return res.status(200).json(data);
      } else {
        console.log("customer not added");
      }
    } catch (e1) {
      console.log(e1);
      console.log("failed to customer");
    }
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(400).json(getErrorFromCatch(e));
  }
};

const updateCustomer = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Customer.findByIdAndUpdate(_id, req.body, { new: true });

    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    data = await data.populate({ path: "address", model: "Address" });
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Customer.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getCustomer = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Customer.findById(_id).populate({
      path: "address",
      model: "Address",
    });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getAllCustomer = async (req, res) => {
  try {
    const { sort, select, count, isTotal } = req.query;
    const {
      token,
      firstname,
      lastname,
      mobile,
      email,
      location,
      address,
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

      Customer.ensureIndexes({ location: "2dsphere" });
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

    let apiData = Customer.find(queryObject).populate({
      path: "address",
      model: "Address",
    });
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

    if (count) {
      if (isTotal) {
        apiData = apiData.estimatedDocumentCount(); //total
      } else {
        apiData = apiData.countDocuments(queryObject);
      }
      const data = await apiData;
      res.status(200).json({ result: "success", data });
    } else {
      // apiData = apiData.skip(skip).limit(limit);
      // apiData = apiData.skip(skip).limit(limit).sort({ createAt: 1 });
      apiData = apiData.skip(skip).limit(limit).sort({ createAt: -1 });
      const data = await apiData;
      res.status(200).json({ count: data.length, data });
    }
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const findNearByMeCustomer = async (req, res) => {
  try {
    const { sort, select, count, isTotal } = req.query;
    const {
      firstname,
      lastname,
      mobile,
      email,
      location,
      address,
      active,
      deleted,
      longitude,
      latitude,
      radius,
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

    if (location) {
      queryObject.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseFloat(radius || 1) * 1000,
        },
      };
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

    let apiData = Customer.find(queryObject).populate({
      path: "address",
      model: "Address",
    });
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

module.exports = {
  getAllCustomer,
  getCustomer,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  findNearByMeCustomer,
};
