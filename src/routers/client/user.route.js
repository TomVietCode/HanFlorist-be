const express = require("express");
const router = express.Router();
const userController = require("../../controllers/client/user.controller");
const uploadCloud = require("../../middlewares/uploadCloud.middleware")

router.get("/profile", userController.profile);

router.patch("/", uploadCloud("avatar"), userController.updateAPI);

module.exports = router;
