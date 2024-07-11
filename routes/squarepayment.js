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

  getItems,
  getPlans,
  getSubscriptions,

  createPlan,
  createItem,
  createSubscription,

  getTransactions,
  generatePaymentCard,
} = require("../controllers/square");

router.route("/locations").post(getLocations);
router.route("/payments").post(getPayments);
router.route("/payment").post(createPayment);
router.route("/customers").post(getCustomers);
router.route("/customer/create").post(createCustomer);
router.route("/cards").post(getCards);
router.route("/card/create").post(createCard);
router.route("/card/verify").post(verifyBuyer);

router.route("/items").post(getItems);
router.route("/plans").post(getPlans);
router.route("/subscriptions").post(getSubscriptions);

router.route("/create/item").post(createItem);
router.route("/create/plan").post(createPlan);
router.route("/create/subscription").post(createSubscription);

router.route("/transactions").post(getTransactions);
// router.route("/generate-payment").post(generatePaymentCard);
router.route("/generate-payment").get(generatePaymentCard);

module.exports = router;
