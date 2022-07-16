const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    
    phone: {
        type: String,
    },

    email: {
        type: String,
        unique: true,
    },

    password: {
        type: String,
    },

    isAdmin:{
        type: Boolean,
        default: false,
    },

    isAccept:{
        type: Boolean,
        default: false,
    },

    cart:{
        type: Array,
        default: []
    },

    Date:{
        type: String,
    },
})

const User = mongoose.model('User', userSchema, 'User')
module.exports = User