const { getErrorFromCatch } = require("../helper/functions");
const Favourite = require("../models/favourite");

const addFavourite = async (req, res) => {
  try {
    let data = await Favourite.find({
      customer: req.body.customer,
      item: req.body.item,
    });

    if (data.length != 0) {
      return res.status(400).json({ error: "data-exists" });
    }

    let cObj = new Favourite(req.body);
    let result = await cObj.save();
    result = await result.populate([
      { path: "item", model: "Product" },
      {
        path: "customer",
        model: "Customer",
        select: "firstname lastname mobile email",
      },
    ]);
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const updateFavourite = async (req, res) => {
  try {
    const _id = req.params.id;
    let cObj = Favourite.findByIdAndUpdate(_id, req.body, { new: true });
    if (cObj === null) {
      return res.status(200).json({ error: "id not found" });
    }
    let result = await cObj.save();
    result = await result.populate([
      { path: "item", model: "Product" },
      {
        path: "customer",
        model: "Customer",
        select: "firstname lastname mobile email",
      },
    ]);
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const deleteFavourite = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Favourite.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getFavourite = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Favourite.findById(_id).populate({
      path: "item",
      model: "Product",
    });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getAllFavourite = async (req, res) => {
  try {
    const {
      customer,
      firstname,
      lastname,
      item,
      favourite,
      available,
      deleted,
      sort,
      select,
    } = req.body;
    const queryObject = {};

    if (customer) {
      queryObject.customer = { $eq: customer };
    }

    let filter = {};
    if (firstname) {
      filter.firstname = { $in: firstname };
    }
    if (lastname) {
      filter.lastname = { $in: lastname };
    }

    if (item) {
      queryObject.item = { $regex: item, $options: "i" };
    }

    if (favourite) {
      queryObject.favourite = favourite;
    }

    if (available) {
      queryObject.available = available;
    }

    if (deleted) {
      queryObject.deleted = deleted;
    }

    let apiData = Favourite.find(queryObject)
      .populate({
        path: "item",
        model: "Product",
        populate: [{ path: "marketplace", model: "MarketPlace" }],
      })
      .populate({
        path: "customer",
        model: "Customer",
        transform: (doc) => {
          return doc;
        },
        select: "firstname lastname mobile email",
        match: filter,
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

    apiData = apiData.skip(skip).limit(limit);

    const data = await apiData;
    res.status(200).json({ count: data.length, data });
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

module.exports = {
  getAllFavourite,
  getFavourite,
  addFavourite,
  updateFavourite,
  deleteFavourite,
};
