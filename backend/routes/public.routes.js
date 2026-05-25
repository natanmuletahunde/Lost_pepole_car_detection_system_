const express = require('express');
const router = express.Router();
const { getPublicStats, askAIAssistant } = require('../controllers/public.controller');

router.get('/stats', getPublicStats);
router.post('/ai-assistant', askAIAssistant);

module.exports = router;
