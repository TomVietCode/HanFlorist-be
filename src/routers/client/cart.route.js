const express = require("express")
const router = express.Router()

const controller = require("../../controllers/client/cart.controller")

router.post("/", controller.addProductToCartAPI)

router.get("/", controller.getCartAPI)

router.patch("/", controller.updateProductQuantitiesAPI)

router.delete("/", controller.removeProductFromCartAPI)

module.exports = router