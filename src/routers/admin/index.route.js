const authRoute = require("./auth.route")
module.exports = (app) => {
  const path = "/admin"

  app.use(path + "/auth", authRoute)
}