const express = require('express');
const authMiddleware = require('../../../middleware/authMiddleware');
const { uploadProductImages } = require('../../../middleware/uploadProductImages');
const { uploadImages } = require('./controller');

const router = express.Router();

router.post(
    '/product-images',
    authMiddleware,
    (req, res, next) => {
        uploadProductImages(req, res, (err) => {
            if (err) {
                return res.status(400).json({
                    error: err.message || 'Image upload failed.',
                });
            }
            next();
        });
    },
    uploadImages
);

module.exports = router;
