const uploadImages = async (req, res) => {
    try {
        if (!req.files?.length) {
            return res.status(400).json({ error: 'At least one image file is required.' });
        }

        const baseUrl =
            process.env.API_PUBLIC_URL ||
            `http://localhost:${process.env.PORT || 5000}`;

        const urls = req.files.map(
            (file) => `${baseUrl}/uploads/products/${file.filename}`
        );

        res.status(201).json({
            message: 'Images uploaded successfully.',
            urls,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { uploadImages };
