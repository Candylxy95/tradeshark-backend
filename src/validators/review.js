const { body } = require("express-validator");

const validateCreateReview = [
  body("comment", "comment is required")
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 400 }),
];

module.exports = { validateCreateReview };
