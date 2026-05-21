require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'P@ssword123';

const DEMO_STUDENTS = [
    {
        enrollmentId: '467936',
        name: 'Riya',
        college: 'Campus State University',
        department: 'Computer Science',
        year: 2,
        email: 'riya@campus.edu',
        phone: '+91 98765 43210',
    },
    {
        enrollmentId: '474145',
        name: 'Sanskriti',
        college: 'Campus State University',
        department: 'Electrical Engineering',
        year: 3,
        email: 'sanskriti@campus.edu',
        phone: '+91 98765 43211',
    },
    {
        enrollmentId: '467887',
        name: 'Anandita',
        college: 'Campus State University',
        department: 'Mechanical Engineering',
        year: 2,
        email: 'anandita@campus.edu',
        phone: '+91 98765 43212',
    },
    {
        enrollmentId: '466802',
        name: 'Astha',
        college: 'Campus State University',
        department: 'Business Administration',
        year: 4,
        email: 'astha@campus.edu',
        phone: '+91 98765 43213',
    },
    {
        enrollmentId: '467889',
        name: 'Gopali',
        college: 'Campus State University',
        department: 'Information Technology',
        year: 1,
        email: 'gopali@campus.edu',
        phone: '+91 98765 43214',
    },
];

const CATEGORIES = [
    { name: 'Textbooks', slug: 'textbooks', icon: '📚' },
    { name: 'Electronics', slug: 'electronics', icon: '💻' },
    { name: 'Furniture', slug: 'furniture', icon: '🪑' },
    { name: 'Clothing', slug: 'clothing', icon: '👕' },
    { name: 'Sports', slug: 'sports', icon: '⚽' },
    { name: 'Other', slug: 'other', icon: '📦' },
];

const PLATFORM_STATS = [
    { key: 'products_listed', value: '1200+', label: 'Products Listed' },
    { key: 'happy_buyers', value: '5000+', label: 'Happy Buyers' },
    { key: 'avg_savings', value: '70%', label: 'Average Savings' },
];

const BANNERS = [
    {
        title: 'Back to College Sale',
        subtitle: 'Save up to 70% on textbooks, laptops & hostel essentials',
        imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80',
        link: '/products?featured=true',
        sortOrder: 1,
    },
    {
        title: 'Sell Your Old Gear',
        subtitle: 'List items in minutes — trusted by 5000+ campus buyers',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
        link: '/sell',
        sortOrder: 2,
    },
    {
        title: 'Electronics & Gaming',
        subtitle: 'PS5, laptops, monitors — verified student sellers only',
        imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80',
        link: '/products?category=electronics',
        sortOrder: 3,
    },
    {
        title: 'Hostel Move-In Deals',
        subtitle: 'Mattresses, desks, kettles — everything for your room',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c17ea9bc?w=1200&q=80',
        link: '/products?category=furniture',
        sortOrder: 4,
    },
];

