const express = require("express")
const app = express()

app.get("/", (req, res) => {
  res.status(200).json("Hello")
  console.log("xin chao")
})

app.listen(3001, () => {
  console.log("App is listening on port 3001")
})