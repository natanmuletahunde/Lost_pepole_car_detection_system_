const Feedback = require("../models/Feedback");

exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: feedback,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.respondToFeedback = async (req, res) => {
  try {
    const { text, status } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    feedback.status = status || feedback.status;

    feedback.response = {
      text,
      respondedBy: req.user._id,
      respondedAt: new Date(),
    };

    await feedback.save();

    res.json({
      success: true,
      message: "Response sent",
      data: feedback,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Feedback deleted",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};