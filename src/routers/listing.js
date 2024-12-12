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
const { validateCreateListing } = require("../validators/listing");
const { checkErrors } = require("../validators/checkErrors");
const router = express.Router();

router.post(
  "/",
  isUser,
  authSeller,
  // validateCreateListing,
  // checkErrors,
  createListing
);
router.patch(
  "/:id",
  isUser,
  authSeller,
  // validateCreateListing,
  // checkErrors,
  updateListing
);

router.get("/active", isUser, authBuyer, viewActiveListing);
router.get("/past", isUser, authSeller, viewExpiredListing);
router.get("/purchased", isUser, authBuyer, viewPurchasedActiveListingsById);
router.get("/:id", isUser, viewListingById);
router.post("/:id", authBuyer, checkBuyerTransaction, updateRating);
router.get("/history/:id", isUser, viewListingHistoryById);
router.get("/active/seller", isUser, authSeller, viewSellerActiveListing);
router.get("/expired/seller", isUser, authSeller, viewSellerExpiredListing);

module.exports = router;
