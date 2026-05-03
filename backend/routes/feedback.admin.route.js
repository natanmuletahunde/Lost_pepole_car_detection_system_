const router = require("express").Router();
const controller = require("../controllers/feedback.admin.controller");

// get all feedback
router.get("/", controller.getAllFeedback);

// update / respond
router.patch("/:id", controller.respondToFeedback);

// delete (optional)
router.delete("/:id", controller.deleteFeedback);

module.exports = router;