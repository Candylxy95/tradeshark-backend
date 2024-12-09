const express = require("express");
const {
  viewUserById,
  updateUserBalance,
  viewUserProfileById,
  updateUserById,
  updateUserProfileById,
} = require("../controllers/users");
const router = express.Router();

router.get("/", viewUserById);
router.patch("/balance", updateUserBalance);
router.get("/profile", viewUserProfileById);
router.patch("/profile", updateUserProfileById);
router.patch("/user", updateUserById);

module.exports = router;
