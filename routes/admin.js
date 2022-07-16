const express = require('express');
const Category = require('../models/Category');
const User = require('../models/User');
const router = express.Router();
const moment = require('moment');
const multer = require('multer');
const Product = require('../models/Product');
const Orders = require('../models/Orders');
const nodemailer = require('nodemailer');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/upload/images");
    },

    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1000 * 1000,
    },
});

router.get("/category", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const category = await Category.find({}).sort({ Date: -1 })

        if (user) {
            if (user.isAdmin == true) {
                res.render("admin/category/category", {
                    user: user,
                    category: category,
                    del: req.flash("category-delete-success"),
                    suc: req.flash("edit-suc"),
                })
            } else {
                req.flash("error-acc", "error")
                res.redirect("/")
            }
        } else {
            req.flash("error-acc", "error")
            res.redirect("/api/login")
        }
    } catch (error) {
        console.log(error);
    }
})

router.post("/category", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })

        if (user.isAdmin == true) {
            const name = req.body.name
            const newCategory = [
                new Category({
                    name: name,
                    Date: moment().locale("ar-kw").format("l")
                })
            ]

            newCategory.forEach((data) => {
                data.save((error) => {
                    if (error) {
                        console.log(error)
                    } else {
                        res.redirect("back")
                    }
                })
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.delete("/category/delete/:id", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })

        if (user.isAdmin == true) {
            await Category.deleteOne({ _id: req.params.id })
            req.flash("category-delete-success", "deleted")
            res.redirect("back")
        }
    } catch (error) {
        console.log(error);
    }
})

router.get("/category/edit/:id", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const category = await Category.findOne({ _id: req.params.id })

        if (user.isAdmin == true) {
            res.render("admin/category/edit", {
                category: category,
                user: user
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.put("/category/edit/:id", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const category = await Category.findOne({ _id: req.params.id })

        if (user.isAdmin == true) {
            await Product.updateMany({ category: category.name }, {
                $set: {
                    category: req.body.name
                }
            })
            await Category.updateOne({ _id: req.params.id }, {
                $set: { name: req.body.name }
            })

            req.flash("edit-suc", "success")
            res.redirect("/admin/category")
        }
    } catch (error) {
        console.log(error);
    }
})

router.get("/products", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const products = await Product.find({}).sort({ Date: -1 })

        if (user.isAdmin == true) {
            res.render("admin/product/products", {
                user: user,
                products: products,
                del: req.flash("suc-del"),
                edit: req.flash("suc-edit"),
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.get("/product/add", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const category = await Category.find({}).sort({ Date: -1 })

        if (user.isAdmin == true) {
            res.render("admin/product/add", {
                user: user,
                category: category,
                suc: req.flash("suc-add"),
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.post("/product/add", upload.single("image"), async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const { name, minDes, des, price, category } = req.body

        if (user.isAdmin == true) {
            const newProduct = [
                new Product({
                    name: name,
                    minDes: minDes,
                    des: des,
                    price: price,
                    category: category,
                    image: req.file.filename,
                    Date: moment().locale("ar-kw").format("l")
                })
            ]

            newProduct.forEach((data) => {
                data.save((error) => {
                    if (error) {
                        console.log(error);
                    } else {
                        req.flash("suc-add", "success")
                        res.redirect("back")
                    }
                })
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.delete("/product/delete/:id", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })

        if (user.isAdmin == true) {
            await Product.deleteOne({ _id: req.params.id })
            req.flash("suc-del", "success")
            res.redirect("back")
        }
    } catch (error) {
        console.log(error);
    }
})

router.get("/product/edit/:id", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const product = await Product.findOne({ _id: req.params.id })
        const category = await Category.find({}).sort({ Date: -1 })

        if (user.isAdmin == true) {
            res.render("admin/product/edit", {
                product: product,
                category: category,
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.put("/product/edit/:id", upload.single("image"), async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const { name, minDes, des, price, category } = req.body

        if (user.isAdmin == true) {
            if (typeof req.file === "undefined") {
                await Product.updateOne({ _id: req.params.id }, {
                    $set: {
                        name: name,
                        minDes: minDes,
                        des: des,
                        price: price,
                        category: category,
                    }
                })
            } else {
                await Product.updateOne({ _id: req.params.id }, {
                    $set: {
                        name: name,
                        minDes: minDes,
                        des: des,
                        price: price,
                        category: category,
                        image: req.file.filename
                    }
                })
            }

            req.flash("suc-edit", "success")
            res.redirect("/admin/products")
        }
    } catch (error) {
        console.log(error);
    }
})

router.put("/product/out-stock/:id", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })

        if (user.isAdmin == true) {
            await Product.updateOne({ _id: req.params.id }, {
                $set: {
                    instock: false
                }
            })

            res.redirect("back")
        }
    } catch (error) {
        console.log(error);
    }
})

router.put("/product/in-stock/:id", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })

        if (user.isAdmin == true) {
            await Product.updateOne({ _id: req.params.id }, {
                $set: {
                    instock: true
                }
            })
            res.redirect("back")
        }
    } catch (error) {
        console.log(error);
    }
})

router.get("/users/new-users", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const users = await User.find({ isAccept: false }).sort({ Date: -1 })

        if (user.isAdmin == true) {
            res.render("admin/users/new-users", {
                users: users,
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.put("/users/accept/:id", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })

        if (user.isAdmin == true) {
            await User.updateOne({ _id: req.params.id }, {
                $set: {
                    isAccept: true
                }
            })
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'iqevolution1@gmail.com',
                  pass: 'kdulyzpkifwzvsdd'
                }
              });

              var mailOptions = {
                from: 'IQ-Evoluton - Mohammed Majid',
                to: `${user.email}`,
                subject: `Hello Dear ${user.name}`,
                text: 'Your account has been accepted on MegaGen, you can now enter the app and book our products'
              };     
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
            res.redirect("back")
        }
    } catch (error) {
        console.log(error);
    }
})

router.delete("/users/reject/:id", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })

        if (user.isAdmin == true) {
            await User.deleteOne({ _id: req.params.id })
            res.redirect("back")
        }
    } catch (error) {
        console.log(error);
    }
})

