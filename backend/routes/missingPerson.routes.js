const router = require('express').Router();
const controller = require('../controllers/missingPerson.controller');
const upload = require('../config/multer');
const { protect } = require('../middlewares/auth');

// 📸 MUST BE AT LEAST 2 IMAGES
router.post(
  '/',
  protect, // 🔥 THIS IS WHAT YOU WERE MISSING
  upload.array('images'),
  controller.createMissingPerson
);

router.get('/', controller.getMissingPersons);
router.get('/:id', controller.getMissingPersonById);
router.patch('/:id', protect, controller.updateMissingPerson);

module.exports = router;