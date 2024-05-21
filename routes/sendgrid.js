const express = require("express");
const router = express.Router();

const { sendMail, sendSMS } = require("../controllers/sendgrid");

router.route("/mail").post(sendMail);
router.route("/sms").post(sendSMS);

module.exports = router;
