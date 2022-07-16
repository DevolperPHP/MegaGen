const express = require('express');
const app = express();
const db = require("./config/database")
const api = require("./routes/api")
const index = require("./routes/index")
const admin = require("./routes/admin")
const cart = require("./routes/cart")
const account = require("./routes/account")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const methodOverride = require("method-override")
const flash = require('express-flash');
const session = require('express-session')

let PORT = 3000;

app.set('view engine', 'ejs')
app.use(express.static("public"))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.use(session({
    secret: 'secret',
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
}))
app.use(flash());
app.use("/api", api);
app.use("/", index);
app.use("/admin", admin);
app.use("/cart", cart)
app.use("/my-account", account);

app.listen(PORT, (error) => {
    if(error) throw error;
    console.log(`Server is running on port ${PORT}`);
})