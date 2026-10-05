const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const validate = require("../middleware/validate");
const {
    createCategorySchema,
    updateCategorySchema,
} = require("../schemas/categorySchemas");
const { idParamSchema } = require("../schemas/commonSchemas");

const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} = require("../controllers/categoryController");

router.get("/", getAllCategories);
router.get("/:id", validate({ params: idParamSchema }), getCategoryById);
router.post("/", adminMiddleware, validate({ body: createCategorySchema }), createCategory);
router.put("/:id", adminMiddleware, validate({ params: idParamSchema, body: updateCategorySchema }), updateCategory);
router.delete("/:id", adminMiddleware, validate({ params: idParamSchema }), deleteCategory);

module.exports = router;
