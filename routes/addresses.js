const express = require("express");
const router = express.Router();

const {
  getAllAddress,
  getAddress,
  addAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/addresses");

router.route("/").post(getAllAddress);
router.route("/add").post(addAddress);
router.route("/get/").post(getAddress);
router.route("/update/:id").post(updateAddress);
router.route("/delete/:id").post(deleteAddress);

module.exports = router;
