const experss = require("express");
const router = experss.Router();
const passport = require("passport");
const { ensureAuthenticated } = require("../config/auth");
const User = require("../models/Users");
const flash = require("connect-flash");
const multer = require("multer");
var path = require("path");

var Storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
var upload = multer({
  storage: Storage,
}).single("file");

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images only!");
  }
}

router.get("/", (req, res) => res.render("login"));

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", {
    name: req.user.name,
    number: req.user.number,
    image: req.user.u_profile_pic,
  });
});

router.post("/image", upload, (req, res, next) => {
  var profile = req.file;
  var profile_image = profile.filename;
  const ProfileImg = new User({
    profile_image,
  });
  console.log(profile_image);
  ProfileImg.save().then((result) => {
    User.findById({ _id: req.user.id }).exec(function (err, value) {
      value.u_profile_pic = profile_image;
      value.save();
      res.redirect("/dashboard");
    });
    User.findByIdAndDelete({ _id: result.id }).exec(function (err, obj) {
      console.log(obj);
    });
  });
});

router.post("/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

router.get("/edit/:name", (req, res, next) => {
  res.render("editform", {
    name: req.params.name,
  });
});

router.post("/editdetails/:name", (req, res, next) => {
  // console.log(req.body.name);
  // res.send("edit");
  User.findOneAndUpdate(
    { name: req.params.name },
    { $set: { name: req.body.name, number: req.body.number } },
    { new: true },
    function (err, value) {
      res.render("dashboard", {
        name: req.body.name,
        number: req.body.number,
        image: req.body.u_profile_pic,
      });
    }
  );
});

module.exports = router;
