const router = require("express").Router();
const controller = require("../controllers/notification.controller");

// get all notifications for the logged in user
router.get("/my-notifications", controller.getNotifications);

// mark as read
router.patch("/:id/read", controller.markAsRead);

// delete single notification
router.delete("/:id", controller.deleteNotification);

// clear all notifications
router.delete("/", controller.clearNotifications);

// send notification to all admins (triggered when user reports found)
router.post("/send-admin", controller.sendAdminNotification);

module.exports = router;

