const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const authMiddleware = require("../middleware/authMiddleware");

// All wishlist routes require authentication
router.use(authMiddleware);

// GET /api/wishlist - Get user's wishlist
router.get("/", wishlistController.getWishlist);

// POST /api/wishlist - Add product to wishlist
router.post("/", wishlistController.addToWishlist);

// DELETE /api/wishlist/:productId - Remove product from wishlist
router.delete("/:productId", wishlistController.removeFromWishlist);

module.exports = router;
