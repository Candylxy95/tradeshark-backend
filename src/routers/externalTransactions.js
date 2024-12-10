const express = require("express");
const {
  depositMoney,
  withdrawMoney,
  getStripeKey,
  sendPaymentRequest,
} = require("../controllers/transactions");
const { authBuyer } = require("../middleware/auth");
const router = express.Router();

router.post("/deposit", authBuyer, depositMoney);
router.post("/withdraw", withdrawMoney);
router.get("/stripe", getStripeKey);
router.post("/payment", sendPaymentRequest);

module.exports = router;
