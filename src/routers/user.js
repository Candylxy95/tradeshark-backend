const express = require("express");
const {
  viewUserById,
  updateUserBalance,
  viewUserProfileById,
  updateUserById,
  updateUserProfileById,
  viewUserByParamsId,
} = require("../controllers/users");
const { isUser } = require("../middleware/auth");
const {
  validateUpdateProfile,
  validateLoginData,
  validateRegistrationData,
} = require("../validators/auth");
const router = express.Router();

router.get("/", isUser, viewUserById);
router.get("/profile", isUser, viewUserProfileById);
router.patch("/profile", isUser, updateUserProfileById);
router.patch("/user", isUser, updateUserById);
router.get("/:id", isUser, viewUserByParamsId);

module.exports = router;
