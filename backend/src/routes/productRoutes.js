const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const { handleUpload } = require("../middleware/uploadMiddleware");

const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} = require("../controllers/productController");

const {
    uploadProductImages,
    getProductImages,
    deleteProductImage,
} = require("../controllers/productImageController");

// Standard catalog routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", adminMiddleware, createProduct);
router.put("/:id", adminMiddleware, updateProduct);
router.delete("/:id", adminMiddleware, deleteProduct);

// Product images routes (Phase 13)
// POST   /api/products/:id/images - Admin only upload
router.post("/:id/images", adminMiddleware, handleUpload, uploadProductImages);

// GET    /api/products/:id/images - Public gallery view
router.get("/:id/images", getProductImages);

// DELETE /api/products/:id/images/:imageId - Admin only delete
router.delete("/:id/images/:imageId", adminMiddleware, deleteProductImage);

module.exports = router;


