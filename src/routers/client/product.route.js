const express = require("express");
const router = express.Router();
const productController = require("../../controllers/client/product.controller");

router.get("/", productController.index);

router.get("/:slug", productController.detail);

router.get("/:slugCategory", productController.slugCategory);

module.exports = router;