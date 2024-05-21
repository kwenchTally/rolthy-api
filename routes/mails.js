const express = require("express");
const router = express.Router();

const {
  getAllMail,
  getMail,
  addMail,
  updateMail,
  deleteMail,
} = require("../controllers/mails");

router.route("/").post(getAllMail);
router.route("/add").post(addMail);
router.route("/get/").post(getMail);
router.route("/update/:id").post(updateMail);
router.route("/delete/:id").post(deleteMail);

module.exports = router;
