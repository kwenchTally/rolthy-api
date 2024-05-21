const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  fileView,
  fileUploadView,
  uploadFile,
  uploadMultiFile,
} = require("../controllers/uploader");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.route("/").get(fileUploadView);
router.route("/:id").get(fileView);
router.route("/upload").post(uploadFile);
router.post("/multi-upload", upload.array("file", 5), uploadMultiFile);

module.exports = router;
