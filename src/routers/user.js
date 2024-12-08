const express = require("express");
const {
  viewUserById,
  updateUserBalance,
  viewUserProfileById,
} = require("../controllers/users");
const router = express.Router();

router.get("/", viewUserById);
router.patch("/balance", updateUserBalance);
router.get("/profile", viewUserProfileById);

module.exports = router;
