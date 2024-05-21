const express = require("express");
const router = express.Router();

const {
  getAllSubscription,
  getSubscription,
  addSubscription,
  updateSubscription,
  deleteSubscription,
} = require("../controllers/subscriptions");

router.route("/").post(getAllSubscription);
router.route("/add").post(addSubscription);
router.route("/get/").post(getSubscription);
router.route("/update/:id").post(updateSubscription);
router.route("/delete/:id").post(deleteSubscription);

module.exports = router;
