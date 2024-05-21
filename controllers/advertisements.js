const { getErrorFromCatch } = require("../helper/functions");
const Advertisement = require("../models/advertisement");

const addAdvertisement = async (req, res) => {
  try {
    cObj = new Advertisement(req.body);
    const result = await cObj.save();
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const updateAdvertisement = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Advertisement.findByIdAndUpdate(_id, req.body, {
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

const deleteAdvertisement = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Advertisement.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getAdvertisement = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Advertisement.findById(_id)
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

const getAllAdvertisement = async (req, res) => {
  try {
    const {
      marketplace,
      product,
      reference,
      price,
      description,
      category,
      show,
      deleted,
      end,
      start,
      sort,
      select,
    } = req.query;
    const queryObject = {};

    if (marketplace) {
    }

    if (product) {
    }

    if (reference) {
      queryObject.reference = { $regex: reference, $options: "i" };
    }

    if (price) {
      queryObject.price = price;
    }

    if (description) {
      queryObject.description = { $regex: description, $options: "i" };
    }

    if (category) {
      queryObject.category = { $regex: category, $options: "i" };
    }

    if (show) {
      queryObject.show = show;
    }

    if (deleted) {
      queryObject.deleted = deleted;
    }

    if (start) {
      queryObject.createAt = { $regex: start, $options: "i" };
    }

    if (end) {
      queryObject.endAt = { $regex: end, $options: "i" };
    }

    let apiData = Advertisement.find(queryObject);

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
        apiData.populate({ path: "product", model: "Product" });
      }
      if (selectFix.includes("marketplace")) {
        apiData.populate({
          path: "marketplace",
          model: "MarketPlace",
          populate: [
            { path: "address", model: "Address" },
            { path: "items", model: "Product" },
          ],
        });
      }
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
  getAllAdvertisement,
  getAdvertisement,
  addAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
};
