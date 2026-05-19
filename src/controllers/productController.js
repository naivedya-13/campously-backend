const prisma = require('../config/prisma');

// 1. ADD NEW PRODUCT (POST)
const createProduct = async (req, res) => {
    try {
        const { name, description, price } = req.body;

        if (!name || !price) {
            return res.status(400).json({ error: "Name and price are required" });
        }

        const newProduct = await prisma.product.create({
            data: {
                name,
                description: description || "",
                price: parseFloat(price)
            }
        });

        res.status(201).json({ message: "Product added successfully!", product: newProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. GET ALL PRODUCTS (GET)
const getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createProduct, getAllProducts };