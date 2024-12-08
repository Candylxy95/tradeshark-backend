const express = require("express");
const {
  createListing,
  updateListing,
  viewActiveListing,
  viewExpiredListing,
  viewPurchasedActiveListingsById,
  viewListingById,
} = require("../controllers/listings");
const { isSignedIn, isUser, authSeller } = require("../middleware/auth");
const router = express.Router();

router.post("/", isUser, authSeller, createListing);
router.patch("/:id", updateListing);
router.get("/active", viewActiveListing);
router.get("/past", viewExpiredListing);
router.get("/purchased", viewPurchasedActiveListingsById);
router.get("/:id", viewListingById);

module.exports = router;
