const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const Article = require("../models/Article");
const auth = require("../middleware/auth");

router.use(auth.isUserLogged);
router.get("/:id/edit", (req, res, next) => {
  const id = req.params.id;
  Comment.findById(id, (err, comment) => {
    if (err) return next(err);
    res.render("commentEditForm", { comment });
  });
});

router.post("/:id", (req, res, next) => {
  const id = req.params.id;
  Comment.findByIdAndUpdate(id, req.body, (err, updatedComment) => {
    if (err) return next(err);
    res.redirect("/articles/" + updatedComment.articleId);
  });
});

router.get("/:id/delete", (req, res, next) => {
  const id = req.params.id;
  Comment.findByIdAndDelete(id, (err, deletedComment) => {
    if (err) return next(err);
    Article.findByIdAndUpdate(
      deletedComment.articleId,
      { $pull: { comments: deletedComment.id } },
      (err, updatedArticle) => {
        if (err) return next(err);
        res.redirect("/articles/" + deletedComment.articleId);
      }
    );
  });
});

router.get("/:id/like", (req, res, next) => {
  const id = req.params.id;
  Comment.findByIdAndUpdate(
    id,
    { $inc: { likes: 1 } },
    (err, updatedComment) => {
      if (err) return next(err);
      res.redirect("/articles/" + updatedComment.articleId);
    }
  );
});

module.exports = router;