router.get("/users/accepted-users", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const users = await User.find({ isAccept: true }).sort({ Date: -1 })

        if (user.isAdmin == true) {
            res.render("admin/users/accepted-users", {
                users: users,
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.put("/users/cancel/:id", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })

        if (user.isAdmin == true) {
            await User.updateOne({ _id: req.params.id }, {
                $set: {
                    isAccept: false
                }
            })

            res.redirect("back")
        }
    } catch (error) {
        console.log(error);
    }
})

router.get("/orders", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const orders = await Orders.find({ review: false }).sort({ Date: -1 })

        if (user.isAdmin == true) {
            res.render("admin/orders/new-orders", {
                orders: orders,
                reject: req.flash("reject-order"),
                accept: req.flash("accept-order"),
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.get("/orders/get/:id", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const data = await Orders.findOne({ _id: req.params.id })
        if (user.isAdmin == true) {
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
                    user: user
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
                user: user
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.get("/print", async (req, res) => {
    try {
        res.render("admin/orders/print")
    } catch (error) {
        console.log(error);
    }
})

router.put("/reject-order/:id", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const orderData = await Orders.findOne({ _id: req.params.id })

        if(user.isAdmin == true){
            await Orders.updateOne({ _id: req.params.id }, {
                $set: {
                    isReject: true,
                    review: true,
                }
            })

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'iqevolution1@gmail.com',
                  pass: 'kdulyzpkifwzvsdd'
                }
              });

              var mailOptions = {
                from: 'IQ-Evoluton - Mohammed Majid',
                to: `${orderData.email}`,
                subject: `Hello Dear ${orderData.name}`,
                text: 'We are sorry for letting you know that your order in Megagen app has been rejected, You can replay this email for more information or submit a new order'
              };     
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });

            req.flash("reject-order", "success")
            res.redirect("/admin/orders")
        }
    } catch (error) {
        console.log(error);
    }
})

router.put("/accept-order/:id", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const orderData = await Orders.findOne({ _id: req.params.id })

        if(user.isAdmin == true){
            await Orders.updateOne({ _id: req.params.id }, {
                $set: {
                    isAccept: true,
                    review: true,
                }
            })

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'iqevolution1@gmail.com',
                  pass: 'kdulyzpkifwzvsdd'
                }
              });

              var mailOptions = {
                from: 'IQ-Evoluton - Mohammed Majid',
                to: `${orderData.email}`,
                subject: `Hello Dear ${orderData.name}`,
                text: 'Congratulations, Your order in MegaGen has been accepted'
              };     
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });

            req.flash("accept-order", "success")
            res.redirect("/admin/orders")
        }
    } catch (error) {
        console.log(error);
    }
})

router.get("/rejected-orders", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const orders = await Orders.find({ isReject: true }).sort({ Date: -1 })

        if (user.isAdmin == true) {
            res.render("admin/orders/new-orders", {
                orders: orders,
                reject: req.flash("reject-order"),
                accept: req.flash("accept-order"),
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.get("/bills", async (req, res) => {
    try {
        const userID = req.cookies.id
        const user = await User.findOne({ _id: userID })
        const orders = await Orders.find({ isAccept: true }).sort({ Date: -1 })

        if (user.isAdmin == true) {
            res.render("admin/orders/bills", {
                orders: orders,
                reject: req.flash("reject-order"),
                accept: req.flash("accept-order"),
            })
        }
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;