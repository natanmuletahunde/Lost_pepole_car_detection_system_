const MissingPerson = require("../models/MissingPerson");
const Sighting = require("../models/Sighting");
const Detection = require("../models/Detection");

// ==============================
// CREATE Missing Person
// ==============================
exports.createMissingPerson = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const files = req.files;

    if (!files || files.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Minimum 2 images required",
      });
    }

    const images = files.map(file => `/uploads/${file.filename}`);

    const person = new MissingPerson({
      ...req.body, // text fields still here
      images,
      caseId: `CASE-MP-${Date.now()}`,
      status: "Active",
      reportDate: new Date(),
    });

    await person.save();

    res.status(201).json({
      success: true,
      data: person,
    });

  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
// ==============================
// GET ALL
// ==============================
exports.getMissingPersons = async (req, res) => {
  const persons = await MissingPerson.find().sort({ createdAt: -1 });
  res.json({ success: true, data: persons });
};

// ==============================
// GET ONE
// ==============================
exports.getMissingPersonById = async (req, res) => {
  const person = await MissingPerson.findById(req.params.id);

  if (!person) {
    return res.status(404).json({ success: false });
  }

  const sightings = await Sighting.find({
    type: "person",
    description: { $regex: person.firstName, $options: "i" }
  });

  const detections = await Detection.find({
    name: { $regex: person.firstName, $options: "i" }
  });

  res.json({
    success: true,
    data: { person, sightings, detections }
  });
};

// ==============================
// UPDATE
// ==============================
exports.updateMissingPerson = async (req, res) => {
  const person = await MissingPerson.findById(req.params.id);

  if (!person) {
    return res.status(404).json({ success: false });
  }

  Object.assign(person, req.body);
  person.lastUpdated = new Date();

  await person.save();

  res.json({ success: true, data: person });
};