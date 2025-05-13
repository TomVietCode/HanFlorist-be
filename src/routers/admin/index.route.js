const requireAuth = require("../../middlewares/auth.middleware")
const authRoute = require("./auth.route")
const productRoute = require("./product.route")
const categoryRoute = require("./category.route")
const roleRoute = require("./role.route")
const orderRoute = require("./order.route")
const userRoute = require("./user.route")
const dashboardRoute = require("./dashboard.route")

module.exports = (app) => {
  const path = "/admin"

  app.use(path + "/auth", authRoute)

  app.use(path + "/dashboard", requireAuth("admin"), dashboardRoute)

  app.use(path + "/products", requireAuth("admin"), productRoute)

  app.use(path + "/categories", requireAuth("admin"), categoryRoute)

  app.use(path + "/roles", requireAuth("admin"), roleRoute)

  app.use(path + "/orders", requireAuth("admin"), orderRoute)
  
  app.use(path + "/users", requireAuth("admin"), userRoute)
}
