const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} = require("../controllers/categoryController");

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", adminMiddleware, createCategory);
router.put("/:id", adminMiddleware, updateCategory);
router.delete("/:id", adminMiddleware, deleteCategory);

module.exports = router;
