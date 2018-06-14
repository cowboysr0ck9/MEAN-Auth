const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const config = require("../config/database");
const User = require("../models/user");

// Register
router.post("https://eadsgraphic-auth-app.herokuapp.com/register", function(req, res, next) {
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });

    User.addUser(newUser, function(err, user) {
        if (err) {
            res.json({
                success: false,
                msg: "Failed to register user"
            });
        } else {
            res.json({
                success: true,
                msg: "User successfully registered"
            });
        }
    });
});

// Authenticate
router.post("https://eadsgraphic-auth-app.herokuapp.com/authenticate", function(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, function(err, user) {
        if (err) throw Error;
        if (!user) {
            return res.json({
                success: false,
                msg: "User not found!"
            });
        }

        User.comparePassword(password, user.password, function(err, isMatch) {
            if (err) throw Error;
            if (isMatch) {
                // Creates and Returns JWT
                const token = jwt.sign(user.toJSON(), config.secret, {
                    expiresIn: 604800 // 1 Week
                });

                res.json({
                    success: true,
                    token: "JWT " + token,
                    user: {
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email
                    }
                });
            } else {
                return res.json({
                    success: false,
                    msg: "Wrong Password"
                });
            }
        });
    });
});

// Profile
router.get(
    "https://eadsgraphic-auth-app.herokuapp.com/profile",
    passport.authenticate("jwt", {
        session: false
    }),
    function(req, res, next) {
        res.json({
            user: req.user
        });
    }
);

// Validate
router.get("https://eadsgraphic-auth-app.herokuapp.com/validate", function(req, res, next) {
    res.send("validate");
});

module.exports = router;
