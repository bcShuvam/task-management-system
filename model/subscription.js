const mongoose = require('mongoose');

const SubscriptionSchema = mongoose.Schema({
    name: {type: String, required: true},
    maxCompanies: {type: Number, required: true},
    maxUsers: {type: Number, required: true},
    maxPhotoUploads: {type: Number, required: true},
    duration: {type: Number, required: true},
    price: {type: Number, required: true},
    message: {type: String, default: ""}
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;