const Detection = require('../models/Detection');
const MissingPerson = require('../models/MissingPerson');
const MissingVehicle = require('../models/MissingVehicle');
const Notification = require('../models/Notification');
const Sighting = require('../models/Sighting');
const PcLocation = require('../models/PcLocation');
const bot = require('../telegramBot');
const axios = require('axios');
const { SerialPort } = require('serialport');
const { isValidObjectId } = require('../utils/helpers');

// ==============================
// GSM SETUP
// ==============================
let gsmPort;

try {
  gsmPort = new SerialPort({
    path: process.env.SERIAL_PORT || "COM5",
    baudRate: 9600,
  });

  gsmPort.on('open', () => {
    console.log('📡 GSM SMS Module Connected');
  });

  gsmPort.on('error', (err) => {
    console.log('⚠️ GSM Error:', err.message);
  });

} catch (err) {
  console.log('⚠️ GSM not available');
}

// ==============================
// LOCATION CACHE
// ==============================
let cachedLocation = { lat: null, lon: null, timestamp: 0 };

async function getCurrentLocation() {
  try {
    // 1. Try to fetch the latest high-accuracy location reported by the device (saved via /api/v1/pc-location)
    const latestPcLocation = await PcLocation.findOne().sort({ updatedAt: -1 });
    if (latestPcLocation && latestPcLocation.latitude && latestPcLocation.longitude) {
      console.log(`📍 Using latest high-accuracy PC Location: ${latestPcLocation.latitude}, ${latestPcLocation.longitude}`);
      return {
        lat: latestPcLocation.latitude,
        lon: latestPcLocation.longitude,
        location: latestPcLocation.address || 'Device Location'
      };
    }
  } catch (dbErr) {
    console.warn('⚠️ Error fetching PcLocation from DB:', dbErr.message);
  }

  // 2. Fallback to cached IP-based geolocation
  const now = Date.now();

  if (cachedLocation.lat && (now - cachedLocation.timestamp < 30 * 60 * 1000)) {
    return cachedLocation;
  }

  try {
    const res = await axios.get(
      'http://ip-api.com/json/?fields=lat,lon,status,message',
      { timeout: 8000 }
    );

    if (res.data.status === "success") {
      cachedLocation = {
        lat: res.data.lat,
        lon: res.data.lon,
        timestamp: now
      };

      console.log(`📍 Real location fetched: ${res.data.lat}, ${res.data.lon}`);
      return cachedLocation;
    }
  } catch (error) {
    console.warn('⚠️ IP Geolocation failed:', error.message);
  }

  return { lat: 8.570883, lon: 39.281890 };
}

// ==============================
// SAFE SMS FUNCTION (FIXED)
// ==============================
function sendSMS(phone, message) {
  if (!gsmPort || !gsmPort.isOpen) {
    console.log('⚠️ GSM Port not open');
    return;
  }

  // HARD CLEAN MESSAGE (SIM900 SAFE)
  let cleanMessage = message
    .replace(/[^\x00-\x7F]/g, '') // remove emojis/non-ascii
    .replace(/\s+/g, ' ')         // remove extra spaces
    .trim();

  // LIMIT LENGTH (CRITICAL FIX)
  if (cleanMessage.length > 150) {
    cleanMessage = cleanMessage.substring(0, 150) + '...';
  }

  const command = `${phone}|${cleanMessage}\n`;

  console.log('📨 Sending to Arduino:', command);

  gsmPort.write(command, (err) => {
    if (err) {
      console.error('Write Error:', err.message);
    } else {
      console.log('✅ Command sent to Arduino');
    }
  });
}

