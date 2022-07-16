const mongoose = require('mongoose');

const ordersSchema = new mongoose.Schema({
    name: {
        type: String,
    },

    email: {
        type: String,
    },

    phone: {
        type: String,
    },

    bill_id: {
        type: Number,
    },

    Date: {
        type: String,
    },

    order: {
        type: Array,
    },

    isReject: {
        type: Boolean,
        default: false,
    },

    isAccept: {
        type: Boolean,
        default: false,
    },

    review:{
        type: Boolean,
        default: false,
    },
})

const Orders = mongoose.model('Orders', ordersSchema, 'Orders')
module.exports = Orders