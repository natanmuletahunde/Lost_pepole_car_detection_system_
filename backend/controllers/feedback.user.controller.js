const Feedback = require("../models/Feedback");
const { notifyAdmins } = require("../utils/notification.service");

exports.createFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create({
      user: req.user._id,
      ...req.body,
    });

    // 🔔 NOTIFY ADMINS
    await notifyAdmins({
      title: "📩 New Feedback Submitted",
      message: `${req.user.firstName} ${req.user.lastName} submitted feedback`,
      priority: "high",
      meta: {
        feedbackId: feedback._id.toString(),
      },
    });

    res.status(201).json({
      success: true,
      data: feedback,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: feedback,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};