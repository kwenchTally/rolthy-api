const { getErrorFromCatch } = require("../helper/functions");
const Marketplace = require("../models/marketplace");
const Address = require("../models/address");
const { createCustomerForAPI } = require("../controllers/square");

const addMarketplace = async (req, res) => {
  try {
    const { mobile, email, address } = req.body;
    var queryObject = {};

    if (mobile) {
      queryObject.mobile = mobile;
    }

    let user = await Marketplace.find(queryObject);

    if (user.length != 0) {
      return res.status(400).json({ error: "mobile-exists" });
    }

    queryObject = {};
    if (email) {
      queryObject.email = { $regex: email, $options: "i" };
    }
    user = await Marketplace.find(queryObject);

    if (user.length != 0) {
      return res.status(400).json({ error: "email-exists" });
    }

    aObj = new Address(address[0]);
    const address1 = await aObj.save();
    req.body.address[0] = address1._id;

    console.log(req.body);
    cObj = new Marketplace(req.body);
    let result = await cObj.save();
    result = await result.populate({ path: "address", model: "Address" });

    try {
      const req1 = {
        firstname: cObj["firstname"] || "",
        lastname: cObj["lastname"] || "",
        company_name: cObj["name"],
        email: cObj["email"],
        phone: cObj["mobile"],
        note: `marketplace/${cObj["_id"]}`,
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

        const req2 = {
          plan: {
            name: cObj["name"],
            frequency: [],
          },
        };

        const res2 = await newSubscriptionPlanAPI(req2);
        updateData.sqStoreReference = res2.id;

        const _id = cObj["_id"];
        let data = await Marketplace.findByIdAndUpdate(_id, updateData, {
          new: true,
        });

        if (data === null) {
          return res.status(200).json({ error: "id not found" });
        }
        data = await data.populate([
          { path: "address", model: "Address" },
          { path: "items", model: "Product" },
          { path: "plans", model: "Plan" },
        ]);
        return res.status(200).json(data);
      } else {
        console.log("marketplace not added");
      }
    } catch (e1) {
      console.log(e1);
      console.log("failed to marketplace");
    }
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
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
    data = await data.populate([
      { path: "address", model: "Address" },
      { path: "items", model: "Product" },
      { path: "plans", model: "Plan" },
    ]);
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
      .populate({ path: "items", model: "Product" })
      .populate({ path: "plans", model: "Plan" });
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
    const { sort, select, count, isTotal } = req.query;
    const {
      token,
      name,
      firstname,
      lastname,
      mobile,
      email,
      description,
      location,
      address,
      rating,
      status,
      slots,
      category,
      subcategory,
      available,
      deleted,
    } = req.body;
    const queryObject = {};

    if (name) {
      queryObject.name = { $regex: name, $options: "i" };
    }

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
          $maxDistance: parseFloat(searchDistance) * 1000, // 1km // 1000m => 0.621371 mile // 1 mile => 1.60934 km
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

    if (status) {
      queryObject.status = { $regex: status, $options: "i" };
    }

    if (slots) {
      queryObject.slots = { $eq: slots };
    }

    if (category) {
      queryObject.category = category;
    }

    if (subcategory) {
      queryObject.subcategory = subcategory;
    }

    if (available) {
      queryObject.available = available;
    }

    if (deleted) {
      queryObject.deleted = deleted;
    }

    let apiData = Marketplace.find(queryObject)
      .populate({ path: "address", model: "Address" })
      .populate({ path: "items", model: "Product" })
      .populate({ path: "plans", model: "Plan" });

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
  getAllMarketplace,
  getMarketplace,
  addMarketplace,
  updateMarketplace,
  deleteMarketplace,
};
