const express = require('express');
const User = require('../models/User');
const Orders = require('../models/Orders');
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const orders = await Orders.find({ name: user.name, email: user.email }).sort({ Date: -1 })
        if (user) {
            if (user.isAccept == true || user.isAdmin == true) {
                res.render("user/account", { 
                    user: user,
                    orders: orders,
                    suc: req.flash("order-suc"),
                })
            }
        } else {
            res.redirect("/api/login")
        }
    } catch (error) {
        console.log(error);
    }
})

router.get("/order/get/:id", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const data = await Orders.findOne({ _id: req.params.id })
        if (user.isAdmin == true || user.isAccept == true) {
            const algorithm = []
            const papers = Math.floor(data.order.length/14)+1
            const total = []
            let paper = 0
            let vertical = 0

            if(data.order.length < 15){
                res.render("admin/orders/order", {
                    algorithm: algorithm,
                    data: data,
                    many: false,
                    user: user,
                })
            }

            for (let i = 0; i < papers; i++) {
                vertical = vertical + 14
                paper = paper + 1
                total.push(vertical)
                algorithm.push([paper, vertical])
            }

            algorithm[algorithm.length-1][1] = data.order.length - algorithm[algorithm.length - 2][1] + algorithm[algorithm.length - 2][1]

            res.render("admin/orders/order", {
                algorithm: algorithm,
                data: data,
                many: true,
                user: user,
            })
        }
    } catch (error) {
        console.log(error);
    }
})

module.exports = router