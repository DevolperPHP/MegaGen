const express = require('express');
const Orders = require('../models/Orders');
const Product = require('../models/Product');
const User = require('../models/User');
const moment = require('moment');
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        if (user.isAccept == true) {
            res.render("user/cart", {
                user: user
            })
        } else {
            res.redirect("/api/pending")
        }
    } catch (error) {
        console.error(error)
    }
})

router.put("/add/:id", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const data = await Product.findOne({ _id: req.params.id })
        const unique = await User.findOne({ _id: userID }, {
            cart: { $elemMatch: { id: data._id } }
        })

        const filter = unique.cart.map(x => x.id)


        if (user.isAccept == true) {
            console.log(unique.cart);
            if (filter === undefined || filter.length == 0) {
                await User.updateOne({ _id: userID }, {
                    $push: { cart: { id: data.id, name: data.name, price: data.price, qty: 1, image: data.image, id: data._id } }
                })

                req.flash("cart-added", "success")
                res.redirect("back")
            } else {
                req.flash("cart-error", "error")
                res.redirect("back")
            }
        } else {
            res.redirect("/api/pending")
        }
    } catch (error) {
        console.log(error);
    }
})

router.put("/delete/:id", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const data = await Product.findOne({ _id: req.params.id })
        if (user.isAccept == true) {
            await User.updateOne({ _id: userID }, {
                $pull: { cart: { name: data.name, price: data.price, image: data.image, id: data._id } }
            })
            res.redirect("back")
        } else {
            res.redirect("/api/pending")
        }
    } catch (error) {
        console.log(error);
    }
})

router.put("/plus/:name", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })

        if (user.isAccept == true) {
            await User.updateOne({ _id: userID, "cart.name": `${req.params.name}` }, {
                $inc: { "cart.$.qty": +1 }
            })

            res.redirect("back")
        } else {
            res.redirect("/api/pending")
        }
    } catch (error) {
        console.log(error);
    }
})

router.put("/min/:name", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const check = await User.findOne({ _id: userID }, {
            cart: { $elemMatch: { name: req.params.name } }
        })

        const getQty = check.cart.map(x => x.qty)

        if (user.isAccept == true) {
            if (getQty[0] > 1) {
                await User.updateOne({ _id: userID, "cart.name": `${req.params.name}` }, {
                    $inc: { "cart.$.qty": -1 }
                })
            }

            res.redirect("back")
        } else {
            res.redirect("/api/pending")
        }
    } catch (error) {
        console.log(error);
    }
})

router.post("/submit", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })

        if (user.isAccept == true) {
            const newOrder = [
                new Orders({
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    Date: moment().locale("ar-kw").format("l"),
                    order: user.cart,
                    bill_id: Math.floor(Math.random() * Date.now()),
                })
            ]

            newOrder.forEach((data) => {
                data.save()
            })

            await User.updateOne({ _id: userID }, {
                $set: {
                    cart: []
                }
            })

            req.flash("order-suc", "success")
            res.redirect("/my-account")
        } else {
            res.redirect("/api/pending")
        }
    } catch (error) {
        console.log(error);
    }
})

module.exports = router