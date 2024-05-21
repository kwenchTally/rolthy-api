const express = require("express");
const router = express.Router();

const {
  getAllAdvertisement,
  getAdvertisement,
  addAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
} = require("../controllers/advertisements");

router.route("/").post(getAllAdvertisement);
router.route("/add").post(addAdvertisement);
router.route("/get/").post(getAdvertisement);
router.route("/update/:id").post(updateAdvertisement);
router.route("/delete/:id").post(deleteAdvertisement);

module.exports = router;
