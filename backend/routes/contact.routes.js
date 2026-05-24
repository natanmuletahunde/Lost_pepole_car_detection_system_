const express = require('express');
const { sendContactEmail } = require('../controllers/contact.controller');

const router = express.Router();

router.post('/contact', sendContactEmail);

module.exports = router;