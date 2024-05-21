const express = require("express");
const router = express.Router();

const {
  getAllOtp,
  getOtp,
  addOtp,
  updateOtp,
  deleteOtp,
  generateOtp,
  verifyOtp,
} = require("../controllers/otps");

router.route("/generate").post(generateOtp);
router.route("/verify").post(verifyOtp);
router.route("/").post(getAllOtp);
router.route("/add").post(addOtp);
router.route("/get/").post(getOtp);
router.route("/update/:id").post(updateOtp);
router.route("/delete/:id").post(deleteOtp);

module.exports = router;
