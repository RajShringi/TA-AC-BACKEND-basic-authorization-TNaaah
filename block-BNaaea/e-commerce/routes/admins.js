var express = require("express");
var router = express.Router();
var User = require("../models/User");
var auth = require("../middleware/auth");
const Product = require("../models/Product");
const Category = require("../models/Category");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/register", (req, res, next) => {
  res.render("adminRegister", { error: req.flash("error")[0] });
});

router.post("/register", (req, res, next) => {
  req.body.isadmin = true;
  User.create(req.body, (err, user) => {
    if (err) {
      if (err.code === 11000) {
        req.flash("error", "Email is already taken");
        return res.redirect("/admins/register");
      }
      if (err.name === "ValidationError") {
        req.flash("error", err.message);
        return res.redirect("/admins/register");
      }
      return next(err);
    }
    res.redirect("/admins/login");
  });
});

router.get("/login", (req, res, next) => {
  res.render("adminLogin", { error: req.flash("error")[0] });
});

router.post("/login", (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.flash("error", "Email/Password required");
    return res.redirect("/admins/login");
  }
  User.findOne({ email }, (err, user) => {
    if (err) return next(err);

    if (!user) {
      req.flash("error", "user is not register");
      return res.redirect("/admins/login");
    }

    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);

      if (!result) {
        req.flash("error", "Invalid Password");
        return res.redirect("/admins/login");
      }

      req.session.adminId = user.id;
      res.redirect("/products");
    });
  });
});

router.use(auth.isAdminLogged);

router.get("/dashboard", (req, res, next) => {
  res.render("dashboard", { products: null, users: null, categories: null });
});

router.get("/products", (req, res, next) => {
  Product.find({}, (err, products) => {
    if (err) return next(err);
    console.log(products);
    res.render("dashboard", { products, users: null, categories: null });
  });
});

router.get("/categories", (req, res, next) => {
  Category.find({}, (err, categories) => {
    if (err) return next(err);
    console.log(categories);
    res.render("dashboard", { categories, users: null, products: null });
  });
});

router.get("/users", (req, res, next) => {
  User.find({ isadmin: false }, (err, users) => {
    if (err) return next(err);
    console.log(users);
    res.render("dashboard", { users, products: null, categories: null });
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.clearCookie("connect.sid");
  res.redirect("/");
});

module.exports = router;
