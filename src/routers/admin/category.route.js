const express = require("express")
const router = express.Router()
const controller = require("../../controllers/admin/category.controller")

router.get("/", controller.listApi)

router.post("/", controller.createApi)

router.get("/:id", controller.getApi)

router.patch("/:id", controller.updateApi)

router.delete("/:id", controller.deleteApi)

router.patch("/", controller.updateManyApi)

router.patch("/:id", controller.updateApi)

module.exports = router