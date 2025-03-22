const express = require("express")
const router = express.Router()

const controller = require("../../controllers/admin/order.controller")

router.get("/", controller.listAPI)

router.get("/:id", controller.getAPI)

router.patch("/:id", controller.updateAPI)

module.exports = router