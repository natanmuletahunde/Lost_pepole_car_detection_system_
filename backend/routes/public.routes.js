const express = require('express');
const router = express.Router();
const { getPublicStats } = require('../controllers/public.controller');

router.get('/stats', getPublicStats);

module.exports = router;
