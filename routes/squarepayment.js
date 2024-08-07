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
  getSubscriptionPlanVariations,

  createPlan,
  createItem,
  createSubscription,

  getTransactions,
  generatePaymentCard,

  processPayment,
  processSubscription,
  viewPayment,
  subscription,

  createDiscount,
  createTax,
  createOrderWithCharge,

  newSubscriptionPlan,
  newSubscriptionPlanVariation,
  newSubscription,

  attachCard,
  disableCard,
} = require("../controllers/square");

router.route("/locations").post(getLocations);
router.route("/payments").post(getPayments);
router.route("/payment").post(createPayment);
router.route("/customers").post(getCustomers);
router.route("/create/customer").post(createCustomer);
router.route("/cards").post(getCards);
router.route("/create/card").post(createCard);
router.route("/card/verify").post(verifyBuyer);

router.route("/items").post(getItems);
router.route("/plans").post(getPlans);
router.route("/subscriptions").post(getSubscriptions);
router.route("/subscriptions/variations").post(getSubscriptionPlanVariations);

router.route("/create/item").post(createItem);
router.route("/create/plan").post(createPlan);
router.route("/create/subscription").post(createSubscription);

router.route("/transactions").post(getTransactions);
router.route("/generate-payment").get(generatePaymentCard);

router.route("/process-payment").post(processPayment);
router.route("/process-subscription").post(processSubscription);
router.route("/process").post(viewPayment);
router.route("/process").get(viewPayment);

router.route("/add/subscription").post(subscription);

router.route("/create/discount").post(createDiscount);
router.route("/create/tax").post(createTax);
router.route("/create/order").post(createOrderWithCharge);

router.route("/new/plan").post(newSubscriptionPlan);
router.route("/new/frequency").post(newSubscriptionPlanVariation);
router.route("/new/subscription").post(newSubscription);

router.route("/card/attach").post(attachCard);
router.route("/card/inactive").post(disableCard);

module.exports = router;
