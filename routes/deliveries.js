const express = require("express");
const router = express.Router();

const {
  getAllDelivery,
  getDelivery,
  addDelivery,
  updateDelivery,
  deleteDelivery,
  getDeliverySummary,
  getDeliverySummary1,
} = require("../controllers/deliveries");

router.route("/").post(getAllDelivery);
router.route("/add").post(addDelivery);
router.route("/get/").post(getDelivery);
router.route("/update/:id").post(updateDelivery);
router.route("/delete/:id").post(deleteDelivery);
router.route("/summery").post(getDeliverySummary);
router.route("/summery1").post(getDeliverySummary1);

module.exports = router;
