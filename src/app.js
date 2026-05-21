const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const adminRoutes = require('./modules/admin');
const publicRoutes = require('./modules/public');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

const corsOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(
    cors({
        origin: corsOrigin,
        credentials: true,
    })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

module.exports = app;
