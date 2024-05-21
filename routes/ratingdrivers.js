const express = require("express");
const router = express.Router();

const {
  getAllRatingDriver,
  getRatingDriver,
  addRatingDriver,
  updateRatingDriver,
  deleteRatingDriver,
} = require("../controllers/ratingdrivers");

router.route("/").post(getAllRatingDriver);
router.route("/add").post(addRatingDriver);
router.route("/get/").post(getRatingDriver);
router.route("/update/:id").post(updateRatingDriver);
router.route("/delete/:id").post(deleteRatingDriver);

module.exports = router;
