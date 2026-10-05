const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { addToWishlistSchema } = require("../schemas/wishlistSchemas");
const { productIdParamSchema } = require("../schemas/commonSchemas");

// All wishlist routes require authentication
router.use(authMiddleware);

// GET /api/wishlist - Get user's wishlist
router.get("/", wishlistController.getWishlist);

// POST /api/wishlist - Add product to wishlist (validated product_id)
router.post("/", validate({ body: addToWishlistSchema }), wishlistController.addToWishlist);

// DELETE /api/wishlist/:productId - Remove product from wishlist (validated productId)
router.delete("/:productId", validate({ params: productIdParamSchema }), wishlistController.removeFromWishlist);

module.exports = router;
