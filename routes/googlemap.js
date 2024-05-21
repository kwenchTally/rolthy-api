const express = require("express");
const router = express.Router();

const { getPlaces } = require("../controllers/googlemap");

router.route("/places").post(getPlaces);

module.exports = router;
