const prisma = require('../config/prisma');

// 1. CREATE / ADD TO CART (POST) - Uses Token from Header for user-wise cart creation
const addToCart = async (req, res) => {
    try {
        const userId = req.user.id; // Extracted from authMiddleware via JWT Token
        const { productId, quantity } = req.body;

        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        // Check if the user already has a cart; if not, create a new one
        let cart = await prisma.cart.findUnique({ where: { userId: parseInt(userId) } });
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId: parseInt(userId) } });
        }

        // Check if the product already exists in this user's cart
        const existingItem = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId: parseInt(productId) }
        });

        if (existingItem) {
            // If item exists, update the quantity
            const updatedItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + (parseInt(quantity) || 1) }
            });
            return res.status(200).json({ message: "Cart quantity updated!", item: updatedItem });
        }

        // If it's a completely new item, create a new cart item record
        const newItem = await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: parseInt(productId),
                quantity: parseInt(quantity) || 1
            }
        });

        res.status(201).json({ message: "Added to cart successfully!", item: newItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. GET CART ITEMS (GET) - Uses Token from Header to display user-wise cart items
const getCart = async (req, res) => {
    try {
        const userId = req.user.id; // Extracted from verified JWT Token

        // Fetch user's cart along with items and nested product details
        const cart = await prisma.cart.findUnique({
            where: { userId: parseInt(userId) },
            include: {
                items: {
                    include: {
                        product: true // Includes product details like name and price
                    }
                }
            }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(200).json({ message: "Your cart is empty", items: [] });
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { addToCart, getCart };