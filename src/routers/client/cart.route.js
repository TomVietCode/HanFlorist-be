const express = require("express")
const router = express.Router()

const controller = require("../../controllers/client/cart.controller")

router.get("/", controller.index)

router.post("/add/:productId", controller.addPost)

router.delete("/delete/:productId", controller.delete)

router.get("/update/:productId/:newQuantity", controller.update)

module.exports = router