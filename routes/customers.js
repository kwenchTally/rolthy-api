const express = require("express");
const router = express.Router();

const {
  getAllCustomer,
  getCustomer,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  findNearByMeCustomer,
} = require("../controllers/customers");

router.route("/").post(getAllCustomer);
router.route("/nearBy").post(findNearByMeCustomer);
router.route("/add").post(addCustomer);
router.route("/get/").post(getCustomer);
router.route("/update/:id").post(updateCustomer);
router.route("/delete/:id").post(deleteCustomer);

module.exports = router;
