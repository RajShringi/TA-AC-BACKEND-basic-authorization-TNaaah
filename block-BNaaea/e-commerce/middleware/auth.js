const User = require("../models/User");

module.exports = {
  isUserLogged: (req, res, next) => {
    if (req.session && req.session.userId) {
      next();
    } else {
      res.redirect("/users/login");
    }
  },
  isUserblock: (req, res, next) => {
    if (req.session && req.session.userId) {
      const userId = req.session && req.session.userId;
      User.findById(userId, (err, user) => {
        if (!user.isblock) {
          console.log(user.isblock);
          next();
        } else {
          res.send("This user is blocked");
        }
      });
    } else {
      next();
    }
  },
  isAdminLogged: (req, res, next) => {
    if (req.session && req.session.adminId) {
      next();
    } else {
      res.redirect("/admins/login");
    }
  },
  userInfo: (req, res, next) => {
    const userId = req.session && req.session.userId;
    if (userId) {
      User.findById(userId, (err, user) => {
        if (err) return next(err);
        req.user = user;
        res.locals.user = user;
        next();
      });
    } else {
      req.user = null;
      res.locals.user = null;
      next();
    }
  },
  adminInfo: (req, res, next) => {
    const adminId = req.session && req.session.adminId;
    if (adminId) {
      User.findById(adminId, (err, user) => {
        if (err) return next(err);
        req.admin = user;
        res.locals.admin = user;
        next();
      });
    } else {
      req.admin = null;
      res.locals.admin = null;
      next();
    }
  },
};
