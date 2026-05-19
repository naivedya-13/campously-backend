const express = require('express');
const cors = require('cors');
const path = require('path');
const adminRoutes = require('./modules/admin');
const publicRoutes = require('./modules/public');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

module.exports = app;
