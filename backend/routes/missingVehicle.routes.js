const router = require('express').Router();
const controller = require('../controllers/missingVehicle.controller');

router.post('/', controller.createMissingVehicle);

router.get('/', controller.getMissingVehicles);
router.get('/:id', controller.getMissingVehicleById);
router.patch('/:id', controller.updateMissingVehicle);

module.exports = router;