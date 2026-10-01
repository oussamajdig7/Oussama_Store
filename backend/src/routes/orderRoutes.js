const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

// All order routes require authentication
router.use(authMiddleware);

// POST /api/orders - Create a new order from current user cart
router.post("/", orderController.createOrder);

// GET /api/orders - List user orders
router.get("/", orderController.getOrders);

// GET /api/orders/:id - Get single order details
router.get("/:id", orderController.getOrderById);

module.exports = router;
