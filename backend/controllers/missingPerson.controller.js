const MissingPerson = require('../models/MissingPerson');
const Sighting = require('../models/Sighting');
const Detection = require('../models/Detection');

// ==============================
// CREATE Missing Person (WITH 8 IMAGE RULE)
// ==============================
exports.createMissingPerson = async (req, res) => {
  try {
    const data = req.body;

    // 📸 enforce images
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Minimum 2 images are required'
      });
    }

    const images = req.files.map(file => file.path);

    const caseId = `CASE-MP-${Date.now()}`;

    const person = new MissingPerson({
      ...data,
      images,
      caseId,
      status: 'Active',
      reportDate: new Date()
    });

    await person.save();

    res.status(201).json({
      success: true,
      message: 'Missing person case created',
      data: person
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
exports.getMissingPersons = async (req, res) => {
  try {
    const persons = await MissingPerson.find().sort({ createdAt: -1 });
    res.json({ success: true, data: persons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
exports.getMissingPersonById = async (req, res) => {
  try {
    const person = await MissingPerson.findById(req.params.id);

    if (!person) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const sightings = await Sighting.find({
      type: 'person',
      description: { $regex: person.firstName, $options: 'i' }
    });

    const detections = await Detection.find({
      name: { $regex: person.firstName, $options: 'i' }
    });

    res.json({
      success: true,
      data: { person, sightings, detections }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
exports.updateMissingPerson = async (req, res) => {
  try {
    const person = await MissingPerson.findById(req.params.id);

    if (!person) {
      return res.status(404).json({ success: false });
    }

    Object.assign(person, req.body);
    person.lastUpdated = new Date();

    await person.save();

    res.json({
      success: true,
      message: 'Case updated',
      data: person
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};