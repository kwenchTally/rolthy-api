const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  fileView,
  fileUploadView,
  uploadFile,
  uploadMultiFile,
  uploadFileOnSpacesBucket,
  upload1,
  uploadBucket,
  upload_customer,
  upload_driver,
  upload_marketplace,
  upload_product,
  upload_document,
  viewBucket,
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
router.route("/src/:id").get(fileView);
router.route("/upload").post(uploadFile);
router.post("/multi-upload", upload.array("file", 5), uploadMultiFile);
router.route("/bucket").post(uploadFileOnSpacesBucket);
router.post("/push", (req, res, next) => {
  upload1(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).send({ message: err.message });
    } else if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ message: "An error occurred during upload." });
    }
    uploadBucket(req, res);
  });
});

router.post("/customer", (req, res, next) => {
  upload_customer(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).send({ message: err.message });
    } else if (err) {
      console.log(err);
      return res.status(400).send({ message: err.message });
    }
    uploadBucket(req, res);
  });
});

router.post("/driver", (req, res, next) => {
  upload_driver(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).send({ message: err.message });
    } else if (err) {
      console.log(err);
      return res.status(400).send({ message: err.message });
    }
    uploadBucket(req, res);
  });
});

router.post("/marketplace", (req, res, next) => {
  upload_marketplace(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).send({ message: err.message });
    } else if (err) {
      console.log(err);
      return res.status(400).send({ message: err.message });
    }
    uploadBucket(req, res);
  });
});

router.post("/product", (req, res, next) => {
  upload_product(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).send({ message: err.message });
    } else if (err) {
      console.log(err);
      return res.status(400).send({ message: err.message });
    }
    uploadBucket(req, res);
  });
});

router.post("/document", (req, res, next) => {
  upload_document(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).send({ message: err.message });
    } else if (err) {
      console.log(err);
      return res.status(400).send({ message: err.message });
    }
    uploadBucket(req, res);
  });
});

router.route("/src").get(viewBucket);

module.exports = router;
