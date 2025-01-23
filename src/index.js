const dotenv = require("dotenv")
dotenv.config()
const express = require("express")
const database = require("./config/connectDB")
const clientRoute = require("./routers/client/index.route")
const adminRoute = require("./routers/admin/index.route")
const cors = require("cors")
database.connect()
const app = express()
const port = process.env.PORT
const cookieParser = require('cookie-parser');

app.use(cookieParser());
// CORS
app.use(cors())

// Parse body 
app.use(express.json())

// Client router
clientRoute(app)

// Admin router
adminRoute(app)

app.listen(port, () => {
  console.log("App is listening on port " + port)
})