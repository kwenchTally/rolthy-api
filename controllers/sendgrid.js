const sgMail = require("@sendgrid/mail");
const key = process.env.SENDGRID_MAIL_KEY;
sgMail.setApiKey(key);

sendMail = async (req, res) => {
  try {
    const { subject, text, to } = req.body;

    if (
      subject == undefined ||
      text == undefined ||
      text == "" ||
      to == undefined ||
      to == ""
    ) {
      res.status(200).json({
        status: "error",
        message: "subject, message and email is required!",
      });
      return;
    }

    const message = {
      from: {
        name: process.env.APP_NAME || "Tester",
        email: process.env.APP_EMAIL || "",
      },
      to: to,
      subject: subject,
      text: text,
    };

    sgMail
      .send(message)
      .then((response) => {
        console.log("Email sent...");
        res.status(200).json({
          status: "success",
          message: "email sent",
        });
      })
      .catch((error) => {
        console.log(error.message);
        res.status(200).json({
          status: "failed",
          message: "err",
        });
      });
  } catch (e) {
    console.log(`mail sending error ${e}`);
    res.status(200).json({
      status: "failed",
      message: "err",
    });
  }
};

mailTo = async (body) => {
  try {
    const { subject, text, to } = body;

    if (
      subject == undefined ||
      text == undefined ||
      text == "" ||
      to == undefined ||
      to == ""
    ) {
      return {
        status: "error",
        message: "subject, message and email is required!",
      };
    }

    const message = {
      from: {
        name: process.env.APP_NAME || "Tester",
        email: process.env.APP_EMAIL || "",
      },
      to: to,
      subject: subject,
      text: text,
    };

    sgMail
      .send(message)
      .then((response) => {
        console.log("Email sent...");
        return {
          status: "success",
          message: "email sent",
        };
      })
      .catch((error) => {
        console.log(error.message);
        return {
          status: "failed",
          message: "err",
        };
      });
  } catch (e) {
    console.log(`mail sending error ${e}`);
    res.status(200).json({
      status: "failed",
      message: "err",
    });
  }
};

const accountSID = process.env.TWILIO_SMS_SID;
const authToken = process.env.TWILIO_SMS_TOKEN;
const twilio = require("twilio");
const client = twilio(accountSID, authToken);

sendSMS = async (req, res) => {
  try {
    const { text, to } = req.body;

    if (text == undefined || text == "" || to == undefined || to == "") {
      res.status(200).json({
        status: "error",
        message: "subject, message and phone is required!",
      });
      return;
    }

    const message = {
      from: process.env.APP_MOBILE || "",
      to: to,
      body: text,
    };

    client.messages
      .create(message)
      .then((response) => {
        console.log("SMS sent...");
        res.status(200).json({
          status: "success",
          message: "sms sent",
        });
      })
      .catch((error) => {
        console.log(error.message);
        res.status(200).json({
          status: "failed",
          message: "err",
        });
      });
  } catch (e) {
    console.log(`mail sending error ${e}`);
    res.status(200).json({
      status: "failed",
      message: "err",
    });
  }
};

verifyTwilio = async () => {
  const accountSid = process.env.TWILIO_SMS_SID;
  const authToken = process.env.TWILIO_SMS_TOKEN;
  const client = require("twilio")(accountSid, authToken);
  const sid = process.env.TWILIO_SID;

  client.verify.v2
    .services(sid)
    .verifications.create({ to: "+18503204410", channel: "sms" })
    .then((verification) => console.log(verification.sid));
};

module.exports = {
  sendMail,
  sendSMS,

  mailTo,
};
