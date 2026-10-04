const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Target directory for product image storage
const uploadDirectory = path.join(__dirname, "../../uploads/products");

// Ensure target directory exists on server startup
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Multer disk storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure folder exists before writing
        if (!fs.existsSync(uploadDirectory)) {
            fs.mkdirSync(uploadDirectory, { recursive: true });
        }
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext) ? ext : ".jpg";
        const productId = req.params.id ? `p${req.params.id}` : "prod";
        const randomHash = crypto.randomBytes(6).toString("hex");
        const uniqueName = `${productId}-${Date.now()}-${randomHash}${safeExt}`;
        cb(null, uniqueName);
    },
});

// File filter: Only allow JPEG, PNG, WEBP
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const allowedExts = [".jpg", ".jpeg", ".png", ".webp"];

    const ext = path.extname(file.originalname).toLowerCase();
    const isMimeValid = allowedMimeTypes.includes(file.mimetype.toLowerCase());
    const isExtValid = allowedExts.includes(ext);

    if (isMimeValid && isExtValid) {
        cb(null, true);
    } else {
        const error = new Error("Invalid file type. Only JPEG, PNG, and WEBP formats are allowed.");
        error.code = "INVALID_FILE_TYPE";
        cb(error, false);
    }
};

// 5 MB max file size limit
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 5, // up to 5 images at once
    },
    fileFilter,
});

/**
 * Express wrapper middleware that intercepts Multer errors (file size, invalid type)
 * and formats standardized JSON error responses instead of HTML/unhandled exceptions.
 */
const handleUpload = (req, res, next) => {
    // Accept either array of files under 'images' field or single file under 'image'
    const uploadMiddleware = upload.fields([
        { name: "images", maxCount: 5 },
        { name: "image", maxCount: 1 },
    ]);

    uploadMiddleware(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({
                        success: false,
                        message: "File too large. Maximum image size is 5MB.",
                    });
                }
                if (err.code === "LIMIT_UNEXPECTED_FILE") {
                    return res.status(400).json({
                        success: false,
                        message: "Unexpected field name or too many files uploaded (max 5).",
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: `Upload error: ${err.message}`,
                });
            }

            if (err.code === "INVALID_FILE_TYPE" || err.message.includes("Invalid file type")) {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            }

            return res.status(500).json({
                success: false,
                message: "Error processing file upload",
            });
        }
        next();
    });
};

module.exports = {
    handleUpload,
    uploadDirectory,
};
