const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

// Import your partner's routers 
// Note: If these files are sitting inside your root 'routes' folder instead of 'src/routes', 
// use '../routes/userrouter' and '../routes/hostrouter' instead!
//const userRoutes = require('./routes/userrouter');
//const hostRoutes = require('./routes/hostrouter');

const app = express();

// 1. View Engine Setup (Compiles EJS from the views folder)
app.set('view engine', 'ejs');
// Point to the views folder (resolving from campusly backend/src/views or root views)
app.set('views', path.join(__dirname, '..', 'views'));

// 2. Middleware parsing rules & Static assets folder linking
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// 3. Base Route Linkers
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);

// 4. Mount the Marketplace Views 
//app.use(userRoutes);
//app.use('/host', hostRoutes);

module.exports = app;
