const express = require("express");
const router = express.Router();

const {
  getAllPayment,
  getPayment,
  addPayment,
  updatePayment,
  deletePayment,
} = require("../controllers/payments");

router.route("/").post(getAllPayment);
router.route("/add").post(addPayment);
router.route("/get/").post(getPayment);
router.route("/update/:id").post(updatePayment);
router.route("/delete/:id").post(deletePayment);

module.exports = router;
