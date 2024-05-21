const express = require("express");
const router = express.Router();

const {
  getAllRatingMarketplace,
  getRatingMarketplace,
  addRatingMarketplace,
  updateRatingMarketplace,
  deleteRatingMarketplace,
} = require("../controllers/ratingmarketplaces");

router.route("/").post(getAllRatingMarketplace);
router.route("/add").post(addRatingMarketplace);
router.route("/get/").post(getRatingMarketplace);
router.route("/update/:id").post(updateRatingMarketplace);
router.route("/delete/:id").post(deleteRatingMarketplace);

module.exports = router;
