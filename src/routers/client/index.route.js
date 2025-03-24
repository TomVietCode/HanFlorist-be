const productRoute = require("./product.route")
const userRoute = require("./user.route")
const homeRoutes = require("./home.route")
const cartRoute = require("./cart.route")
const searchRoute = require("./search.route")
const authRoute = require("./auth.route")
const orderRoute = require("./order.route")
const requireAuth = require("../../middlewares/auth.middleware")
const { createCartMdl } = require("../../middlewares/cart.middleware")
const Category = require("../../models/category.model")
const buildTree = require("../../helpers/buildTree")
module.exports = (app) => {
  const version = "/v1"
  app.use(requireAuth("client"))
  app.use(createCartMdl)
  
  app.use("/auth", authRoute)

  app.use(version + "/", homeRoutes)

  app.use(version + "/products", productRoute)

  app.use(version + "/users", userRoute);

  app.use(version + "/carts", cartRoute);

  app.use(version + "/search", searchRoute);

  app.use(version + "/orders", orderRoute)

  app.use(version + "/categories", async (req, res) => {
    const categories = await Category.find({
      status: "active",
    }).lean()
    
    const categoriesTree = buildTree(categories);
    res.status(200).json(categoriesTree);
  })
}