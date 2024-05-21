const express = require("express");
const router = express.Router();

const {
  getLocations,
  getPayments,
  getCustomers,
  getCards,

  createPayment,
  createCustomer,
  createCard,

  verifyBuyer,
} = require("../controllers/square");

router.route("/locations").post(getLocations);
router.route("/payments").post(getPayments);
router.route("/payment").post(createPayment);
router.route("/customers").post(getCustomers);
router.route("/customer/create").post(createCustomer);
router.route("/cards").post(getCards);
router.route("/card/create").post(createCard);
router.route("/card/verify").post(verifyBuyer);

module.exports = router;
