const Notification = require("../models/Notification");
const User = require("../models/User");

exports.notifyAdmins = async ({ title, message, meta = {}, priority = "normal" }) => {
  try {
    const admins = await User.find({ role: "admin", isActive: true });

    if (!admins.length) return;

    const notifications = admins.map((admin) => ({
      recipient: admin._id,
      title,
      message,
      type: "feedback",
      priority,
      meta,
    }));

    await Notification.insertMany(notifications);

    console.log(`🔔 Sent ${notifications.length} notifications to admins`);
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};