const path = require("path");
const fs = require("fs");
const db = require("../config/database");

// =========================================
// POST /api/products/:id/images (Admin)
// =========================================
const uploadProductImages = (req, res) => {
    try {
        const { id } = req.params;
        const productId = Number(id);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        // Verify product exists in database
        const product = db.prepare("SELECT id, name FROM products WHERE id = ?").get(productId);

        const files = [
            ...(req.files?.images || []),
            ...(req.files?.image || []),
        ];

        if (!product) {
            // Clean up uploaded files so no orphaned files remain on disk
            for (const f of files) {
                if (fs.existsSync(f.path)) {
                    try {
                        fs.unlinkSync(f.path);
                    } catch (e) {
                        console.warn("Could not delete orphan file:", e.message);
                    }
                }
            }
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        if (files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No image file provided. Please attach files in field 'image' or 'images'.",
            });
        }

        const insertStmt = db.prepare(
            "INSERT INTO product_images (product_id, image_url) VALUES (?, ?)"
        );

        const createdImages = [];

        for (const file of files) {
            const relativeUrl = `/uploads/products/${file.filename}`;
            const result = insertStmt.run(productId, relativeUrl);

            createdImages.push({
                id: result.lastInsertRowid,
                product_id: productId,
                image_url: relativeUrl,
                filename: file.filename,
                size: file.size,
                mimetype: file.mimetype,
            });
        }

        res.status(201).json({
            success: true,
            message: `${createdImages.length} image(s) uploaded successfully`,
            data: createdImages,
        });
    } catch (error) {
        console.error("Error uploading product images:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error while saving product images",
        });
    }
};

// =========================================
// GET /api/products/:id/images (Public)
// =========================================
const getProductImages = (req, res) => {
    try {
        const { id } = req.params;
        const productId = Number(id);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const product = db.prepare("SELECT id FROM products WHERE id = ?").get(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const images = db
            .prepare("SELECT id, product_id, image_url FROM product_images WHERE product_id = ? ORDER BY id ASC")
            .all(productId);

        res.status(200).json({
            success: true,
            count: images.length,
            data: images,
        });
    } catch (error) {
        console.error("Error fetching product images:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error fetching product images",
        });
    }
};

// =========================================
// DELETE /api/products/:id/images/:imageId (Admin)
// =========================================
const deleteProductImage = (req, res) => {
    try {
        const { id, imageId } = req.params;
        const productId = Number(id);
        const imgId = Number(imageId);

        if (!Number.isInteger(productId) || !Number.isInteger(imgId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product or image ID",
            });
        }

        // Find image record associated with this product
        const image = db
            .prepare("SELECT * FROM product_images WHERE id = ? AND product_id = ?")
            .get(imgId, productId);

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Image not found for this product",
            });
        }

        // Rule 9 & 10: Delete database record and delete physical file safely
        if (image.image_url) {
            const cleanUrl = image.image_url.startsWith("/")
                ? image.image_url.slice(1)
                : image.image_url;
            const diskFilePath = path.join(__dirname, "../../", cleanUrl);

            // Handle missing files safely (do not crash if file does not exist on disk)
            if (fs.existsSync(diskFilePath)) {
                try {
                    fs.unlinkSync(diskFilePath);
                } catch (fsErr) {
                    console.warn(`Warning: Could not remove disk file ${diskFilePath}:`, fsErr.message);
                }
            } else {
                console.warn(`Info: Disk file was already missing (${diskFilePath}) - safe deletion proceeding.`);
            }
        }

        // Remove row from database
        db.prepare("DELETE FROM product_images WHERE id = ?").run(imgId);

        res.status(200).json({
            success: true,
            message: "Product image deleted successfully",
            data: {
                id: imgId,
                product_id: productId,
            },
        });
    } catch (error) {
        console.error("Error deleting product image:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error deleting product image",
        });
    }
};

module.exports = {
    uploadProductImages,
    getProductImages,
    deleteProductImage,
};
