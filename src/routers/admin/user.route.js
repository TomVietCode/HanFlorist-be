const express = require("express")
const router = express.Router()
const controller = require("../../controllers/admin/user.controller")
const checkRole = require("../../middlewares/checkRole.middleware")
const uploadCloud = require("../../middlewares/uploadCloud.middleware")

router.get("/", checkRole(["user_read"]), controller.listApi)

router.get("/profile", controller.profileApi)

router.patch("/profile", controller.updateProfileApi)

router.get("/:id", checkRole(["user_read"]), controller.getApi)

router.post("/", checkRole(["user_create"]), uploadCloud("avatar"), controller.createApi)

router.patch("/:id", checkRole(["user_update"]), uploadCloud("avatar"), controller.updateApi)

router.delete("/:id", checkRole(["user_delete"]), controller.deleteApi)

module.exports = router
