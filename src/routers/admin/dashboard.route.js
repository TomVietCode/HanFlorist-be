const express = require("express")
const router = express.Router()
const controller = require("../../controllers/admin/dashboard.controller")
const checkRole = require("../../middlewares/checkRole.middleware")

// Health check endpoint
router.get("/health", controller.healthCheck)

// Get dashboard overview data
router.get("/overview", controller.getOverview)

// Get revenue statistics
router.get("/revenue", controller.getRevenue)

// Get order statistics
router.get("/orders", controller.getOrderStats)

// Get product statistics
router.get("/products", controller.getProductStats)

// Get user statistics
router.get("/users", controller.getUserStats)

module.exports = router 