const TESTIMONIALS = [
    {
        name: 'Ananya Iyer',
        university: 'Campus State University, Pune',
        comment:
            'Sold my old MacBook in two days and bought a Casio calculator for half the shop price. Campusly is honestly the best thing for broke engineering students.',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    },
    {
        name: 'Vikram Singh',
        university: 'Campus State University, Delhi NCR',
        comment:
            'Met the seller at the library gate — no shady deals, no spam. Saved ₹8,000 on my semester textbooks compared to the campus bookstore.',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    },
    {
        name: 'Meera Joshi',
        university: 'Campus State University, Mumbai',
        comment:
            'Bought a cycle and a hostel mattress from seniors graduating this year. Chat feature made negotiating price super easy.',
        rating: 4,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
];

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

async function clearDatabase() {
    await prisma.message.deleteMany();
    await prisma.conversationParticipant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.recentlyViewed.deleteMany();
    await prisma.searchHistory.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.review.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.otpVerification.deleteMany();
    await prisma.category.deleteMany();
    await prisma.banner.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.platformStat.deleteMany();
    await prisma.user.deleteMany();
}

function buildProducts(categoryMap, sellers) {
    const { admin, s1, s2, s3, s4, s5 } = sellers;
    const cat = (slug) => categoryMap[slug];

    return [
        {
            name: 'HP Pavilion 15 — i5, 16GB RAM',
            description:
                'Second-year CS student selling lightly used HP Pavilion. 512GB SSD, Windows 11, battery health 87%. Perfect for coding and online classes. Includes original charger and laptop bag.',
            price: 38500,
            originalPrice: 54999,
            stock: 1,
            condition: 'LIKE_NEW',
            categoryId: cat('electronics'),
            sellerId: s2.id,
            location: 'North Hostel Block B',
            tags: 'laptop,hp,programming',
            isFeatured: true,
            isTrending: true,
            viewCount: 342,
            images: [
                'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
                'https://images.unsplash.com/photo-1525547719571-a2d4ac4d6b0b?w=800&q=80',
            ],
        },
        {
            name: 'Lenovo ThinkPad E14 (2022)',
            description:
                'ThinkPad in excellent condition. 14" FHD display, Ryzen 5, 8GB RAM (upgradeable). Ideal for mechanical design software. Minor scratch on lid, fully functional.',
            price: 42000,
            originalPrice: 62000,
            stock: 1,
            condition: 'GOOD',
            categoryId: cat('electronics'),
            sellerId: admin.id,
            location: 'Admin Office, Main Campus',
            tags: 'laptop,lenovo,thinkpad',
            isFeatured: true,
            isTrending: false,
            viewCount: 198,
            images: ['https://images.unsplash.com/photo-1588872659452-457e2f7f4d4e?w=800&q=80'],
        },
        {
            name: 'Casio fx-991EX Classwiz Calculator',
            description:
                'Approved for engineering exams. Solar + battery powered. All modes working. Includes hard cover case. Used for 2 semesters only.',
            price: 1450,
            originalPrice: 1995,
            stock: 2,
            condition: 'LIKE_NEW',
            categoryId: cat('electronics'),
            sellerId: s1.id,
            location: 'CS Department, Room 204',
            tags: 'calculator,casio,engineering',
            isFeatured: false,
            isTrending: true,
            viewCount: 521,
            images: ['https://images.unsplash.com/photo-1587148220147-fcd7e71e2f9e?w=800&q=80'],
        },
        {
            name: 'Engineering Mathematics — Kreyszig (10th Ed.)',
            description:
                'Complete textbook for MATH-201. Highlighted important formulas only. No torn pages. Previous owner scored 9.2 GPA with this copy.',
            price: 650,
            originalPrice: 1299,
            stock: 1,
            condition: 'GOOD',
            categoryId: cat('textbooks'),
            sellerId: s3.id,
            location: 'Mechanical Block, Library Steps',
            tags: 'math,engineering,textbook',
            isFeatured: false,
            isTrending: true,
            viewCount: 89,
            images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80'],
        },
        {
            name: 'Data Structures in C — Tenenbaum',
            description:
                'Classic DS book. Some pencil notes in margins (helpful annotations). Covers trees, graphs, sorting — everything for placements.',
            price: 480,
            originalPrice: 899,
            stock: 1,
            condition: 'FAIR',
            categoryId: cat('textbooks'),
            sellerId: s1.id,
            location: 'North Hostel Block A',
            tags: 'cs,programming,placements',
            isFeatured: false,
            isTrending: false,
            viewCount: 156,
            images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80'],
        },
        {
            name: 'Principles of Management — Robbins',
            description:
                'MBA core textbook. BBA 3rd year selling. Almost new — bought extra copy by mistake. Pick up from Girls Hostel reception.',
            price: 550,
            originalPrice: 1100,
            stock: 1,
            condition: 'BRAND_NEW',
            categoryId: cat('textbooks'),
            sellerId: s4.id,
            location: 'Girls Hostel, Gate 2',
            tags: 'bba,management,business',
            isFeatured: false,
            isTrending: false,
            viewCount: 44,
            images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'],
        },
        {
            name: 'Hero Sprint Pro Cycle — 26"',
            description:
                'Single-speed campus cycle. New tyres fitted last month. Lock and bell included. Great for hostel-to-class commute. Selling before internship.',
            price: 3200,
            originalPrice: 6500,
            stock: 1,
            condition: 'GOOD',
            categoryId: cat('sports'),
            sellerId: s5.id,
            location: 'Sports Complex Parking',
            tags: 'cycle,commute,hero',
            isFeatured: true,
            isTrending: true,
            viewCount: 267,
            images: [
                'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80',
                'https://images.unsplash.com/photo-1571068316347-75fb187731b9?w=800&q=80',
            ],
        },
        {
            name: 'PlayStation 5 Disc Edition + 2 Controllers',
            description:
                'PS5 with God of War Ragnarok and FC 24. Moving to hostel with strict gaming ban — must sell. Includes HDMI cable and original box.',
            price: 42000,
            originalPrice: 54990,
            stock: 1,
            condition: 'LIKE_NEW',
            categoryId: cat('electronics'),
            sellerId: s5.id,
            location: 'IT Hostel Block C, Room 312',
            tags: 'gaming,ps5,console',
            isFeatured: true,
            isTrending: true,
            viewCount: 891,
            images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c432?w=800&q=80'],
        },
        {
            name: 'Logitech G502 Hero Gaming Mouse',
            description:
                'RGB gaming mouse, 25K DPI sensor. Used for 6 months. No double-click issue. Original box and weights included.',
            price: 2200,
            originalPrice: 4495,
            stock: 1,
            condition: 'GOOD',
            categoryId: cat('electronics'),
            sellerId: s1.id,
            location: 'North Hostel Block A, Room 108',
            tags: 'gaming,mouse,logitech',
            isFeatured: false,
            isTrending: true,
            viewCount: 178,
            images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80'],
        },
        {
            name: '24" Dell Monitor — Full HD IPS',
            description:
                'Dell P2419H. Perfect second monitor for coding. No dead pixels. HDMI and DisplayPort cables included. Stand adjustable.',
            price: 7500,
            originalPrice: 14500,
            stock: 1,
            condition: 'GOOD',
            categoryId: cat('electronics'),
            sellerId: s2.id,
            location: 'EE Lab Building, Room 12',
            tags: 'monitor,dell,display',
            isFeatured: false,
            isTrending: false,
            viewCount: 112,
            images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d663e?w=800&q=80'],
        },
        {
            name: 'Study Desk + Chair Combo',
            description:
                'IKEA-style study table (120×60 cm) with ergonomic chair. Ideal for hostel room. Disassembly help available. Minor stain on desk corner.',
            price: 2800,
            originalPrice: 5500,
            stock: 1,
            condition: 'FAIR',
            categoryId: cat('furniture'),
            sellerId: s4.id,
            location: 'Girls Hostel, Room 45',
            tags: 'desk,chair,hostel',
            isFeatured: false,
            isTrending: false,
            viewCount: 73,
            images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80'],
        },
        {
            name: 'Single Mattress (3" Foam) — Hostel Size',
            description:
                'Standard hostel bed size (72×30 inches). Clean, no bed bugs. Used 1 year. Cover washed before listing. Pick-up only.',
            price: 1200,
            originalPrice: 2500,
            stock: 1,
            condition: 'GOOD',
            categoryId: cat('furniture'),
            sellerId: s3.id,
            location: 'Boys Hostel Block 3',
            tags: 'mattress,hostel,bedding',
            isFeatured: false,
            isTrending: false,
            viewCount: 201,
            images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'],
        },
        {
            name: 'Electric Kettle 1.5L — Hostel Approved',
            description:
                'Pigeon Amaze Plus kettle. Auto shut-off, boil-dry protection. Perfect for maggi and chai. Works in hostel power limits.',
            price: 650,
            originalPrice: 1199,
            stock: 2,
            condition: 'LIKE_NEW',
            categoryId: cat('other'),
            sellerId: admin.id,
            location: 'Admin Store, Main Gate',
            tags: 'kettle,hostel,kitchen',
            isFeatured: false,
            isTrending: false,
            viewCount: 334,
            images: ['https://images.unsplash.com/photo-1563298723-dcfeff4d5bfb?w=800&q=80'],
        },
        {
            name: 'LED Study Lamp with USB Charging Port',
            description:
                '3 brightness levels, flexible neck. USB port charges phone while you study. Barely used — upgrading to smart lamp.',
            price: 450,
            originalPrice: 899,
            stock: 3,
            condition: 'BRAND_NEW',
            categoryId: cat('other'),
            sellerId: s2.id,
            location: 'EE Hostel Block 1',
            tags: 'lamp,study,hostel',
            isFeatured: false,
            isTrending: false,
            viewCount: 67,
            images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80'],
        },
        {
            name: 'Campus Hoodie — CS Department (Size L)',
            description:
                'Official CS fest hoodie 2024. Worn twice. Navy blue with gold print. Unisex fit. Great for winter exams season.',
            price: 800,
            originalPrice: 1500,
            stock: 1,
            condition: 'LIKE_NEW',
            categoryId: cat('clothing'),
            sellerId: s1.id,
            location: 'CS Department Lounge',
            tags: 'hoodie,merch,cs',
            isFeatured: false,
            isTrending: false,
            viewCount: 45,
            images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'],
        },
        {
            name: 'Cricket Kit — Bat, Pads, Gloves',
            description:
                'SG Kashmir Willow bat + youth pads and gloves. Used one intramural season. Great for hostel team practice.',
            price: 3500,
            originalPrice: 7200,
            stock: 1,
            condition: 'GOOD',
            categoryId: cat('sports'),
            sellerId: s3.id,
            location: 'Sports Ground Equipment Room',
            tags: 'cricket,sports,kit',
            isFeatured: false,
            isTrending: false,
            viewCount: 92,
            images: ['https://images.unsplash.com/photo-1531412535148-afa5a4a04ebb?w=800&q=80'],
        },
        {
            name: 'Badminton Racket (Yonex) + Shuttlecock Pack',
            description:
                'Yonex Nanoray light 4U. Strung with BG65 ti. Includes 6 feather shuttlecocks. Selling as graduating from sports club.',
            price: 1800,
            originalPrice: 3500,
            stock: 1,
            condition: 'GOOD',
            categoryId: cat('sports'),
            sellerId: s4.id,
            location: 'Indoor Sports Complex',
            tags: 'badminton,yonex,racket',
            isFeatured: false,
            isTrending: false,
            viewCount: 58,
            images: ['https://images.unsplash.com/photo-1626224583764-f87db7ac34ea?w=800&q=80'],
        },
        {
            name: 'USB-C Hub 7-in-1 — HDMI, USB 3.0, SD',
            description:
                'Multiport hub for MacBook/Windows USB-C laptops. 4K HDMI output tested. Essential for hostel desk setup.',
            price: 1200,
            originalPrice: 2499,
            stock: 2,
            condition: 'BRAND_NEW',
            categoryId: cat('electronics'),
            sellerId: admin.id,
            location: 'Admin Office, Main Campus',
            tags: 'hub,usb-c,accessories',
            isFeatured: false,
            isTrending: false,
            viewCount: 143,
            images: ['https://images.unsplash.com/photo-1625948515291-696696b1a0f6?w=800&q=80'],
        },
    ];
}

async function main() {
    console.log('🌱 Seeding Campusly marketplace...\n');

    await clearDatabase();

    const password = await hashPassword(DEMO_PASSWORD);

    const admin = await prisma.user.create({
        data: {
            enrollmentId: '100001',
            name: 'Campus Admin',
            email: 'admin@campously.edu',
            password,
            role: 'ADMIN',
            college: 'Campus State University',
            department: 'Administration',
            isVerified: true,
            bio: 'Official Campusly marketplace administrator.',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
        },
    });

    const students = [];
    for (const student of DEMO_STUDENTS) {
        const created = await prisma.user.create({
            data: {
                ...student,
                password,
                role: 'STUDENT',
                isVerified: true,
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
            },
        });
        await prisma.cart.create({ data: { userId: created.id } });
        await prisma.wishlist.create({ data: { userId: created.id } });
        students.push(created);
    }

    const [student1, student2, student3, student4, student5] = students;
    const sellers = {
        admin,
        s1: student1,
        s2: student2,
        s3: student3,
        s4: student4,
        s5: student5,
    };

    const categories = await Promise.all(
        CATEGORIES.map((c) => prisma.category.create({ data: c }))
    );
    const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

    await prisma.platformStat.createMany({ data: PLATFORM_STATS });
    await prisma.banner.createMany({ data: BANNERS });
    await prisma.testimonial.createMany({ data: TESTIMONIALS });

    const productDefs = buildProducts(categoryMap, sellers);
    const products = [];

    for (const def of productDefs) {
        const { images, ...productData } = def;
        const product = await prisma.product.create({
            data: {
                ...productData,
                images: {
                    create: images.map((url, i) => ({ url, sortOrder: i })),
                },
            },
            include: { images: true },
        });
        products.push(product);
    }

    const byName = (name) => products.find((p) => p.name.startsWith(name) || p.name.includes(name));

    const laptop = byName('HP Pavilion');
    const calculator = byName('Casio fx-991EX');
    const mathBook = byName('Engineering Mathematics');
    const dsBook = byName('Data Structures');
    const ps5 = byName('PlayStation 5');
    const cycle = byName('Hero Sprint');
    const kettle = byName('Electric Kettle');
    const monitor = byName('Dell Monitor');
    const mouse = byName('Logitech G502');

    await prisma.review.createMany({
        data: [
            {
                productId: laptop.id,
                userId: student3.id,
                rating: 5,
                comment: 'Laptop exactly as described. Battery life is solid for a full day of classes. Smooth handover at North Hostel.',
            },
            {
                productId: laptop.id,
                userId: student4.id,
                rating: 4,
                comment: 'Great deal for the price. Minor fan noise under heavy load but nothing deal-breaking.',
            },
            {
                productId: calculator.id,
                userId: student2.id,
                rating: 5,
                comment: 'Works perfectly in the exam hall. Saved ₹500 compared to the stationery shop near campus.',
            },
            {
                productId: mathBook.id,
                userId: student1.id,
                rating: 5,
                comment: 'Highlights are actually helpful for revision. Seller was on time at the library steps.',
            },
            {
                productId: ps5.id,
                userId: student1.id,
                rating: 5,
                comment: 'Both controllers and games included as promised. Tested before paying — legit seller.',
            },
            {
                productId: cycle.id,
                userId: student2.id,
                rating: 4,
                comment: 'Good condition cycle for campus commute. Tyres feel new. Lock works fine.',
            },
            {
                productId: kettle.id,
                userId: student5.id,
                rating: 5,
                comment: 'Perfect for hostel room. Auto shut-off works, no issues with warden checks.',
            },
            {
                productId: mouse.id,
                userId: student3.id,
                rating: 4,
                comment: 'Responsive for Valorant and coding. RGB still bright. Fair price.',
            },
        ],
    });

    const student1Cart = await prisma.cart.findUnique({ where: { userId: student1.id } });
    const student1Wishlist = await prisma.wishlist.findUnique({ where: { userId: student1.id } });
    const student2Wishlist = await prisma.wishlist.findUnique({ where: { userId: student2.id } });

    await prisma.cartItem.createMany({
        data: [
            { cartId: student1Cart.id, productId: mathBook.id, quantity: 1 },
            { cartId: student1Cart.id, productId: calculator.id, quantity: 1 },
            { cartId: student1Cart.id, productId: kettle.id, quantity: 1 },
        ],
    });

    await prisma.wishlistItem.createMany({
        data: [
            { wishlistId: student1Wishlist.id, productId: ps5.id },
            { wishlistId: student1Wishlist.id, productId: laptop.id },
            { wishlistId: student1Wishlist.id, productId: cycle.id },
            { wishlistId: student2Wishlist.id, productId: dsBook.id },
            { wishlistId: student2Wishlist.id, productId: monitor.id },
        ],
    });

    const order1 = await prisma.order.create({
        data: {
            userId: student2.id,
            total: 1930,
            status: 'DELIVERED',
            transactionId: 'TXN-CAMP-2024-001',
            items: {
                create: [
                    { productId: calculator.id, quantity: 1, price: 1450 },
                    { productId: dsBook.id, quantity: 1, price: 480 },
                ],
            },
        },
        include: { items: true },
    });

    const order2 = await prisma.order.create({
        data: {
            userId: student1.id,
            total: 650,
            status: 'CONFIRMED',
            transactionId: 'TXN-CAMP-2024-002',
            items: {
                create: [{ productId: mathBook.id, quantity: 1, price: 650 }],
            },
        },
        include: { items: true },
    });

    const chatConvo = await prisma.conversation.create({
        data: {
            productId: mathBook.id,
            participants: {
                create: [
                    { userId: student1.id, lastReadAt: new Date() },
                    { userId: student2.id, lastReadAt: new Date() },
                ],
            },
        },
    });

    await prisma.message.createMany({
        data: [
            {
                conversationId: chatConvo.id,
                senderId: student2.id,
                content: 'Hi Riya, is the Kreyszig math book still available? I need it before Monday\'s tutorial.',
                read: true,
            },
            {
                conversationId: chatConvo.id,
                senderId: student1.id,
                content: 'Yes Sanskriti! It\'s in good condition — highlighted only the important theorems. ₹650 is final.',
                read: true,
            },
            {
                conversationId: chatConvo.id,
                senderId: student2.id,
                content: 'Sounds fair. Can we meet at the central library steps tomorrow at 5 PM?',
                read: true,
            },
            {
                conversationId: chatConvo.id,
                senderId: student1.id,
                content: 'Perfect. I\'ll be wearing the navy CS hoodie. See you there!',
                read: false,
            },
        ],
    });

    const generalConvo = await prisma.conversation.create({
        data: {
            productId: ps5.id,
            participants: {
                create: [{ userId: student1.id }, { userId: student5.id }],
            },
        },
    });

    await prisma.message.createMany({
        data: [
            {
                conversationId: generalConvo.id,
                senderId: student1.id,
                content: 'Hey Gopali, still selling the PS5? Is FC 24 included?',
            },
            {
                conversationId: generalConvo.id,
                senderId: student5.id,
                content: 'Yes bro, both games and an extra controller. Can demo at IT Hostel Block C.',
            },
        ],
    });

    await prisma.notification.createMany({
        data: [
            {
                userId: student1.id,
                title: 'Order Confirmed',
                message: 'Your order for Engineering Mathematics has been confirmed. Meet seller at library steps.',
                type: 'ORDER',
                link: `/orders/${order2.id}`,
            },
            {
                userId: student2.id,
                title: 'Order Delivered',
                message: 'Your order TXN-CAMP-2024-001 has been delivered. Rate your purchase!',
                type: 'ORDER',
                link: `/orders/${order1.id}`,
                read: true,
            },
            {
                userId: student1.id,
                title: 'New Message',
                message: 'Sanskriti sent you a message about Engineering Mathematics.',
                type: 'CHAT',
                link: `/chat/${chatConvo.id}`,
            },
            {
                userId: student1.id,
                title: 'Price Drop on Wishlist',
                message: 'HP Pavilion 15 is trending — 12 students viewed it today.',
                type: 'WISHLIST',
                link: `/product/${laptop.id}`,
            },
            {
                userId: student5.id,
                title: 'New Inquiry',
                message: 'Riya is interested in your PlayStation 5 listing.',
                type: 'CHAT',
                link: `/chat/${generalConvo.id}`,
            },
            {
                userId: student3.id,
                title: 'Product Sold',
                message: 'Your Cricket Kit listing received a new review.',
                type: 'PRODUCT',
            },
            {
                userId: admin.id,
                title: 'Platform Update',
                message: 'Campusly marketplace now has 1200+ listings. Thank you for being an admin!',
                type: 'SYSTEM',
            },
        ],
    });

    await prisma.recentlyViewed.createMany({
        data: [
            { userId: student1.id, productId: laptop.id },
            { userId: student1.id, productId: ps5.id },
            { userId: student1.id, productId: calculator.id },
            { userId: student1.id, productId: mathBook.id },
            { userId: student1.id, productId: cycle.id },
        ],
    });

    await prisma.searchHistory.createMany({
        data: [
            { userId: student1.id, query: 'laptop i5 16gb' },
            { userId: student1.id, query: 'casio calculator' },
            { userId: student2.id, query: 'engineering math textbook' },
            { userId: null, query: 'hostel mattress' },
        ],
    });

    console.log('✅ Seed completed!\n');
    console.log('── Demo logins (password for all: P@ssword123) ──');
    console.log(`Admin enrollment ID: 100001 (${admin.name})`);
    DEMO_STUDENTS.forEach((s) => {
        console.log(`Student: ${s.enrollmentId} — ${s.name} (${s.department}, Year ${s.year})`);
    });
    console.log('\n── Seeded data summary ──');
    console.log(`Categories: ${categories.length}`);
    console.log(`Products: ${products.length}`);
    console.log(`Banners: ${BANNERS.length} | Testimonials: ${TESTIMONIALS.length}`);
    console.log(`Orders: 2 | Reviews: 8 | Notifications: 7`);
    console.log(`Cart items (student1): 3 | Wishlist items: 5`);
    console.log(`Chat conversations: 2 | Recently viewed (student1): 5`);
}

main()
    .catch((error) => {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
