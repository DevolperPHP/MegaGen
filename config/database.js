const mongoose = require('mongoose');
const MONGO_URL = "mongodb://localhost:27017/E-Shop"


mongoose.connect(MONGO_URL, (error) => {
    if(error) throw error
    console.log("Database connected")
})