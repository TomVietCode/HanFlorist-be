const express = require("express");
const router = express.Router();
const userController = require("../../controllers/client/user.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

router.post("/register", userController.register);

router.post("/login", userController.login);

router.post("/logout", userController.logout);

router.post("/forgot-password", userController.forgotPasswordPost);

router.post("/otp-password", userController.otpPasswordPost);

router.patch("/reset-password", userController.resetPasswordPatch);

module.exports = router;