// ==============================
// CREATE DETECTION
// ==============================
exports.createDetection = async (req, res) => {
  try {
    const {
      type,
      registrationId,
      name,
      detectionImage,
      confidence,
      behavior,
      latitude,
      longitude,
      location
    } = req.body;

    if (!registrationId || !detectionImage) {
      return res.status(400).json({
        success: false,
        message: 'registrationId and detectionImage are required'
      });
    }

    if (!isValidObjectId(registrationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registrationId format'
      });
    }

    const isCarType = type === 'Car' || type === 'Vehicle';
    let matchedEntity = null;

    if (isCarType) {
      matchedEntity = await MissingVehicle.findById(registrationId);
    } else {
      matchedEntity = await MissingPerson.findById(registrationId);
    }

    if (!matchedEntity) {
      return res.status(404).json({
        success: false,
        message: isCarType ? 'Missing vehicle not found' : 'Missing person not found'
      });
    }

    let lat, lon, locationString;
    if (latitude !== undefined && longitude !== undefined) {
      lat = Number(latitude);
      lon = Number(longitude);
      locationString = location || `${lat}, ${lon}`;
    } else {
      const loc = await getCurrentLocation();
      lat = loc.lat;
      lon = loc.lon;
      locationString = `${lat}, ${lon}`;
    }

    const mapsLink = `https://maps.google.com/?q=${lat},${lon}`;

    const defaultName = isCarType
      ? `${matchedEntity.brand || ''} ${matchedEntity.model || ''}`.trim()
      : `${matchedEntity.firstName || ''} ${matchedEntity.lastName || ''}`.trim();

    const detection = new Detection({
      type: isCarType ? 'Car' : 'Person',
      registrationId,
      name: name || defaultName || 'Unknown',
      licensePlate: isCarType ? (req.body.licensePlate || matchedEntity.plateNumber || '') : undefined,
      location: locationString,
      latitude: lat,
      longitude: lon,
      locationLink: mapsLink,
      detectionImage,
      confidence: Number(confidence) || 0.6,
      behavior: behavior || 'Detected',
      priority: (confidence || 0) > 0.7 ? 'High' : 'Normal',
      status: 'Pending'
    });

    await detection.save();

    console.log(`✅ Detection saved for ${detection.name}`);

    const reporter = matchedEntity.reportedBy;

    // ===================== CREATE SIGHTING RECORD =====================
    if (reporter && reporter.userId && isValidObjectId(reporter.userId)) {
      try {
        const sightingData = {
          user: reporter.userId,
          type: 'cctv',
          name: detection.name,
          description: `Automatic ML Detection via CCTV. Confidence: ${(confidence * 100).toFixed(1)}%`,
          location: {
            type: 'Point',
            coordinates: [lon, lat], // Longitude first for GeoJSON
            address: locationString
          },
          images: [detectionImage],
          caseId: registrationId,
          status: 'pending'
        };

        if (isCarType) {
          sightingData.plateNumber = req.body.licensePlate || matchedEntity.plateNumber || '';
        }

        const cctvSighting = new Sighting(sightingData);
        await cctvSighting.save();
        console.log('✅ CCTV Sighting record created');
      } catch (sightingErr) {
        console.error('❌ Error creating CCTV Sighting:', sightingErr.message);
      }
    }

    // ===================== IN-APP NOTIFICATION =====================
    if (reporter && reporter.userId && isValidObjectId(reporter.userId)) {
      try {
        await Notification.create({
          recipient: reporter.userId,
          title: 'ML Detection Match!',
          message: `The ML system detected a potential match for ${detection.name} at location: ${locationString} with ${(confidence * 100).toFixed(1)}% confidence.`,
          type: 'alert',
          priority: 'high'
        });
        console.log('✅ In-App Notification Sent');
      } catch (notifErr) {
        console.error('❌ In-App Notification Error:', notifErr.message);
      }
    }

    // ===================== TELEGRAM =====================
    if (reporter && reporter.telegramChatId) {
      const entityLabel = isCarType ? 'VEHICLE' : 'PERSON';
      let caption = `MISSING ${entityLabel} DETECTED!\n` +
        `Name: ${detection.name}\n`;
      
      if (isCarType && detection.licensePlate) {
        caption += `Plate: ${detection.licensePlate}\n`;
      }
      
      caption += `Location: ${locationString}\n` +
        `Confidence: ${(confidence * 100).toFixed(1)}%\n` +
        `Time: ${new Date().toLocaleString()}\n` +
        `Maps: ${mapsLink}`;

      try {
        const base64Data = detectionImage.replace(/^data:image\/\w+;base64,/, "");
        const photoBuffer = Buffer.from(base64Data, 'base64');

        await bot.sendPhoto(reporter.telegramChatId, photoBuffer, {
          caption,
          parse_mode: 'Markdown'
        });

        console.log('✅ Telegram Photo Alert Sent');

      } catch (err) {
        console.error('❌ Telegram Error:', err.message);
        await bot.sendMessage(reporter.telegramChatId, caption);
      }
    }

    // ===================== SMS (FIXED) =====================
    if (reporter && reporter.phone) {
      const smsMessage =
        `ALERT! ${isCarType ? 'Vehicle ' : ''}${detection.name} ` +
        `Conf:${(confidence * 100).toFixed(0)}% ` +
        `Loc:${lat},${lon} ` +
        `Map:${mapsLink}`;

      console.log("DEBUG - Sending SMS to:", reporter.phone);
      console.log("DEBUG - SMS Length:", smsMessage.length);
      console.log("DEBUG - SMS Content:", smsMessage);

      sendSMS(reporter.phone, smsMessage);

    } else {
      console.log('⚠️ No phone number found for reporter');
    }

    res.status(201).json({
      success: true,
      message: 'Detection saved successfully',
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
// GET DETECTIONS
// ==============================
exports.getDetections = async (req, res) => {
  try {
    const detections = await Detection.find().sort({ createdAt: -1 });
    res.json({ success: true, data: detections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// UPDATE DETECTION
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
      message: 'Detection updated successfully',
      data: detection
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};