const fs = require("fs");
const path = require("path");
const url = require("url");
const request = require("request");

const fileView = async (req, res) => {
  const request = url.parse(req.url, true);
  const action = request.pathname;
  const filePath = path
    .join(__dirname, action)
    .split("%20")
    .join(" ")
    .replace(`controllers`, "uploads");

  console.log(filePath);

  fs.exists(filePath, function (exists) {
    if (!exists) {
      res.writeHead(404, {
        "Content-Type": "text/plain",
      });
      res.end("404 Not Found");
      return;
    }

    const ext = path.extname(action);
    let contentType = "text/plain";

    if (ext === ".png") {
      contentType = "image/png";
    }

    res.writeHead(200, {
      "Content-Type": contentType,
    });

    fs.readFile(filePath, function (err, content) {
      res.end(content);
    });
  });
};

const fileUploadView = async (req, res) => {
  return res.render("uploader");
};

const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({
    message: "File uploaded successfully",
    filename: req.file.filename,
  });
};

const uploadMultiFile = async (req, res) => {
  if (!req.files) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  var files = [];
  req.files.forEach((f) => {
    files.push(f.filename);
  });
  res.json({ message: "File uploaded successfully", files: files });
};

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { NodeHttpHandler } = require("@aws-sdk/node-http-handler");

const multer = require("multer");
const multerS3 = require("multer-s3");

const spacesEndpoint = new URL(process.env.DO_BUCKET_URL).origin;
const s3 = new S3Client({
  endpoint: spacesEndpoint,
  region: process.env.DO_DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.DO_ACCESS_KEY,
    secretAccessKey: process.env.DO_SECRET_KEY,
  },
  forcePathStyle: true,
});

const bucketName = process.env.DO_BUCKET; //path

const uploadFileOnSpacesBucket = async (req, res) => {
  const { data, file, files } = req;
  const filePath = "";
  const keyName = path.basename(filePath);

  const params = {
    Bucket: bucketName,
    Key: keyName,
    Body: data,
    ACL: "public-read",
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Upload Success", data.Location);
    }
  });

  res.json({ message: "File uploaded successfully", files: files });
};

const upload1 = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type, only images are allowed!"), false);
    }
  },
}).array("upload", 1);

const uploadBucket = async (req, res) => {
  if (req.files.length === 0) {
    return res.status(400).send({ message: "No files uploaded." });
  }

  res.send({
    message: "Uploaded!",
    urls: req.files.map((file) => ({
      url: `image/src?name=${file.key}&type=${req.path.replaceAll("/", "")}`,
    })),
  });
};

const upload_customer = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName + ".customers",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type, only images are allowed!"), false);
    }
  },
}).array("file", 1);

const upload_driver = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName + ".drivers",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type, only images are allowed!"), false);
    }
  },
}).array("file", 1);

const upload_marketplace = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName + ".marketplaces",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type, only images are allowed!"), false);
    }
  },
}).array("file", 1);

const upload_product = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName + ".products",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type, only images are allowed!"), false);
    }
  },
}).array("file", 1);

const upload_document = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName + ".documents",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type, only images are allowed!"), false);
    }
  },
}).array("file", 10);

const upload_delivery = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName + ".deliveries",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type, only images are allowed!"), false);
    }
  },
}).array("file", 1);

const fetch = require("node-fetch");
const sharp = require("sharp");

const viewBucket = async (req, res) => {
  const { type, name } = req.query;
  const imageUrl = `${process.env.DO_BUCKET_CDN}/${process.env.DO_BUCKET}.${type}s/${name}`;
  console.log(imageUrl);

  if (!imageUrl) {
    return res.status(400).send("URL parameter is required");
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const image = sharp(buffer);
    const metadata = await image.metadata();
    const processedImage = await image.toBuffer();

    const mimeType = metadata.format
      ? `image/${metadata.format}`
      : "application/octet-stream";
    res.set("Content-Type", mimeType);

    res.send(processedImage);
  } catch (error) {
    console.error("Error rendering image:", error);
    res.status(500).send("Error rendering image");
  }
};

module.exports = {
  fileView,
  fileUploadView,
  uploadFile,
  uploadMultiFile,
  uploadFileOnSpacesBucket,
  uploadBucket,
  upload1,
  upload_customer,
  upload_driver,
  upload_marketplace,
  upload_product,
  upload_document,
  upload_delivery,
  viewBucket,
};
