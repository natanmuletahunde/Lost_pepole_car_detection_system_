const MissingVehicle = require('../models/MissingVehicle');
const Sighting = require('../models/Sighting');
const Detection = require('../models/Detection');

// ==============================
// CREATE VEHICLE CASE (OPTIONAL IMAGE SUPPORT)
// ==============================
exports.createMissingVehicle = async (req, res) => {
  try {
    const data = req.body;

    // 🚗 vehicle images optional (but support multiple if provided)
    let images = [];

    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    }

    const caseId = `CASE-MV-${Date.now()}`;

    const vehicle = new MissingVehicle({
      ...data,
      images,
      caseId,
      status: 'Active',
      reportDate: new Date()
    });

    await vehicle.save();

    res.status(201).json({
      success: true,
      message: 'Missing vehicle case created successfully',
      data: vehicle
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==============================
exports.getMissingVehicles = async (req, res) => {
  try {
    const vehicles = await MissingVehicle.find().sort({ createdAt: -1 });
    res.json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
exports.getMissingVehicleById = async (req, res) => {
  try {
    const vehicle = await MissingVehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    const sightings = await Sighting.find({
      type: 'vehicle',
      description: { $regex: vehicle.plateNumber, $options: 'i' }
    });

    const detections = await Detection.find({
      licensePlate: vehicle.plateNumber
    });

    res.json({
      success: true,
      data: { vehicle, sightings, detections }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
exports.updateMissingVehicle = async (req, res) => {
  try {
    const vehicle = await MissingVehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    Object.assign(vehicle, req.body);
    vehicle.lastUpdated = new Date();

    await vehicle.save();

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};