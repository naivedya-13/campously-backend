const express = require('express');
const { getHome, getTestimonials, getCategories } = require('./controller');

const router = express.Router();

router.get('/', getHome);
router.get('/testimonials', getTestimonials);
router.get('/categories', getCategories);

module.exports = router;
