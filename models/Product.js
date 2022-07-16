const mongoose = require('mongoose')

const productSchema = new  mongoose.Schema({
    name: {
        type: String,
    },

    minDes: {
        type: String,
    },

    des: {
        type: String,
    },

    price: {
        type: Number
    },

    instock: {
        type: Boolean,
        default: true
    },

    score: {
        type: Number,
        default: 0
    },

    category: {
        type: String
    },

    image: {
        type: String
    },

    Date: {
        type: String,
    },
})

const Product = mongoose.model('Product', productSchema, 'Product')
module.exports = Product