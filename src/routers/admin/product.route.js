const express = require("express")
const router = express.Router()
const controller = require("../../controllers/admin/product.controller")
const uploadCloud = require("../../middlewares/uploadCloud.middleware")

router.get("/", controller.listApi)

router.post("/", uploadCloud, controller.createApi)

router.get("/:id", controller.getApi)

router.patch("/:id", uploadCloud, controller.updateApi)

router.delete("/:id", controller.deleteApi)

router.patch("/", controller.updateManyApi)

module.exports = router