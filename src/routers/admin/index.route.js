const requireAuth = require("../../middlewares/auth.middleware")
const userRoute = require("./user.route")
const productRoute = require("./product.route")
const categoryRoute = require("./category.route")
const roleRoute = require("./role.route")

module.exports = (app) => {
  const path = "/admin"

  app.use(path + "/", userRoute)

  app.use(path + "/products", requireAuth("admin"), productRoute)

  app.use(path + "/categories", requireAuth("admin"), categoryRoute)

  app.use(path + "/roles", requireAuth("admin"), roleRoute)
}
