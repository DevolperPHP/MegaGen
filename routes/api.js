const express = require('express')
const router = express.Router()
const User = require('../models/User')
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt')
const moment = require('moment')

router.get("/register", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        res.render("register", {
            user: user,
            err: req.flash("unique-email"),
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/register", async (req, res) => {
    try{
        const { name, phone, password, email} = req.body
        const filter = await User.findOne({ email: email})
        if(filter){
            req.flash("unique-email", "error")
            res.redirect("/api/register")
        } else {
            const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = [
            new User({
                email: email,
                name: name,
                phone: phone,
                password: hashedPassword,
                Date: moment().locale("ar-kw").format("l")
            })
        ]

        newUser.forEach((data) => {
            data.save()
        })

        res.redirect("/api/login")
        }
    } catch (error) {
        console.log(error);
    }
})

router.get("/login", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        res.render("login", {
            user: user,
            err: req.flash("error-login")
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email: email})
        const comparePassword = await bcrypt.compare(password, user.password)

        if(comparePassword) {
            res.cookie("id", user.id)
            if(user.isAccept == true){
                res.redirect("/")
            } else {
                res.redirect("/api/pending")
            }
        } else {
            req.flash("error-login", "error")
            res.redirect("back")
        }
    } catch (error) {
        console.log(error);
    }
})

router.get("/pending", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID})

       if(user){
        if(user.isAccept == false){
            res.render("pending", { user: user })
        } else {
            res.redirect("/")
        }
       } else {
        res.redirect("/api/login")
       }
    } catch (error) {
        console.log(error);
    }
})

router.get("/logout", async (req, res) => {
    try {
        res.clearCookie("id")
        res.redirect("/api/login")
    } catch (error) {
        console.log(error);
    }
})

module.exports = router