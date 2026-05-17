const Notification = require("../models/Notification");
const User = require("../models/User");

// GET ADMIN NOTIFICATIONS
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// MARK AS READ
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE NOTIFICATION
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CLEAR ALL NOTIFICATIONS
exports.clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    
    res.json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// SEND NOTIFICATION TO ALL ADMINS (called when user confirms found)
exports.sendAdminNotification = async (req, res) => {
  try {
    const { title, message, type = 'success' } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'title and message are required' });
    }

    // Find all admin and moderator users
    const admins = await User.find({ role: { $in: ['admin', 'moderator'] } }).select('_id');
    if (admins.length === 0) {
      return res.json({ success: true, message: 'No admins to notify' });
    }

    const notifDocs = admins.map(a => ({
      recipient: a._id,
      title,
      message,
      type,
      priority: 'high',
    }));

    await Notification.insertMany(notifDocs);

    res.json({ success: true, message: `Notified ${admins.length} admin(s)` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};