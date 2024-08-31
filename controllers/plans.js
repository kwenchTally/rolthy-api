const { getErrorFromCatch } = require("../helper/functions");
const Plan = require("../models/plan");
const { newSubscriptionPlanVariationAPI } = require("../controllers/square");

const addPlan = async (req, res) => {
  try {
    cObj = new Plan(req.body);
    let result = await cObj.save();
    result = await result.populate();

    try {
      const req1 = {
        planId: req.body.sqStoreReference,
        planVariation: {
          name: cObj["name"],
          frequency: [
            {
              name: cObj["billing"],
              price: cObj["price"],
              period: cObj["billingPeriod"],
            },
          ],
        },
      };
      const res1 = await newSubscriptionPlanVariationAPI(req1);
      if (res1 != null) {
        const updateData = cObj;
        updateData.sqPlanReference = res1.id;

        const _id = cObj["_id"];
        let data = await Plan.findByIdAndUpdate(_id, updateData, {
          new: true,
        });

        if (data === null) {
          return res.status(200).json({ error: "id not found" });
        }
        data = await data.populate();
        return res.status(200).json(data);
      } else {
        console.log("plan not added");
      }
    } catch (e1) {
      console.log(e1);
      console.log("failed to plan");
    }
  } catch (e) {
    console.log(e);
    res.status(400).json(getErrorFromCatch(e));
  }
};

const updatePlan = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Plan.findByIdAndUpdate(_id, req.body, { new: true });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const deletePlan = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Plan.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getPlan = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Plan.findById(_id).populate({
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

const getAllPlan = async (req, res) => {
  try {
    const { sort, select, count, isTotal } = req.query;
    const {
      name,
      description,
      price,
      marketplace,
      billing,
      available,
      deleted,
      featured,
      discount,
      distinct,
      items,
    } = req.body;
    const queryObject = {};

    if (name) {
      queryObject.name = { $regex: name, $options: "i" };
    }

    if (price) {
      queryObject.price = price;
    }

    if (billing) {
      queryObject.billing = billing;
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

    if (discount) {
      queryObject.discount = discount;
    }

    if (items) {
      queryObject.items = { $eq: items };
    }

    let apiData = Plan.find(queryObject).populate([
      {
        path: "marketplace",
        model: "MarketPlace",
      },
      {
        path: "items",
        model: "Product",
      },
    ]);

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

    if (count) {
      if (isTotal) {
        apiData = apiData.estimatedDocumentCount(); //total
      } else {
        apiData = apiData.countDocuments(queryObject);
      }
      const data = await apiData;
      res.status(200).json({ result: "success", data });
    } else {
      // apiData = apiData.skip(skip).limit(limit).sort({ createAt: -1 });
      if (distinct) {
        apiData = apiData.distinct(distinct);
      } else {
        apiData = apiData.skip(skip).limit(limit);
      }
      const data = await apiData;
      res.status(200).json({ count: data.length, data });
    }
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

module.exports = {
  getAllPlan,
  getPlan,
  addPlan,
  updatePlan,
  deletePlan,
};
