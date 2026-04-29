const Detection = require('../models/Detection');
const MissingPerson = require('../models/MissingPerson');
const MissingVehicle = require('../models/MissingVehicle');
const bot = require('../telegramBot');
const { SerialPort } = require('serialport');

// ==============================
// GSM SETUP (optional)
// ==============================
let gsmPort;

try {
  gsmPort = new SerialPort({
    path: process.env.SERIAL_PORT || 'COM5',
    baudRate: 9600,
  });

  gsmPort.on('open', () => console.log('📡 GSM connected'));
  gsmPort.on('error', (err) => console.log('GSM error:', err.message));
} catch (err) {
  console.log('⚠️ GSM not available');
}

// ==============================
// CREATE DETECTION (SMART CORE)
// ==============================
exports.createDetection = async (req, res) => {
  try {
    const {
      type,
      name,
      licensePlate,
      location,
      detectionImage,
      confidence,
      behavior
    } = req.body;

    // 🧪 Basic validation
    if (!type || !location || confidence === undefined) {
      return res.status(400).json({
        success: false,
        message: 'type, location and confidence are required'
      });
    }

    // 🎯 Ignore weak detections
    if (confidence < 0.5) {
      return res.status(200).json({
        success: false,
        message: 'Low confidence ignored'
      });
    }

    let matchedPerson = null;
    let matchedVehicle = null;
    let reporter = null;

    // ==============================
    // 🔍 PERSON MATCHING
    // ==============================
    if (type === 'Person' && name) {
      matchedPerson = await MissingPerson.findOne({
        status: 'Active',
        $or: [
          { firstName: { $regex: name, $options: 'i' } },
          { lastName: { $regex: name, $options: 'i' } }
        ]
      });

      if (matchedPerson) {
        reporter = matchedPerson.reportedBy;
      }
    }

    // ==============================
    // 🚗 VEHICLE MATCHING
    // ==============================
    if (type === 'Vehicle' && licensePlate) {
      matchedVehicle = await MissingVehicle.findOne({
        plateNumber: licensePlate.toUpperCase(),
        status: 'Active'
      });

      if (matchedVehicle) {
        reporter = matchedVehicle.reportedBy;
      }
    }

    // ==============================
    // 💾 SAVE DETECTION
    // ==============================
    const detection = new Detection({
      type,
      name: name || null,
      licensePlate: licensePlate || null,
      location,
      detectionImage: detectionImage || null,
      confidence,
      behavior: behavior || 'Detected',
      priority: confidence > 0.7 ? 'High' : 'Normal',
      personId: matchedPerson?._id || null,
      vehicleId: matchedVehicle?._id || null
    });

    await detection.save();

    // ==============================
    // 🚨 ALERT SYSTEM (ONLY IF MATCH FOUND)
    // ==============================
    if (reporter) {
      const message = `
🚨 MATCH FOUND!

Type: ${type}
${name ? `👤 Name: ${name}` : ''}
${licensePlate ? `🚗 Plate: ${licensePlate}` : ''}

📍 Location: ${location}
🎯 Confidence: ${(confidence * 100).toFixed(1)}%
🕒 ${new Date().toLocaleString()}
`;

      // 📲 TELEGRAM
      if (reporter.telegramUsername) {
        try {
          await bot.sendMessage(`@${reporter.telegramUsername}`, message);
        } catch (err) {
          console.log('Telegram failed:', err.message);
        }
      }

      // 📡 SMS (GSM)
      if (reporter.phone && gsmPort?.isOpen) {
        try {
          gsmPort.write(`${reporter.phone}|${message}\n`);
        } catch (err) {
          console.log('SMS failed:', err.message);
        }
      }

      console.log('🚨 Alert sent to reporter');
    }

    // ==============================
    // ✅ RESPONSE
    // ==============================
    res.status(201).json({
      success: true,
      message: reporter ? 'Match found and alert sent' : 'Detection stored',
      data: detection
    });

  } catch (error) {
    console.error('Detection Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==============================
// GET ALL DETECTIONS
// ==============================
exports.getDetections = async (req, res) => {
  try {
    const detections = await Detection.find()
      .populate('personId')
      .populate('vehicleId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: detections
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==============================
// UPDATE STATUS
// ==============================
exports.updateDetection = async (req, res) => {
  try {
    const { status } = req.body;

    const detection = await Detection.findById(req.params.id);

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: 'Detection not found'
      });
    }

    detection.status = status || detection.status;
    await detection.save();

    res.json({
      success: true,
      message: 'Detection updated',
      data: detection
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};