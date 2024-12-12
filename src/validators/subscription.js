const { body } = require("express-validator");

const validateSubscriptionSetUp = [
  body("description", "Description is required")
    .trim()
    .notEmpty()
    .isLength({ min: 1 }),
  body("price", "price has to be a number").trim().notEmpty().isNumeric(),
];

module.exports = { validateSubscriptionSetUp };
