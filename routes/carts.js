const express = require("express");
const router = express.Router();

const {
  getAllCart,
  getCart,
  addCart,
  updateCart,
  deleteCart,
} = require("../controllers/carts");

router.route("/").post(getAllCart);
router.route("/add").post(addCart);
router.route("/get/").post(getCart);
router.route("/update/:id").post(updateCart);
router.route("/delete/:id").post(deleteCart);

module.exports = router;
