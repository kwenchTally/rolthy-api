const express = require("express");
const router = express.Router();

const {
  getAllMarketplace,
  getMarketplace,
  addMarketplace,
  updateMarketplace,
  deleteMarketplace,
} = require("../controllers/marketplaces");

router.route("/").post(getAllMarketplace);
router.route("/add").post(addMarketplace);
router.route("/get/").post(getMarketplace);
router.route("/update/:id").post(updateMarketplace);
router.route("/delete/:id").post(deleteMarketplace);

module.exports = router;
