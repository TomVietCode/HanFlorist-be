const productRoute = require("./product.route")
const userRoute = require("./user.route")
const homeRoutes = require("./home.route")
const cartRoute = require("./cart.route")
const searchRoute = require("./search.route")
const authRoute = require("./auth.route")
const orderRoute = require("./order.route")
const requireAuth = require("../../middlewares/auth.middleware")
module.exports = (app) => {
  const version = "/v1"

  app.use("/auth", authRoute)

  app.use(version + "/", homeRoutes)

  app.use(version + "/products", productRoute)

  app.use(version + "/users", userRoute);

  app.use(version + "/carts", requireAuth("client"), cartRoute);

  app.use(version + "/search", searchRoute);

  app.use(version + "/orders", orderRoute)
}