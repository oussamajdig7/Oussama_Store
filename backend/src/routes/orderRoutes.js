const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { createOrderSchema } = require("../schemas/orderSchemas");
const { idParamSchema } = require("../schemas/commonSchemas");

// All order routes require authentication
router.use(authMiddleware);

// POST /api/orders - Create a new order from current user cart (validated shipping address)
router.post("/", validate({ body: createOrderSchema }), orderController.createOrder);

// GET /api/orders - List user orders
router.get("/", orderController.getOrders);

// GET /api/orders/:id - Get single order details (validated positive order ID)
router.get("/:id", validate({ params: idParamSchema }), orderController.getOrderById);

module.exports = router;
