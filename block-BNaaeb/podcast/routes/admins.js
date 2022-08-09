const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Podcast = require("../models/Podcast");
const auth = require("../middleware/auth");

router.get("/register", (req, res, next) => {
  res.render("adminRegister", { error: req.flash("error")[0] });
});

router.post("/register", (req, res, next) => {
  req.body.isAdmin = true;
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
      res.redirect("/podcasts");
    });
  });
});

router.get("/verify", auth.isAdminLogged, (req, res, next) => {
  Podcast.find({ isVerified: false }, (err, podcasts) => {
    if (err) return next(err);
    res.render("stillToBeVerified", { podcasts });
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.clearCookie("connect.sid");
  res.redirect("/");
});

module.exports = router;
