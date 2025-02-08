const express = require("express")
const router = express.Router()
const controller = require("../../controllers/admin/category.controller")
const checkRole = require("../../middlewares/checkRole.middleware")

router.get("/", checkRole(["category_read"]), controller.listApi)

router.post("/", checkRole(["category_create"]), controller.createApi)

router.get("/:id", checkRole(["category_read"]), controller.getApi)

router.patch("/:id", checkRole(["category_update"]), controller.updateApi)

router.delete("/:id", checkRole(["category_delete"]), controller.deleteApi)

router.patch("/", checkRole(["category_update"]), controller.updateManyApi)

module.exports = router