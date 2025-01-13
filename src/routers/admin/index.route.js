const requireAuth = require("../../middlewares/auth.middleware")
const authRoute = require("./auth.route")
const productRoute = require("./product.route")

module.exports = (app) => {
  const path = "/admin"

  app.use(path + "/auth", authRoute)
  app.use(path + "/products", requireAuth("admin"), productRoute)
}
