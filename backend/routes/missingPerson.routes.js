const router = require('express').Router();
const controller = require('../controllers/missingPerson.controller');
const upload = require('../config/multer');

// 📸 MUST BE  IMAGES
router.post('/', upload.array('images', 2), controller.createMissingPerson);

router.get('/', controller.getMissingPersons);
router.get('/:id', controller.getMissingPersonById);
router.patch('/:id', controller.updateMissingPerson);

module.exports = router;