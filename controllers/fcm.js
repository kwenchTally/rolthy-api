// FCM API (Legacy)
const FCM = require("fcm-node");
const serverKey = process.env.FCM_SERVER_KEY;

sendNotification = async (req, res) => {
  try {
    const { user, message, topic } = req.body;
    const fcm = new FCM(serverKey);

    if (topic != undefined) {
      const topics = [
        "general",
        "promotions",
        "offers",
        "marketing",
        "advertisement",
      ];
      const topic = topics[0];

      const message = {
        data: {
          title: req.body.title,
          body: req.body.body,
          image: req.body.image,
        },
        topic: topic,
      };

      fcm
        .send(message)
        .then((response) => {
          console.log("Successfully sent message:", response);
        })
        .catch((error) => {
          console.log("Error sending message:", error);
        });
    } else if (user != undefined) {
      //all

      const registrationTokens = [req.body.token];

      const message = {
        data: {
          title: req.body.title,
          body: req.body.body,
          image: req.body.image,
        },
        tokens: registrationTokens,
      };

      fcm.sendMulticast(message).then((response) => {
        console.log(response.successCount + " messages were sent successfully");
        if (response.failureCount > 0) {
          const failedTokens = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              failedTokens.push(registrationTokens[idx]);
            }
          });
          console.log("List of tokens that caused failures: " + failedTokens);
        }
      });
    } else {
      //user
      const token = req.body.token;
      const message = {
        data: {
          title: req.body.title,
          body: req.body.body,
          image: req.body.image,
        },
        token: token,
      };

      fcm.send(message, (error, response) => {
        if (error) {
          console.log("Error sending message:", error);
        } else {
          console.log("Successfully sent message:", response);
        }
      });
    }
    const msg = {
      content_available: true,
      mutable_content: true,
      notification: {
        body: message,
        icon: "icon",
        sound: "sound",
      },
    };

    fcm.send(msg, (err, res) => {
      if (err) {
        console.log(`notification sending failed ${err}`);
      } else {
        console.log(`notification sent`);
        console.log(res);
      }
    });

    res.status(200).json({
      status: "success",
      message: "notification sent",
    });
  } catch (e) {
    console.log(`notification sending error ${e}`);
    res.status(200).json({
      status: "notification-send-failed",
      message: "err",
    });
  }
};

addNotification = async (data) => {
  try {
    const fcm = new FCM(serverKey);
    const message = {
      data: {
        title: data.title,
        body: data.body,
        image: data.image,
      },
      token: data.token,
    };

    fcm.send(message, (error, response) => {
      if (error) {
        console.log("Error sending message:", error);
      } else {
        console.log("Successfully sent message:", response);
      }
    });
  } catch (e) {
    console.log(`notification sending error ${e}`);
  }
};

// FCM API (HTTP v1)
const admin = require("firebase-admin");
const serviceAccount = require("../rolthy-delivery-firebase-adminsdk-4onnt-ee4bcdbef2.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const addNotification1 = async (data) => {
  try {
    const message = {
      notification: {
        title: data.title,
        body: data.body,
        image: data.image,
      },
      token: data.token,
    };

    console.log("Message to be sent:", JSON.stringify(message, null, 2));
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

sendNotification1 = async (req, res) => {
  try {
    const { user, message, topic } = req.body;
    const fcm = new FCM(serverKey);

    if (topic != undefined) {
      const topics = [
        "general",
        "promotions",
        "offers",
        "marketing",
        "advertisement",
      ];
      const topic = topics[0];

      const message = {
        data: {
          title: req.body.title,
          body: req.body.body,
          image: req.body.image,
        },
        topic: topic,
      };

      const response = await admin.messaging().send(message);
      console.log("Successfully sent message:", response);
    } else if (user != undefined) {
      //all

      const registrationTokens = [req.body.token];
      const message = {
        data: {
          title: req.body.title,
          body: req.body.body,
          image: req.body.image,
        },
        tokens: registrationTokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      console.log("Successfully sent message:", response);
      console.log(response.successCount + " messages were sent successfully");
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationTokens[idx]);
          }
        });
        console.log("List of tokens that caused failures: " + failedTokens);
      }
    } else {
      //user
      const token = req.body.token;
      const message = {
        data: {
          title: req.body.title,
          body: req.body.body,
          image: req.body.image,
        },
        token: token,
      };

      const response = await admin.messaging().send(message);
      console.log("Successfully sent message:", response);
    }
    const msg = {
      content_available: true,
      mutable_content: true,
      notification: {
        body: message,
        icon: "icon",
        sound: "sound",
      },
    };

    const response = await admin.messaging().send(msg);
    console.log("Successfully sent message:", response);

    res.status(200).json({
      status: "success",
      message: "notification sent",
    });
  } catch (e) {
    console.log(`notification sending error ${e}`);
    res.status(200).json({
      status: "notification-send-failed",
      message: "err",
    });
  }
};

module.exports = {
  sendNotification,
  addNotification,
  addNotification1,
  sendNotification1,
};
