const express = require("express");
const { viewUserById, updateUserBalance } = require("../controllers/users");
const router = express.Router();

router.get("/", viewUserById);
router.patch("/balance", updateUserBalance);

module.exports = router;
