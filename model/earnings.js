const mongoose = require('mongoose');

const EarningSchema = mongoose.Schema({
    totalEarning: {type: Number, default: 0},
    totalSubscriptionSold: {type: Number, default: 0},
    subscriptionCategory: {type: Object}
});

const uniqueSubscriptionSold = mongoose.Schema({
    subscriptionId: {type: mongoose.Schema.Types.ObjectId, ref: 'Subscription'},
    totalSold: {type: Number, default: 0},
    totalEarning: {type: Number, default: 0}
}, { timestamps: true });

const Earning = mongoose.model("Earning", EarningSchema);

module.exports = Earning;