const express = require("express");
const router = express.Router();

const {
  getAllVehicle,
  getVehicle,
  addVehicle,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicles");

router.route("/").post(getAllVehicle);
router.route("/add").post(addVehicle);
router.route("/get/").post(getVehicle);
router.route("/update/:id").post(updateVehicle);
router.route("/delete/:id").post(deleteVehicle);

module.exports = router;
