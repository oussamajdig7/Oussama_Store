const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { addToCartSchema, updateCartItemSchema } = require("../schemas/cartSchemas");
const { idParamSchema } = require("../schemas/commonSchemas");

// All cart routes strictly require authentication
router.use(authMiddleware);

// GET /api/cart - Get user's cart
router.get("/", cartController.getCart);

// POST /api/cart - Add item to cart (validated positive quantity & positive product_id)
router.post("/", validate({ body: addToCartSchema }), cartController.addToCart);

// PUT /api/cart/:id - Update item quantity (validated positive item ID & non-negative quantity)
router.put(
    "/:id",
    validate({ params: idParamSchema, body: updateCartItemSchema }),
    cartController.updateCartItem
);

// DELETE /api/cart/:id - Remove single item from cart (validated item ID)
router.delete("/:id", validate({ params: idParamSchema }), cartController.removeCartItem);

// DELETE /api/cart - Clear entire cart
router.delete("/", cartController.clearCart);

module.exports = router;
