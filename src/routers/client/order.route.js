const express = require("express")
const router = express.Router()

const controller = require("../../controllers/client/order.controller")

router.post("/", controller.createOrderAPI)

router.get("/vnpay-return", controller.handleVNPayReturn)

router.get("/:orderId", controller.getAPI)

router.get("/", controller.listAPI)


module.exports = router