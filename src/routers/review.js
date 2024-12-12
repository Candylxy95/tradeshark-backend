const express = require("express");
const {
  createReview,
  viewReviews,
  updateReview,
  deleteReview,
  viewReviewsByUserId,
  viewReviewsBySellerId,
  viewUniqueReview,
} = require("../controllers/reviews");
const { authBuyer, authSeller, isUser } = require("../middleware/auth");
const { validateCreateReview } = require("../validators/review");
const { checkErrors } = require("../validators/checkErrors");
const router = express.Router();

router.get("/biz", isUser, authSeller, viewReviewsBySellerId);
router.post(
  "/:id",
  isUser,
  authBuyer,
  validateCreateReview,
  checkErrors,
  createReview
);
router.get("/:id", isUser, viewReviews);
router.put(
  "/:id",
  isUser,
  authBuyer,
  validateCreateReview,
  checkErrors,
  updateReview
);
router.delete("/:id", isUser, authBuyer, deleteReview);
router.get("/", isUser, viewReviewsByUserId);
router.get("/review/:id", isUser, viewUniqueReview);

module.exports = router;
