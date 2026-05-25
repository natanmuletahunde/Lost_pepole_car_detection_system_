const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/ai.controller');

/**
 * @swagger
 * /api/v1/ai/chat:
 *   post:
 *     tags:
 *       - AI Support
 *     summary: Chat with the Flega AI Assistant
 *     description: Submit a natural language support question or search query. The AI automatically parses cases from the database and returns a localized support response.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string, example: "Is there a missing person named Samuel?" }
 *               language: { type: string, example: "en", enum: [en, am, om] }
 *               history: { type: array, items: { type: object } }
 *     responses:
 *       200:
 *         description: Chat response generated successfully
 *       500:
 *         description: Server error
 */
router.post('/chat', chatWithAI);

module.exports = router;
