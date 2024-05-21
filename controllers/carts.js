const { getErrorFromCatch } = require("../helper/functions");
const Cart = require("../models/cart");

const addCart = async (req, res) => {
  try {
    cObj = new Cart(req.body);
    const result = await cObj.save();
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const updateCart = async (req, res) => {
  try {
    if (req.body.carts) {
      let data = await Cart.bulkWrite(
        req.body.carts.map((cart) => ({
          updateOne: {
            filter: {
              _id: cart._id,
              customer: cart.customer,
              removed: false,
            },
            update: { $set: cart },
          },
        }))
      );

      if (data === null) {
        return res.status(200).json({ error: "id not found" });
      }
      res.status(200).json(data);
    } else {
      const _id = req.params.id;
      let data = await Cart.findByIdAndUpdate(_id, req.body, { new: true });
      if (data === null) {
        return res.status(200).json({ error: "id not found" });
      }
      res.status(200).json(data);
    }
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const deleteCart = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Cart.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getCart = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Cart.findById(_id)
      .populate({ path: "delivery_address", model: "Address" })
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

const getAllCart = async (req, res) => {
  try {
    const { filter, sort, select } = req.query;
    const {
      customer,
      marketplace,
      product,
      quantity,
      discount,
      tax,
      removed,
      status,
      deleted,
      date,
    } = req.body;
    const queryObject = {};

    if (customer) {
      queryObject.customer = { $eq: customer };
    }

    queryObject.removed = removed;

    if (marketplace) {
      queryObject.marketplace = { $regex: marketplace, $options: "i" };
    }

    if (product) {
      queryObject.product = { $regex: product, $options: "i" };
    }

    if (filter) {
    }

    if (quantity) {
      queryObject.quantity = { $regex: quantity, $options: "i" };
    }

    if (discount) {
      queryObject.discount = { $regex: discount, $options: "i" };
    }

    if (tax) {
      queryObject.tax = { $regex: tax, $options: "i" };
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

    console.log(queryObject);

    let apiData = Cart.find(queryObject);

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

    apiData.populate([
      {
        path: "customer",
        model: "Customer",
      },
      {
        path: "marketplace",
        model: "MarketPlace",
        populate: [{ path: "address", model: "Address" }],
      },
      {
        path: "item",
        model: "Product",
        populate: [{ path: "marketplace", model: "MarketPlace" }],
      },
    ]);

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
  getAllCart,
  getCart,
  addCart,
  updateCart,
  deleteCart,
};
