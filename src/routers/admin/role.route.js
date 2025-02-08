const express = require("express")
const router = express.Router()
const controller = require("../../controllers/admin/role.controller")
const checkRole = require("../../middlewares/checkRole.middleware")

router.get("/", checkRole(["role_read"]), controller.listApi)

router.post("/", checkRole(["role_create"]), controller.createApi)

router.patch("/permissions", checkRole(["role_update"]), controller.updatePermissionApi)

router.patch("/:id", checkRole(["role_update"]), controller.updateApi)

router.delete("/:id", checkRole(["role_delete"]), controller.deleteApi)


module.exports = router
