var express = require("express");
var router = express.Router();
var User = require("../models/User");
var Cart = require("../models/Cart");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/register", (req, res, next) => {
  res.render("register", { error: req.flash("error")[0] });
});

router.post("/register", (req, res, next) => {
  User.create(req.body, (err, user) => {
    if (err) {
      if (err.code === 11000) {
        req.flash("error", "Email is already taken");
        return res.redirect("/users/register");
      }
      if (err.name === "ValidationError") {
        req.flash("error", err.message);
        return res.redirect("/users/register");
      }
      return next(err);
    }
    res.redirect("/users/login");
  });
});

router.get("/login", (req, res, next) => {
  res.render("login", { error: req.flash("error")[0] });
});

router.post("/login", (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.flash("error", "Email/Password required");
    return res.redirect("/users/login");
  }
  User.findOne({ email }, (err, user) => {
    if (err) return next(err);

    if (!user) {
      req.flash("error", "user is not register");
      return res.redirect("/users/login");
    }

    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);

      if (!result) {
        req.flash("error", "Invalid Password");
        return res.redirect("/users/login");
      }

      if (!user.isblock) {
        req.session.userId = user.id;
        res.redirect("/products");
      } else {
        res.send("this user is block");
      }
    });
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.clearCookie("connect.sid");
  res.redirect("/");
});

router.get("/:id/cart", (req, res, next) => {
  Cart.findOne({ userId: req.user.id })
    .populate("products")
    .exec((err, cart) => {
      if (err) return next(err);
      console.log(cart);
      res.render("userCart", { cart });
    });
});

router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  const block = req.query.block;
  User.findByIdAndUpdate(id, { $set: { isblock: block } }, (err, user) => {
    if (err) return next(err);
    res.redirect("/admins/users");
  });
});

module.exports = router;
