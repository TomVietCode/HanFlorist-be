const productRoute = require("./product.route")

module.exports = (app) => {
  const version = "/v1"

  app.use(version + "/products", productRoute)
}