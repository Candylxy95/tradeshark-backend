const express = require("express");
const { authBuyer } = require("../middleware/auth");
const {
  createInternalTransaction,
  viewInTransactionsByUserId,
  purchaseListing,
} = require("../controllers/transactions");
const router = express.Router();

router.post("/create", authBuyer, createInternalTransaction);
router.get("/view", authBuyer, viewInTransactionsByUserId);
router.post("/purchase", authBuyer, purchaseListing);

module.exports = router;
