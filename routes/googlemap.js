const express = require("express");
const router = express.Router();

const {
  getPlaces,
  getLocations,
  getShortestDistances,
  getShortestDistancesUsingDijkstra,
  getShortestDistances1,
  getRoutes,
} = require("../controllers/googlemap");

router.route("/places").post(getPlaces);
router.route("/locations").post(getLocations);
router.route("/shortest-distances").post(getShortestDistances);
router.route("/find-shortest").post(getShortestDistancesUsingDijkstra);
router.route("/paths/find").post(getShortestDistances1);
router.route("/routes").post(getRoutes);

module.exports = router;
