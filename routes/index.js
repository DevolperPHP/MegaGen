const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');
const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({_id: userID})
        const category = await Category.find({}).sort({ Date: 1 })
        const products = await Product.find({}).sort({ Date: -1 }).limit(11)

       if(user){
        if(user.isAccept == true){
            res.render("user/index", {
                user: user,
                category: category,
                products: products,
            })
        } else {
            res.redirect("/api/pending")
        }
       } else {
        res.redirect("/api/pending")
       }
    } catch (error) {
        console.log(error)
    }
})

router.get("/category/:name", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({_id: userID})
        const products = await Product.find({ category: req.params.name }).sort({ Date: -1 })

        if(user.isAdmin == true || user.isAccept == true) {
            res.render("user/category", {
                user: user,
                products: products,
            })
        } else {
            res.redirect("/api/pending")
        }
    } catch (error) {
        console.log(error);
    }
})

router.get("/product/:id", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({_id: userID})
        const data = await Product.findOne({ _id: req.params.id }).sort({ Date: -1 })
        const products = await Product.find({ category: data.category, instock: true }).sort({ Date: -1 }).limit(15)

        if(user.isAdmin == true || user.isAccept == true) {
            res.render("user/product", {
                user: user,
                data: data,
                products: products,
                suc: req.flash("cart-added"),
                err: req.flash("cart-error"),
            })
        } else {
            res.redirect("/api/pending")
        }
    } catch (error) {
        console.log(error);
    }
})

module.exports = router