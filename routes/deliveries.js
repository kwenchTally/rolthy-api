const express = require("express");
const router = express.Router();

const {
  getAllDelivery,
  getDelivery,
  addDelivery,
  updateDelivery,
  deleteDelivery,
} = require("../controllers/deliveries");

router.route("/").post(getAllDelivery);
router.route("/add").post(addDelivery);
router.route("/get/").post(getDelivery);
router.route("/update/:id").post(updateDelivery);
router.route("/delete/:id").post(deleteDelivery);

module.exports = router;
