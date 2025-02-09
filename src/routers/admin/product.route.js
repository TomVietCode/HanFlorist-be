const express = require("express")
const router = express.Router()
const controller = require("../../controllers/admin/product.controller")
const uploadCloud = require("../../middlewares/uploadCloud.middleware")
const checkRole = require("../../middlewares/checkRole.middleware")

router.get("/", checkRole(["product_read"]), controller.listApi)

router.post("/", checkRole(["product_create"]), uploadCloud("thumbnail"), controller.createApi)

router.get("/:id", checkRole(["product_read"]), controller.getApi)

router.patch("/:id", checkRole(["product_update"]), uploadCloud("thumbnail"), controller.updateApi)

router.delete("/:id", checkRole(["product_delete"]), controller.deleteApi)

router.patch("/", checkRole(["product_update"]), controller.updateManyApi)

module.exports = router