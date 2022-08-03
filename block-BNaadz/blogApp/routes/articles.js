const express = require("express");
const router = express.Router();
const Article = require("../models/Article");
const auth = require("../middleware/auth");
const Comment = require("../models/Comment");

router.get("/", (req, res, next) => {
  Article.find({}, (err, articles) => {
    if (err) return next(err);
    res.render("articles", { articles });
  });
});

router.get("/new", auth.isUserLogged, (req, res, next) => {
  return res.render("articleForm");
});

router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  Article.findById(id)
    .populate("author")
    .populate("comments")
    .exec((err, article) => {
      res.render("articleDetail", { article });
    });
});

router.use(auth.isUserLogged);

router.post("/", (req, res, next) => {
  req.body.author = req.user.id;
  Article.create(req.body, (err, article) => {
    if (err) return next(err);
    res.redirect("/articles");
  });
});

router.get("/:id/edit", (req, res, next) => {
  const id = req.params.id;
  Article.findById(id, (err, article) => {
    if (err) return next(err);
    if (article.author.toString() === req.user._id.toString()) {
      res.render("articleEditForm", { article });
    } else {
      res.send("You are not author of this article");
    }
  });
});

router.post("/:id", (req, res, next) => {
  const id = req.params.id;
  Article.findByIdAndUpdate(id, req.body, (err, updatedArticle) => {
    if (err) return next(err);
    res.redirect("/articles/" + id);
  });
});

router.get("/:id/delete", (req, res, next) => {
  const id = req.params.id;
  Article.findById(id, (err, article) => {
    if (err) return next(err);
    if (article.author.toString() === req.user._id.toString()) {
      Article.findByIdAndDelete(id, (err, deletedArticle) => {
        if (err) return next(err);
        Comment.deleteMany({ articleId: id }, (err, data) => {
          if (err) return next(err);
          res.redirect("/articles");
        });
      });
    } else {
      res.send("You are not author of this article");
    }
  });
});

router.get("/:id/like", (req, res, next) => {
  const id = req.params.id;
  Article.findByIdAndUpdate(
    id,
    { $inc: { likes: 1 } },
    (err, updatedArticle) => {
      if (err) return next(err);
      res.redirect("/articles/" + id);
    }
  );
});

router.get("/:id/user", (req, res, next) => {
  const id = req.params.id;
  Article.find({ author: id }, (err, articles) => {
    if (err) return next(err);
    res.render("articles", { articles });
  });
});

router.post("/:id/comments", (req, res, next) => {
  const id = req.params.id;
  req.body.articleId = id;
  Comment.create(req.body, (err, comment) => {
    if (err) return next(err);
    Article.findByIdAndUpdate(
      id,
      { $push: { comments: comment.id } },
      (err, updatedArticle) => {
        if (err) return next(err);
        res.redirect("/articles/" + id);
      }
    );
  });
});

module.exports = router;
