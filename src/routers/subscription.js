const express = require("express");
const {
  getSubscriptionById,
  setUpSubscription,
  purchaseSubscription,
  getSubscriptionByParamsId,
  viewAllSubListingsById,
} = require("../controllers/subscription");
const { authBuyer, authSeller } = require("../middleware/auth");

const router = express.Router();

router.post("/", authSeller, setUpSubscription);
router.get("/", getSubscriptionById);
router.get("/:id", getSubscriptionByParamsId);
router.put("/:id", purchaseSubscription);
router.get("/sublistings", authBuyer, viewAllSubListingsById);

module.exports = router;
