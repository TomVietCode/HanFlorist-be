const express = require("express")
const router = express.Router()

const controller = require("../../controllers/client/order.controller")
const validateCreateOrder = require("../../validates/order")

router.post("/", validateCreateOrder, controller.createOrderAPI)

router.get("/", controller.listAPI)

router.get("/:id", controller.getAPI)

// router.patch("/:id", controller.updateAPI)

module.exports = router