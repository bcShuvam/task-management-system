const mongoose = require('mongoose');

const ticketNumberSchema = mongoose.Schema({
    mainAdminId: {type: mongoose.Schema.Types.ObjectId, ref: 'Admin'},
    companyId: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'},
    ticketNumber: {type: Number, default: 0}
});

const TicketNumber = mongoose.model('TicketNumber', ticketNumberSchema)

module.exports = TicketNumber;