const productRoute = require("./product.route")
const userRoute = require("./user.route")
const homeRoutes = require("./home.route")
const cartRoute = require("./cart.route")
const searchRoute = require("./search.route")
module.exports = (app) => {
  const version = "/v1"

  app.use(version + "/", homeRoutes)

  app.use(version + "/products", productRoute)

  app.use(version + "/users", userRoute);

  app.use(version + "/products", productRoute);

  app.use(version + "/cart", cartRoute);

  app.use(version + "/search", searchRoute);
}