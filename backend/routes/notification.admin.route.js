const router = require("express").Router();
const controller = require("../controllers/notification.controller");

// get all notifications
router.get("/", controller.getNotifications);

// mark as read
router.patch("/:id/read", controller.markAsRead);

module.exports = router;