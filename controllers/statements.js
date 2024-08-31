const { getErrorFromCatch } = require("../helper/functions");
const Statement = require("../models/statement");

const addStatement = async (req, res) => {
  try {
    cObj = new Statement(req.body);
    const result = await cObj.save();
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const updateStatement = async (req, res) => {
  try {
    if (req.body.statements) {
      let data = await Statement.bulkWrite(
        req.body.Statements.map((statement) => ({
          updateOne: {
            filter: {
              _id: Statement._id,
              customer: Statement.customer,
              removed: false,
            },
            update: { $set: Statement },
          },
        }))
      );

      if (data === null) {
        return res.status(200).json({ error: "id not found" });
      }
      res.status(200).json(data);
    } else {
      const _id = req.params.id;
      let data = await Statement.findByIdAndUpdate(_id, req.body, {
        new: true,
      });
      if (data === null) {
        return res.status(200).json({ error: "id not found" });
      }
      res.status(200).json(data);
    }
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const deleteStatement = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Statement.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getStatement = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Statement.findById(_id)
      .populate({ path: "customer", model: "Customer" })
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

const getAllStatement = async (req, res) => {
  try {
    const { filter, sort, select } = req.query;
    const {
      customer,
      marketplace,
      driver,
      reference,
      amount,
      name,
      note,
      status,
      active,
      deleted,
      createAt,
    } = req.body;

    const queryObject = {};

    if (customer) {
      queryObject.customer = customer;
    }

    if (marketplace) {
      queryObject.marketplace = marketplace;
    }

    if (driver) {
      queryObject.driver = driver;
    }

    if (reference) {
      queryObject.reference = reference;
    }

    if (amount) {
      queryObject.amount = amount;
    }

    if (name) {
      queryObject.name = { $regex: name, $options: "i" };
    }

    if (note) {
      queryObject.note = { $regex: note, $options: "i" };
    }

    if (status) {
      queryObject.status = status;
    }

    if (active) {
      queryObject.active = active;
    }

    if (deleted) {
      queryObject.deleted = deleted;
    }

    if (createAt) {
    }

    let apiData = Statement.find(queryObject);

    if (sort) {
      let sortFix = sort.replace(",", " ");
      console.log(`sort ${sortFix}`);
      apiData = apiData.sort(sortFix);
    }

    if (select) {
      let selectFix = select.split(",").join(" ");
      console.log(`select ${selectFix}`);
      apiData = apiData.select(selectFix);

      if (selectFix.includes("product")) {
        apiData = apiData.populate({
          path: "products",
          model: "Product",
          populate: {
            path: "marketplace",
            model: "MarketPlace",
            populate: [{ path: "address", model: "Address" }],
          },
        });
      }
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
      }
    }

    apiData.populate([]);

    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 25;
    let skip = (page - 1) * limit;

    apiData = apiData.skip(skip).limit(limit).sort({ createAt: 1 });

    const data = await apiData;
    res.status(200).json({ count: data.length, data });
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

module.exports = {
  getAllStatement,
  getStatement,
  addStatement,
  updateStatement,
  deleteStatement,
};
