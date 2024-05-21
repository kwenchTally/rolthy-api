getErrorFromCatch = (e) => {
  let errMsg = "server error";
  let errCode = "Internal-Error";

  if (e.toString().trim().includes("MongoServerError: E11000 duplicate key")) {
    const str = e
      .toString()
      .substr(0, 150)
      .replace(/[^A-Z0-9]/gi, " ");
    errCode = str.includes("dup key    mobile")
      ? "Mobile-Exists"
      : str.includes("dup key    email")
      ? "Email-Exists"
      : "";
  }

  switch (errCode) {
    case "Mobile-Exists":
      errMsg = "mobile number already exists";
      break;
    case "Email-Exists":
      errMsg = "email id already exists";
      break;
  }

  return {
    "error-code": errCode,
    error: errMsg,
  };
};

var base64 = require("base-64");
var utf8 = require("utf8");

encodeString = (str) => {
  var text = str;
  var bytes = utf8.encode(text);
  var encoded = base64.encode(bytes);
  console.log(encoded);
  return encode;
};

decodeString = (str) => {
  var text = str;
  var bytes = utf8.decode(text);
  var decoded = base64.decode(bytes);
  console.log(decoded);
  return decode;
};

module.exports = {
  getErrorFromCatch,
  encodeString,
  decodeString,
};
