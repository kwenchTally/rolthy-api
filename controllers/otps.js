const {
  getErrorFromCatch,
  encodeString,
  decodeString,
} = require("../helper/functions");
const Otp = require("../models/otp");
const { mailTo } = require("../controllers/sendgrid");

const randomNumberInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateOtp = async (req, res) => {
  try {
    let otpdata = {};
    if (
      (req.body.mobile != null && req.body.email == null) ||
      (req.body.mobile == null && req.body.email != null)
    ) {
      let num = randomNumberInRange(100, 999);
      let body = {
        mobile: req.body.mobile,
        email: req.body.email,
        otp: num,
      };

      let ref;
      if (req.body.email != null) {
        ref = await Otp.findOne({
          email: { $eq: req.body.email },
        });
      } else {
        ref = await Otp.findOne({
          mobile: { $eq: req.body.mobile },
        });
      }

      let result;
      if (ref != null && ref != {}) {
        const _id = ref.id;
        result = await Otp.findByIdAndUpdate(_id, body, { new: true });
      } else {
        cObj = new Otp(body);
        result = await cObj.save();
      }

      otpdata = {
        msg: "otp-generated",
        otp: num,
        mode: req.body.mobile == null ? "email" : "mobile",
      };

      if (req.body.email != null) {
        const sendOTPData = {
          to: [req.body.email],
          subject: "ROLTHY-OTP",
          text: `Dear User, Your OTP verification code for Rolthy App is ${num}. Please, Do not share it with other.`,
        };
        await mailTo(sendOTPData);
      } else {
        const sendOTPData = {
          to: [req.body.mobile],
          subject: "ROLTHY-OTP",
          text: `Dear User, Your OTP verification code for Rolthy App is ${num}. Please, Do not share it with other.`,
        };
        //   await smsTo(sendOTPData);
      }
    } else {
      otpdata = {
        err: "otp-generation-failed",
        msg: "mobile number or email id is required",
      };
    }
    res.status(200).json(otpdata);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const verifyOtp = async (req, res) => {
  try {
    let otpdata = {};
    if (
      (req.body.mobile != null && req.body.email == null) ||
      (req.body.mobile == null && req.body.email != null)
    ) {
      const { mobile, email, otp, sort, select } = req.body;
      const queryObject = {};
      let apiData;
      if (req.body.email != null) {
        apiData = await Otp.findOne({
          email: { $eq: email },
          otp: { $eq: otp },
        });
      } else {
        apiData = await Otp.findOne({
          mobile: { $eq: mobile },
          otp: { $eq: otp },
        });
      }

      if (apiData != null && apiData != {}) {
        otpdata = {
          code: "otp-verified",
          msg: "otp verified",
          verified: true,
          mode: req.body.mobile == null ? "email" : "mobile",
        };
      } else {
        otpdata = {
          code: "otp-verification-failed",
          msg: "otp not verified",
          verified: false,
          mode: req.body.mobile == null ? "email" : "mobile",
        };
      }
    } else {
      otpdata = {
        code: "otp-verification-failed",
        msg: "mobile number or email id is required",
        verified: false,
      };
    }
    res.status(200).json(otpdata);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const addOtp = async (req, res) => {
  try {
    cObj = new Otp(req.body);
    const result = await cObj.save();
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const updateOtp = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Otp.findByIdAndUpdate(_id, req.body, { new: true });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const deleteOtp = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Otp.findByIdAndDelete(_id);
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getOtp = async (req, res) => {
  try {
    const _id = req.params.id;
    let data = await Otp.findById(_id).populate({
      path: "user",
      model: "Driver",
    });
    if (data === null) {
      return res.status(200).json({ error: "id not found" });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

const getAllOtp = async (req, res) => {
  try {
    const { sort, select } = req.query;
    const { mobile, email, otp } = req.query;
    const queryObject = {};

    if (mobile) {
      queryObject.mobile = { $regex: mobile, $options: "i" };
    }

    if (email) {
      queryObject.email = { $regex: email, $options: "i" };
    }

    if (otp) {
      queryObject.otp = { $eq: otp };
    }

    let apiData = Otp.find(queryObject);

    if (sort) {
      let sortFix = sort.replace(",", " ");
      console.log(`sort ${sortFix}`);
      apiData = apiData.sort(sortFix);
    }

    if (select) {
      let selectFix = select.split(",").join(" ");
      console.log(`select ${selectFix}`);
      apiData = apiData.select(selectFix);
    }

    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 25;
    let skip = (page - 1) * limit;

    apiData = apiData.skip(skip).limit(limit);

    const data = await apiData;
    res.status(200).json({ count: data.length, data });
  } catch (e) {
    res.status(400).json(getErrorFromCatch(e));
  }
};

module.exports = {
  getAllOtp,
  getOtp,
  addOtp,
  updateOtp,
  deleteOtp,
  generateOtp,
  verifyOtp,
};
