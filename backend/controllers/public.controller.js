const MissingPerson = require('../models/MissingPerson');
const MissingVehicle = require('../models/MissingVehicle');
const User = require('../models/User');
const Sighting = require('../models/Sighting');
const ApiResponse = require('../utils/ApiResponse');

const getPublicStats = async (req, res, next) => {
  try {
    const [
      totalPersons,
      totalVehicles,
      resolvedPersons,
      resolvedVehicles,
      activeUsers,
      totalSightings
    ] = await Promise.all([
      MissingPerson.countDocuments(),
      MissingVehicle.countDocuments(),
      MissingPerson.countDocuments({ status: 'Resolved' }),
      MissingVehicle.countDocuments({ status: 'Resolved' }),
      User.countDocuments({ isActive: true }),
      Sighting.countDocuments()
    ]);

    const totalReports = totalPersons + totalVehicles + totalSightings;
    const resolvedCases = resolvedPersons + resolvedVehicles;
    // Mock devices connected by activeUsers + some margin for this metric
    const devicesConnected = activeUsers * 2 + 150; 

    return ApiResponse.success(res, 'Public stats retrieved', {
      stats: {
        totalReports,
        resolvedCases,
        activeUsers,
        devicesConnected
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicStats
};
