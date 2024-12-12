const { body } = require("express-validator");

const validateCreateListing = [
  body("ticker", "ticker is required").trim().notEmpty(),
  body("entry_price", "entry price input is required")
    .trim()
    .notEmpty()
    .isNumeric(),
  body("take_profit", "take profit input is required")
    .trim()
    .notEmpty()
    .isNumeric(),
  body("stop_loss", "stop loss input is required")
    .trim()
    .notEmpty()
    .isNumeric(),
  body("price", "price has to be a number").trim().notEmpty().isNumeric(),
  body("duration", "duration is required").trim().notEmpty().isNumeric(),
];

module.exports = { validateCreateListing };
