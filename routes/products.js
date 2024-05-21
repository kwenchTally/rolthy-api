const express = require("express");
const router = express.Router();

const {
  getAllProduct,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/products");

router.route("/").post(getAllProduct);
router.route("/add").post(addProduct);
router.route("/get/").post(getProduct);
router.route("/update/:id").post(updateProduct);
router.route("/delete/:id").post(deleteProduct);

module.exports = router;
