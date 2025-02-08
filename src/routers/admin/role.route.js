const express = require("express")
const router = express.Router()
const controller = require("../../controllers/admin/role.controller")

router.get("/", controller.listApi)

router.post("/", controller.createApi)

router.patch("/:id", controller.updateApi)

router.delete("/:id", controller.deleteApi)

router.get("/permissions", controller.getPermissionApi)

router.patch("/permissions", controller.updatePermissionApi)

module.exports = router
