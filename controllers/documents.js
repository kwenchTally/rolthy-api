const { getErrorFromCatch } = require("../helper/functions");
const Document = require("../models/document");

const addDocument = async (req, res) => {
  try {
    cObj = new Document(req.body);
    const result = await cObj.save();
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const updateDocument = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Document.findByIdAndUpdate(_id, req.body, { new: true });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const deleteDocument = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Document.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getDocument = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Document.findById(_id).populate({
      path: "user",
      model: "Driver",
    });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getAllDocument = async (req, res) => {
  try {
    const { user, document, recent, verified, active, deleted, sort, select } =
      req.query;
    const queryObject = {};

    if (user) {
      queryObject.firstname = { $regex: user, $options: "i" };
    }

    if (document) {
      queryObject.document = { $regex: document, $options: "i" };
    }

    if (recent) {
      queryObject.new = recent;
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

    let apiData = Document.find(queryObject).populate({
      path: "user",
      model: "Driver",
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
    res.status(200).json({ data, count: data.length });
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

module.exports = {
  getAllDocument,
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
};
