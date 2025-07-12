// controller/sendNotificationController.js
const firebaseAdmin = require('../firebase');
const SuperAdmin = require('../model/superAdmin');
const Admin = require('../model/admin');
const User = require('../model/user');

const registerFirebaseToken = async (req, res) => {
  try {
    const id = req.user.id;
    const {token} = req.body;
    console.log(`id = ${id}, token = ${token}`);

    const superAdmin = await SuperAdmin.findById(id);
    const admin = await Admin.findById(id);
    const user = await User.findById(id);

    if(superAdmin){
      superAdmin.fbToken = token;
      console.log(`superAdmin = ${superAdmin.name}, token = ${superAdmin.fbToken}`);
      await superAdmin.save();
    }

    if(admin){
      admin.fbToken = token;
    console.log(`superAdmin = ${admin.name}, token = ${admin.fbToken}`);
      await admin.save();
    }

    if(user){
      user.fbToken = token;
      console.log(`superAdmin = ${user.name}, token = ${user.fbToken}`);
      await user.save();
    }

    if (!token) return res.status(400).json({ message: "token is required" });
    // Process token if needed
    res.status(201).json({ message: "Token received and saved successfully!" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const sendNotification = async (req, res) => {
  try {
    console.log(req.user);
    const token = req.user.fbToken;
    const name = req.user.name;
    const { title, message } = req.body;
    const messageSend = {
      token: token,
      notification: {
        title: title,
        body: (`${name} ${message}`)
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

    const response = await firebaseAdmin.messaging().send(messageSend);
    console.log(`Successfully sent message: ${response}`);
    return res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("Error sending message", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { registerFirebaseToken, sendNotification };
