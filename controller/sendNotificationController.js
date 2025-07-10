// controller/sendNotificationController.js
const admin = require('../firebase');

const getFirebaseToken = async (req, res) => {
  try {
    const token = req.body;
    if (!token) return res.status(400).json({ message: "token is required" });
    // Process token if needed
    res.status(200).json({ message: "Token received" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const sendNotification = async (req, res) => {
  try {
    const { token, message } = req.body;
    const messageSend = {
      token: token,
      notification: {
        title: "Deskgoo Task",
        body: message
      },
      android: {
        priority: "high"
      },
      apns: {
        payload: {
          aps: {
            badge: 42
          }
        }
      }
    };

    const response = await admin.messaging().send(messageSend);
    console.log(`Successfully sent message: ${response}`);
    return res.status(200).json({ success: true, response });

  } catch (error) {
    console.error("Error sending message", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getFirebaseToken, sendNotification };
