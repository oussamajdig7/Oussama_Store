const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const { handleUpload } = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validate");
const {
    createProductSchema,
    updateProductSchema,
    productQuerySchema,
} = require("../schemas/productSchemas");
const {
    idParamSchema,
    productImageParamsSchema,
} = require("../schemas/commonSchemas");

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

// Standard catalog routes with validation
router.get("/", validate({ query: productQuerySchema }), getAllProducts);
router.get("/:id", validate({ params: idParamSchema }), getProductById);
router.post("/", adminMiddleware, validate({ body: createProductSchema }), createProduct);
router.put("/:id", adminMiddleware, validate({ params: idParamSchema, body: updateProductSchema }), updateProduct);
router.delete("/:id", adminMiddleware, validate({ params: idParamSchema }), deleteProduct);

// Product images routes (Phase 13)
// POST   /api/products/:id/images - Admin only upload
router.post(
    "/:id/images",
    adminMiddleware,
    validate({ params: idParamSchema }),
    handleUpload,
    uploadProductImages
);

// GET    /api/products/:id/images - Public gallery view
router.get("/:id/images", validate({ params: idParamSchema }), getProductImages);

// DELETE /api/products/:id/images/:imageId - Admin only delete
router.delete(
    "/:id/images/:imageId",
    adminMiddleware,
    validate({ params: productImageParamsSchema }),
    deleteProductImage
);

module.exports = router;
