const express = require("express");
const router = express.Router();

const {
  getAllStatement,
  getStatement,
  addStatement,
  updateStatement,
  deleteStatement,
} = require("../controllers/statements");

router.route("/").post(getAllStatement);
router.route("/add").post(addStatement);
router.route("/get/").post(getStatement);
router.route("/update/:id").post(updateStatement);
router.route("/delete/:id").post(deleteStatement);

module.exports = router;
