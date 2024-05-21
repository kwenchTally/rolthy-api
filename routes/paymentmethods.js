const express = require("express");
const router = express.Router();

const {
  getAllPaymentMethod,
  getPaymentMethod,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  getMethod,
} = require("../controllers/paymentmethods");

router.route("/").post(getAllPaymentMethod);
router.route("/add").post(addPaymentMethod);
router.route("/get/").post(getPaymentMethod);
router.route("/update/:id").post(updatePaymentMethod);
router.route("/delete/:id").post(deletePaymentMethod);
router.route("/method").get(getMethod);

module.exports = router;
