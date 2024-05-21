const express = require("express");
const router = express.Router();

const {
  getAllDriver,
  getDriver,
  addDriver,
  updateDriver,
  deleteDriver,
} = require("../controllers/drivers");

router.route("/").post(getAllDriver);
router.route("/add").post(addDriver);
router.route("/get/").post(getDriver);
router.route("/update/:id").post(updateDriver);
router.route("/delete/:id").post(deleteDriver);

module.exports = router;
