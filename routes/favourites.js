const express = require("express");
const router = express.Router();

const {
  getAllFavourite,
  getFavourite,
  addFavourite,
  updateFavourite,
  deleteFavourite,
} = require("../controllers/favourites");

router.route("/").post(getAllFavourite);
router.route("/add").post(addFavourite);
router.route("/get/").post(getFavourite);
router.route("/update/:id").post(updateFavourite);
router.route("/delete/:id").post(deleteFavourite);

module.exports = router;
