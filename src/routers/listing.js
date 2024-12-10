const express = require("express");
const {
  createListing,
  updateListing,
  viewActiveListing,
  viewExpiredListing,
  viewPurchasedActiveListingsById,
  viewListingById,
  updateRating,
  viewListingHistoryById,
  viewSellerActiveListing,
  viewSellerExpiredListing,
} = require("../controllers/listings");
const {
  isSignedIn,
  isUser,
  authSeller,
  authBuyer,
} = require("../middleware/auth");
const checkBuyerTransaction = require("../middleware/listing");
const router = express.Router();

router.post("/", authSeller, createListing);
router.patch("/:id", updateListing);
router.get("/active", viewActiveListing);
router.get("/past", viewExpiredListing);
router.get("/purchased", viewPurchasedActiveListingsById);
router.get("/:id", viewListingById);
router.post("/:id", authBuyer, checkBuyerTransaction, updateRating);
router.get("/history/:id", viewListingHistoryById);
router.get("/active/seller", viewSellerActiveListing);
router.get("/expired/seller", viewSellerExpiredListing);

module.exports = router;
