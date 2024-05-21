const express = require("express");
const router = express.Router();

const {
  getAllRatingProduct,
  getRatingProduct,
  addRatingProduct,
  updateRatingProduct,
  deleteRatingProduct,
} = require("../controllers/ratingproducts");

router.route("/").post(getAllRatingProduct);
router.route("/add").post(addRatingProduct);
router.route("/get/").post(getRatingProduct);
router.route("/update/:id").post(updateRatingProduct);
router.route("/delete/:id").post(deleteRatingProduct);

module.exports = router;
