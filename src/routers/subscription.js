const express = require("express");
const {
  getSubscriptionById,
  setUpSubscription,
  purchaseSubscription,
  getSubscriptionByParamsId,
  viewAllSubListingsById,
} = require("../controllers/subscription");
const { authBuyer, authSeller, isUser } = require("../middleware/auth");
const { validateSubscriptionSetUp } = require("../validators/subscription");
const { checkErrors } = require("../validators/checkErrors");

const router = express.Router();

router.post(
  "/",
  isUser,
  authSeller,
  validateSubscriptionSetUp,
  checkErrors,
  setUpSubscription
);
router.get("/subs", isUser, authBuyer, viewAllSubListingsById);
router.get("/", isUser, authSeller, getSubscriptionById);
router.get("/:id", isUser, authBuyer, getSubscriptionByParamsId);
router.put("/:id", isUser, authBuyer, purchaseSubscription);

module.exports = router;
