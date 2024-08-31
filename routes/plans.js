const express = require("express");
const router = express.Router();

const {
  getAllPlan,
  getPlan,
  addPlan,
  updatePlan,
  deletePlan,
} = require("../controllers/plans");

router.route("/").post(getAllPlan);
router.route("/add").post(addPlan);
router.route("/get/").post(getPlan);
router.route("/update/:id").post(updatePlan);
router.route("/delete/:id").post(deletePlan);

module.exports = router;
