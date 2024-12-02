const express = require("express");
const {
  createListing,
  updateListing,
  viewActiveListing,
  viewExpiredListing,
} = require("../controllers/listings");
const router = express.Router();

router.post("/", createListing);
router.put("/:id", updateListing);
router.get("/active", viewActiveListing);
router.get("/past", viewExpiredListing);

module.exports = router;
