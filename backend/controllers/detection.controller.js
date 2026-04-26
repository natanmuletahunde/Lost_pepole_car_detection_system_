const nodemailer = require('nodemailer');
const bot = require('../telegramBot');
const Detection = require('../models/Detection');
const User = require('../models/User');
;
const { SerialPort } = require('serialport');


// ==============================
// GSM SETUP
// ==============================
let gsmPort;

try {
  gsmPort = new SerialPort({
    path: process.env.SERIAL_PORT || 'COM5',
    baudRate: 9600,
  });

  gsmPort.on('open', () => console.log('GSM Serial Port opened'));
  gsmPort.on('error', (err) => console.error('SerialPort Error:', err.message));

} catch (err) {
  console.error('Failed to initialize GSM port:', err.message);
}

// ==============================
// EMAIL SETUP
// ==============================


// ==============================
// CREATE DETECTION (FROM ML)
// ==============================
exports.createDetection = async (req, res) => {
  try {
    const {
      type,
      userId,
      name,
      licensePlate,
      timestamp,
      location,
      detectionImage,
      confidence,
      priority,
      behavior,
      confidenceThreshold
    } = req.body;

    // ==============================
    // CONFIDENCE CHECK
    // ==============================



    

    // ==============================
    // USER CHECK (NO REGISTRATION MODEL)
    // ==============================
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.consent) {
      return res.status(403).json({
        success: false,
        message: 'User consent required'
      });
    }

    // ==============================
    // SAVE DETECTION
    // ==============================
    const detection = new Detection({
      type,
      userId,
      name,
      licensePlate,
      timestamp,
      location,
      detectionImage: detectionImage || null,
      confidence,
      priority,
      behavior
    });

    await detection.save();

    const alertMessage =
      `🚨 ${type} detected at ${location} on ${new Date(timestamp).toLocaleString('en-US', {
        timeZone: 'Africa/Nairobi'
      })}: ${name || licensePlate}`;

    const tasks = [];

    // ==============================
    // EMAIL
    // ==============================
 

    // ==============================
    // SMS (GSM MODULE)
    // ==============================
    if (user.contact && gsmPort?.isOpen) {
      gsmPort.write(`${user.contact}|${alertMessage}\n`);
    }

    // ==============================
    // TELEGRAM
    // ==============================
    if (user.telegramChatId) {
      tasks.push(
        bot.sendMessage(user.telegramChatId, alertMessage)
      );
    }

    await Promise.all(tasks);

    // ==============================
    // AUDIT LOG
    // ==============================
 

    res.status(201).json({
      success: true,
      detectionId: detection._id
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
    const detections = await Detection.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      detections
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==============================
// UPDATE DETECTION STATUS
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

    detection.status = status;
    await detection.save();

    res.json({
      success: true,
      message: 'Detection updated'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};