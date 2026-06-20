const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require('../middleware.js');
const usersController = require("../controllers/users.js");

router.route("/register")
    .get(usersController.renderRegisterForm)
    .post(wrapAsync(usersController.register));

router.route("/login")
    .get(usersController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/users/login",
            failureFlash: true,
        }),
        usersController.login
    );

router.get("/logout", usersController.logout);

module.exports = router;