const router = require('express').Router();
const controller = require('../controllers/missingPerson.controller');
const upload = require('../config/multer');
const { protect } = require('../middlewares/auth');

// CREATE
router.post(
  '/',
  protect,
  upload.array('images'),
  controller.createMissingPerson
);

// GET MY REPORTS (must be before /:id)
router.get('/my-reports', protect, controller.getMyMissingPersons);

// GET ALL
router.get('/', controller.getMissingPersons);

// GET ONE
router.get('/:id', controller.getMissingPersonById);

// RESOLVE (reporter confirms found)
router.patch('/:id/resolve', protect, controller.resolveMissingPerson);

// UPDATE
router.patch('/:id', protect, controller.updateMissingPerson);

module.exports = router;