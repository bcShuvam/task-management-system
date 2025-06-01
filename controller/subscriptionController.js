const Subscription = require("../model/subscription");

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
      return res.status(400).json({
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
    return res.status(200).json({
      message: "Subscription found successfully",
      subscriptions: foundSubscriptions,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getSubscriptionsName = async (req, res) => {
  try {
    const foundSubscriptions = await Subscription.find();
    if (!foundSubscriptions)
      return res.status(400).json({ message: "Subscription not found" });
    const subscriptionName = foundSubscriptions.map((sub) => ({
      _id: sub._id,
      name: sub.name
    }));
    return res.status(200).json({
      message: "Found subscription name",
      subscriptionName,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getSubscriptionById = async (req, res) => {
  try {
    const id = req.query;

    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }

    const foundSubscription = await Subscription.findById(id);

    if (!foundSubscription)
      return res.status(400).json({ message: "Subscription not found" });

    return res.status(200).json({
      message: "Subscription found successfully",
      subscription: foundSubscription,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updateSubscription = async (req, res) => {
  try {
    const id = req.query.id; // ✅ use params instead of query
    const {
      name,
      maxCompanies,
      maxUsers,
      maxPhotoUploads,
      duration,
      price,
      message,
    } = req.body;

    if (!id) return res.status(400).json({ message: "_id is required" });

    console.log(id);

    const foundSubscription = await Subscription.findById(id);
    if (!foundSubscription)
      return res.status(404).json({ message: "Subscription not found" });

    foundSubscription.name = name ?? foundSubscription.name;
    foundSubscription.maxCompanies =
      maxCompanies ?? foundSubscription.maxCompanies;
    foundSubscription.maxUsers = maxUsers ?? foundSubscription.maxUsers;
    foundSubscription.maxPhotoUploads =
      maxPhotoUploads ?? foundSubscription.maxPhotoUploads;
    foundSubscription.duration = duration ?? foundSubscription.duration;
    foundSubscription.price = price ?? foundSubscription.price;
    foundSubscription.message = message ?? foundSubscription.message;

    await foundSubscription.save();

    return res.status(200).json({
      message: "Subscription updated successfully",
      subscription: foundSubscription,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const deleteSubscription = async (req, res) => {
  try {
    const id = req.query;

    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }

    const deletedSubscription = await Subscription.findByIdAndDelete(id);

    if (!deletedSubscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    return res
      .status(200)
      .json({ message: "Subscription deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  getSubscriptionsName,
  updateSubscription,
  deleteSubscription,
};
