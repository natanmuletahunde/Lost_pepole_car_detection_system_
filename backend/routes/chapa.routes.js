const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const {
  initializePayment,
  verifyPayment,
  handleCallback,
} = require("../controllers/chapa.controller");

router.post("/initialize", protect, initializePayment);
router.get("/verify/:tx_ref", protect, verifyPayment);
router.get("/callback", handleCallback);

module.exports = router;
