const express = require("express");
const {
  createReview,
  viewReviews,
  updateReview,
  deleteReview,
  viewReviewsByUserId,
} = require("../controllers/reviews");
const { authBuyer } = require("../middleware/auth");
const router = express.Router();

router.post("/:id", createReview);
router.get("/:id", viewReviews);
router.put("/:id", authBuyer, updateReview);
router.delete("/:id", deleteReview);
router.get("/", viewReviewsByUserId);

module.exports = router;
