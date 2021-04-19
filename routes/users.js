const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const flash = require("connect-flash");

const User = require("../models/Users");

router.get("/register", (req, res) => res.render("register"));

router.post("/register", (req, res) => {
  const { name, number, password, password2 } = req.body;
  let errors = [];

  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password should be atleast 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      number,
    });
  } else {
    User.findOne({ number: number }).then((user) => {
      if (user) {
        errors.push({ msg: "Mobile Number is already in use" });
        res.render("register", {
          errors,
          name,
        });
      } else {
        User.findOne({ name: name }).then((user) => {
          if (user) {
            errors.push({ msg: "Username already in use" });
            res.render("register", {
              errors,
            });
          } else {
            const newUser = new User({
              name,
              number,
              password,
            });

            bcrypt.genSalt(10, (err, salt) =>
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;

                newUser.password = hash;
                newUser
                  .save()
                  .then((user) => {
                    req.flash(
                      "success_msg",
                      "You are now registered and can log in"
                    );
                    res.redirect("/");
                  })
                  .catch((err) => console.log(err));
              })
            );
          }
        });
      }
    });
  }
});

router.get("/login", (req, res, next) => {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: "Invalid Username or Password",
  }),
  (req, res, next) => {
    res.redirect("/");
  }
);

module.exports = router;
