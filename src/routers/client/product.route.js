const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/product.controller");

router.get("/", controller.listAPI);

router.get("/category/:slugCategory", controller.listProductCategoryAPI);

router.get("/:slug", controller.getAPI);

module.exports = router;