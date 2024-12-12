const express = require("express");
const {
  depositMoney,
  withdrawMoney,
  getStripeKey,
  sendPaymentRequest,
} = require("../controllers/transactions");
const { authBuyer, authSeller, isUser } = require("../middleware/auth");
const router = express.Router();

router.post("/deposit", authBuyer, isUser, depositMoney);
router.post("/withdraw", isUser, withdrawMoney);
router.get("/stripe", authBuyer, isUser, getStripeKey);
router.post("/payment", authBuyer, isUser, sendPaymentRequest);

module.exports = router;
