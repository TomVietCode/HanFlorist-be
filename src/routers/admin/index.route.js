const authRoute = require("./auth.route")
const productRoute = require("./products.route")

module.exports = (app) => {
  const path = "/admin"

  app.use(path + "/auth", authRoute)
  app.use(path + "/products", productRoute)
}