const express = require("express")
const router = express.Router()
const Product = require("../../models/products.model")
router.get("/", async(req, res) => {
  const products = await Product.find({
    status: "active",

  })

  const newProducts = products.map((item) => {
    item.priceNew = Math.round(((1 - item.discountPercentage/100) * item.price)).toLocaleString()
    return item
  })

  res.status(200).json({
    data: newProducts
  })
})



module.exports = router