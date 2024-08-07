const express = require("express");
const router = express.Router();

const {
  getAllPreference,
  getPreference,
  addPreference,
  updatePreference,
  deletePreference,
} = require("../controllers/preferences");

router.route("/").post(getAllPreference);
router.route("/add").post(addPreference);
router.route("/get/").post(getPreference);
router.route("/update/:id").post(updatePreference);
router.route("/delete/:id").post(deletePreference);

module.exports = router;
