const express = require("express");
const router = express.Router();
const Podcast = require("../models/Podcast");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(__dirname, "../", "public/uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/", (req, res, next) => {
  if (req.admin) {
    Podcast.find({ isVerified: true }, (err, podcasts) => {
      if (err) return next(err);
      res.render("podcasts", { podcasts, msg: null });
    });
  } else {
    const plan = req.user.usersPlan;
    if (plan === "premium") {
      Podcast.find({ isVerified: true }, (err, podcasts) => {
        if (err) return next(err);
        res.render("podcasts", { podcasts, msg: req.flash("msg")[0] });
      });
    } else if (plan === "vip") {
      Podcast.find(
        {
          isVerified: true,
          $or: [{ podcastPlan: "free" }, { podcastPlan: "vip" }],
        },
        (err, podcasts) => {
          if (err) return next(err);
          res.render("podcasts", { podcasts, msg: req.flash("msg")[0] });
        }
      );
    } else {
      Podcast.find(
        { isVerified: true, podcastPlan: "free" },
        (err, podcasts) => {
          if (err) return next(err);
          res.render("podcasts", { podcasts, msg: req.flash("msg")[0] });
        }
      );
    }
  }
});

router.get("/new", auth.isAdminLogged, (req, res) => {
  res.render("addPodcast");
});

router.get("/userpodcast", auth.isUserLogged, (req, res, next) => {
  res.render("userPodcastForm");
});

router.post(
  "/userpodcast",
  auth.isUserLogged,
  upload.single("image"),
  (req, res, next) => {
    req.body.podcastPlan = "free";
    if (req.file && req.file.filename) {
      req.body.image = req.file.filename;
    }
    Podcast.create(req.body, (err, podcast) => {
      if (err) return next(err);
      req.flash("msg", "added to the list to verify by admin");
      res.redirect("/podcasts");
    });
  }
);

router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  Podcast.findById(id, (err, podcast) => {
    if (err) return next(err);
    res.render("podcastDetail", { podcast });
  });
});

router.use(auth.isAdminLogged);

router.post("/", upload.single("image"), (req, res, next) => {
  req.body.isVerified = true;
  if (req.file && req.file.filename) {
    req.body.image = req.file.filename;
  }
  Podcast.create(req.body, (err, podcast) => {
    if (err) return next(err);
    res.redirect("/podcasts");
  });
});

router.get("/:id/edit", (req, res, next) => {
  const id = req.params.id;
  Podcast.findById(id, (err, podcast) => {
    if (err) return next(err);
    res.render("editPodcast", { podcast });
  });
});

router.post("/:id", upload.single("image"), (req, res, next) => {
  const id = req.params.id;
  if (req.file && req.file.filename) {
    req.body.image = req.file.filename;
    Podcast.findById(id, (err, podcast) => {
      const imagePath = path.join(
        __dirname,
        "../",
        `public/uploads/${podcast.image}`
      );
      if (err) return next(err);
      fs.unlink(imagePath, (err) => {
        if (err) return console.log(err);
        console.log("file deleted");
      });
    });
  }
  Podcast.findByIdAndUpdate(id, req.body, (err, podcast) => {
    if (err) return next(err);
    res.redirect("/podcasts/" + id);
  });
});

router.get("/:id/delete", (req, res, next) => {
  const id = req.params.id;
  Podcast.findByIdAndDelete(id, (err, podcast) => {
    const imagePath = path.join(
      __dirname,
      "../",
      `public/uploads/${podcast.image}`
    );
    if (err) return next(err);
    fs.unlink(imagePath, (err) => {
      if (err) return console.log(err);
      console.log("file deleted");
    });
    res.redirect("/podcasts");
  });
});

router.get("/:id/verify", (req, res, next) => {
  const id = req.params.id;
  Podcast.findByIdAndUpdate(
    id,
    { $set: { isVerified: true } },
    (err, podcast) => {
      if (err) return next(err);
      res.redirect("/podcasts/");
    }
  );
});

module.exports = router;
