const express = require("express");
const router = express.Router();

const { sendNotification, sendNotification1 } = require("../controllers/fcm");

router.route("/").post(sendNotification1);

module.exports = router;
