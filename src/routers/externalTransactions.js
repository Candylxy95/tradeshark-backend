const express = require("express");
const { depositMoney, withdrawMoney } = require("../controllers/transactions");
const { authBuyer } = require("../middleware/auth");
const router = express.Router();

router.post("/deposit", authBuyer, depositMoney);
router.post("/withdraw", withdrawMoney);

module.exports = router;
