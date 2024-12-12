const express = require("express");
const router = express.Router();
const { registration, login } = require("../controllers/auth");
const {
  validateRegistrationData,
  validateLoginData,
} = require("../validators/auth");
const { checkErrors } = require("../validators/checkErrors");

router.post("/register", validateRegistrationData, checkErrors, registration);
router.post("/login", login);

module.exports = router;
