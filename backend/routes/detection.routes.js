const express = require('express');
const router = express.Router();

const {
  createDetection,
  getDetections,
  updateDetection
} = require('../controllers/detection.controller');

// ==============================
// CREATE DETECTION (ML INPUT)
// ==============================
router.post('/', createDetection);

// ==============================
// GET ALL DETECTIONS
// ==============================
router.get('/', getDetections);

// ==============================
// UPDATE DETECTION STATUS
// ==============================
router.patch('/:id', updateDetection);

module.exports = router;