const express = require("express");
const router = express.Router();

const {
  getAllDocument,
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
} = require("../controllers/Documents");

router.route("/").post(getAllDocument);
router.route("/add").post(addDocument);
router.route("/get/").post(getDocument);
router.route("/update/:id").post(updateDocument);
router.route("/delete/:id").post(deleteDocument);

module.exports = router;
