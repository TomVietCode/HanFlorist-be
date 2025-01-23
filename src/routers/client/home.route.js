const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/home.controller");

// [GET] /v1/home
router.get("/home", controller.index);

module.exports = router;