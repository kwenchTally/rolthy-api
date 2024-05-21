const express = require("express");
const router = express.Router();

const {
  getAllNotification,
  getNotification,
  addNotification,
  updateNotification,
  deleteNotification,
} = require("../controllers/notifications");

router.route("/").post(getAllNotification);
router.route("/add").post(addNotification);
router.route("/get/").post(getNotification);
router.route("/update/:id").post(updateNotification);
router.route("/delete/:id").post(deleteNotification);

module.exports = router;
