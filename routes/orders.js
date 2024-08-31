const express = require("express");
const router = express.Router();

const {
  getAllOrder,
  getOrder,
  addOrder,
  updateOrder,
  deleteOrder,
  getOrderSummary,
  getOrderSummary1,
} = require("../controllers/orders");

router.route("/").post(getAllOrder);
router.route("/add").post(addOrder);
router.route("/get/").post(getOrder);
router.route("/update/:id").post(updateOrder);
router.route("/delete/:id").post(deleteOrder);
router.route("/summery").post(getOrderSummary);
router.route("/summery1").post(getOrderSummary1);

module.exports = router;
