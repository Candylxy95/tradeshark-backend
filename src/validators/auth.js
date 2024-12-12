const { body, oneOf } = require("express-validator");

const validateRegistrationData = [
  body("first_name", "first name is required")
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 20 }),
  body("last_name", "last name is required")
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 20 }),
  body("phone_number", "Valid international phone number is required")
    .trim()
    .notEmpty()
    .matches(/^\+?[1-9][0-9]{0,14}$/),
  body("email", "valid email is required").trim().notEmpty().isEmail(),
  body(
    "password",
    "password is required with min length of 10,  contain at least one uppercase letter, and one special character."
  )
    .trim()
    .notEmpty()
    .isLength({ min: 10 })
    .matches(/(?=.*[A-Z])/)
    .matches(/(?=.*[!@#$%^&*()_\-+=~`[\]{}|:;"'<>,.?/])/),
];

const validateLoginData = [
  oneOf(
    body("phone_number", "valid international phone number is required")
      .optional()
      .trim()
      .notEmpty()
      .matches(/^\+?[1-9][0-9]{0,14}$/),
    body("email", "valid email is required")
      .optional()
      .trim()
      .notEmpty()
      .isEmail()
  ),
  body("password", "password is required"),
];

const validateUpdateProfile = [
  body("bio", "bio is required")
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 400 }),
  body("profile_img", "profile img is required").trim().notEmpty,
];

module.exports = {
  validateRegistrationData,
  validateLoginData,
  validateUpdateProfile,
};
