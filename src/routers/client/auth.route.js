const express = require("express")
const passport = require("passport")
const requireAuth = require("../../middlewares/auth.middleware")
const router = express.Router()
const controller = require("../../controllers/client/auth.controller")

// Navigate to google router
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))

router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
  const { token } = req.user
  res.redirect(`${process.env.FRONTEND_URL || "https://hanflorist.vercel.app"}/login-success?token=${token}`);
})

router.post("/signup", controller.signup);

router.post("/login", controller.login);

router.post("/forgot-password", controller.forgotPassword);

router.post("/otp-password", controller.otpPassword);

router.patch("/reset-password", requireAuth("client"), controller.resetPassword);

module.exports = router
