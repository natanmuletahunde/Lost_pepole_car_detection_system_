const router = require("express").Router();
const controller = require("../controllers/feedback.user.controller");

// create feedback
router.post("/", controller.createFeedback);

// get my feedback
router.get("/mine", controller.getMyFeedback);

module.exports = router;