const express = require("express");
const router = express.Router();

const { sendNotification } = require("../controllers/fcm");

router.route("/").post(sendNotification);

module.exports = router;
