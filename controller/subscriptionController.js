const Subscription = require("../model/subscription");
const { subscribe } = require("../routes/test");

const createSubscription = async (req, res) => {
  try {
    const {
      name,
      maxCompanies,
      maxUsers,
      maxPhotoUploads,
      duration,
      price,
      message,
    } = req.body;
    if (
      !name ||
      !maxCompanies ||
      !maxUsers ||
      !maxPhotoUploads ||
      !duration ||
      !price
    )
      return res
        .status(400)
        .json({
          message:
            "name, maxCompanies, maxUsers, maxPhotoUploads, duration, price are required",
        });
    const subscription = await Subscription.create({
      name,
      maxCompanies,
      maxUsers,
      maxPhotoUploads,
      duration,
      price,
      message,
    });
    return res
      .status(201)
      .json({ message: "New subscription created successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllSubscriptions = async (req, res) => {
  try {
    const foundSubscriptions = await Subscription.find();
    if (!foundSubscriptions)
      return res.status(400).json({ message: "Subscription not found" });
    return res
      .status(200)
      .json({
        message: "Subscription found successfully",
        subscriptions: foundSubscriptions,
      });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getFilteredSubscriptions = async (req, res) => {
  try {
    const { duration, price, maxCompanies, maxUsers } = req.query;
    const foundSubscriptions = await Subscription.find();
    if (!foundSubscriptions)
      return res.status(400).json({ message: "Subscription not found" });
    return res
      .status(200)
      .json({
        message: "Subscription found successfully",
        subscriptions: foundSubscriptions,
      });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { createSubscription, getAllSubscriptions };
