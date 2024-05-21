const fs = require("fs");
const path = require("path");
const url = require("url");

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

module.exports = {
  fileView,
  fileUploadView,
  uploadFile,
  uploadMultiFile,
};
