const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");

// All cart routes require authentication
router.use(authMiddleware);

// GET /api/cart - Get user's cart
router.get("/", cartController.getCart);

// POST /api/cart - Add item to cart (or update if already exists)
router.post("/", cartController.addToCart);

// PUT /api/cart/:id - Update item quantity
router.put("/:id", cartController.updateCartItem);

// DELETE /api/cart/:id - Remove single item from cart
router.delete("/:id", cartController.removeCartItem);

// DELETE /api/cart - Clear entire cart
router.delete("/", cartController.clearCart);

module.exports = router;
