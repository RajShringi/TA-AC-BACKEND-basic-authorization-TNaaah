const express = require("express");
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Category = require("../models/Category");
const router = express.Router();

router.get("/", auth.isUserblock, (req, res, next) => {
  Product.find({}, (err, products) => {
    if (err) return next(err);
    res.render("products", { products });
  });
});

router.get("/new", auth.isAdminLogged, (req, res) => {
  res.render("addProductForm");
});

router.get("/categories", auth.isAdminLogged, (req, res, next) => {
  const category = req.query.category;
  Product.find({ categories: category }, (err, products) => {
    if (err) return next(err);
    res.render("products", { products });
  });
});

router.get("/:product_id", (req, res, next) => {
  const product_id = req.params.product_id;
  Product.findById(product_id).exec((err, product) => {
    if (err) return next(err);
    res.render("productDetail", { product });
  });
});

router.get("/:id/cart", auth.isUserLogged, (req, res, next) => {
  const id = req.params.id;
  Cart.updateOne(
    { userId: req.user.id },
    { $set: { userId: req.user.id }, $push: { products: id } },
    { upsert: true },
    (err, cart) => {
      if (err) return next(err);
      res.redirect(`/users/${req.user.id}/cart`);
    }
  );
});

router.use(auth.isAdminLogged);

router.post("/", (req, res, next) => {
  req.body.categories = req.body.categories.split(",");
  Product.create(req.body, (err, product) => {
    if (err) return next(err);
    product.categories.forEach((category) => {
      Category.updateOne(
        { name: category },
        { $push: { products: product.id } },
        { upsert: true },
        (err, category) => {
          if (err) return next(err);
          console.log(Category);
        }
      );
    });
    res.redirect("/products");
  });
});

router.get("/:product_id/edit", (req, res, next) => {
  const product_id = req.params.product_id;
  Product.findById(product_id, (err, product) => {
    if (err) return next(err);
    res.render("editProductForm", { product });
  });
});

router.post("/:id", (req, res, next) => {
  const id = req.params.id;
  req.body.categories = req.body.categories.split(",");
  Product.findByIdAndUpdate(id, req.body, (err, product) => {
    if (err) return next(err);
    res.redirect("/products/" + id);
  });
});

router.get("/:id/delete", (req, res, next) => {
  const id = req.params.id;
  Product.findByIdAndDelete(id, (err, deletedProduct) => {
    Category.deleteMany({ productId: deletedProduct.id }, (err, data) => {
      if (err) return next(err);
      res.redirect("/products/");
    });
  });
});

router.get("/:id/like", (req, res, next) => {
  const id = req.params.id;
  Product.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, product) => {
    if (err) return next(err);
    res.redirect("/products/" + id);
  });
});

module.exports = router;
