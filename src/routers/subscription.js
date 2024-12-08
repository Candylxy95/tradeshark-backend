const express = require("express");
const {
  getSubscriptionById,
  setUpSubscription,
} = require("../controllers/subscription");
const { authBuyer, authSeller } = require("../middleware/auth");

const router = express.Router();

router.post("/", authSeller, setUpSubscription);
router.get("/", getSubscriptionById);

module.exports = router;
