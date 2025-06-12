const mongoose = require('mongoose');

const SubscriptionSchema = mongoose.Schema({
    name: {type: String, required: true},
    maxCompanies: {type: Number, required: true},
    maxUsers: {type: Number, required: true},
    maxPhotoUploads: {type: Number, required: true},
    duration: {type: Number, required: true},
    price: {type: Number, required: true},
    message: {type: String, default: ""},
    status: {type: Boolean, default: true},
    totalEarning: {type: Number, default: 0},
    totalSubscriptionSold: {type: Number, default: 0}
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;