const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} = require("../controllers/productController");

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", adminMiddleware, createProduct);
router.put("/:id", adminMiddleware, updateProduct);
router.delete("/:id", adminMiddleware, deleteProduct);

module.exports = router;

