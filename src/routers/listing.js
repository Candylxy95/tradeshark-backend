const express = require("express");
const { createListing, updateListing } = require("../controllers/listings");
const router = express.Router();

router.post("/listing", createListing);
router.put("/listing/:id", updateListing);

module.exports = router;
