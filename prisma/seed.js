require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'password123';

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

async function main() {
    console.log('🌱 Seeding database...\n');

    await prisma.cartItem.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    const password = await hashPassword(DEMO_PASSWORD);

    const admin = await prisma.user.create({
        data: {
            name: 'Campus Admin',
            email: 'admin@campously.edu',
            password,
            role: 'ADMIN',
        },
    });

    const student1 = await prisma.user.create({
        data: {
            name: 'Priya Sharma',
            email: 'student1@campously.edu',
            password,
            role: 'STUDENT',
        },
    });

    const student2 = await prisma.user.create({
        data: {
            name: 'Arjun Patel',
            email: 'student2@campously.edu',
            password,
            role: 'STUDENT',
        },
    });

    const products = await Promise.all([
        prisma.product.create({
            data: {
                name: 'Calculus Textbook (3rd Ed.)',
                description: 'Light wear on cover, all pages intact. Great for MATH 101.',
                price: 350,
                stock: 2,
                sellerId: admin.id,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Scientific Calculator',
                description: 'Casio fx-991EX. Works perfectly, includes cover.',
                price: 1200,
                stock: 1,
                sellerId: admin.id,
            },
        }),
        prisma.product.create({
            data: {
                name: 'USB-C Laptop Charger',
                description: '65W charger, compatible with most laptops.',
                price: 450,
                stock: 5,
                sellerId: admin.id,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Desk Lamp',
                description: 'LED desk lamp with adjustable brightness.',
                price: 280,
                stock: 3,
                sellerId: admin.id,
            },
        }),
    ]);

    const [book, calculator, charger, lamp] = products;

    const student1Cart = await prisma.cart.create({
        data: { userId: student1.id },
    });

    await prisma.cartItem.create({
        data: {
            cartId: student1Cart.id,
            productId: book.id,
            quantity: 1,
        },
    });

    await prisma.cartItem.create({
        data: {
            cartId: student1Cart.id,
            productId: charger.id,
            quantity: 2,
        },
    });

    const student1Wishlist = await prisma.wishlist.create({
        data: { userId: student1.id },
    });

    await prisma.wishlistItem.create({
        data: {
            wishlistId: student1Wishlist.id,
            productId: calculator.id,
        },
    });

    await prisma.wishlistItem.create({
        data: {
            wishlistId: student1Wishlist.id,
            productId: lamp.id,
        },
    });

    const student2Wishlist = await prisma.wishlist.create({
        data: { userId: student2.id },
    });

    await prisma.wishlistItem.create({
        data: {
            wishlistId: student2Wishlist.id,
            productId: book.id,
        },
    });

    console.log('✅ Seed completed!\n');
    console.log('── Demo logins (password for all: password123) ──');
    console.log('Admin:    admin@campously.edu');
    console.log('Student:  student1@campously.edu');
    console.log('Student:  student2@campously.edu\n');
    console.log('── Sample data ──');
    console.log(`Products:  ${products.length} (listed by admin)`);
    console.log('Student1:  cart has textbook + 2x charger');
    console.log('Student1:  wishlist has calculator + lamp');
    console.log('Student2:  wishlist has textbook\n');
}

main()
    .catch((error) => {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
