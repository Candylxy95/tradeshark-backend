const express = require("express");
const { authBuyer, authSeller, isUser } = require("../middleware/auth");
const {
  createInternalTransaction,
  viewInTransactionsByUserId,
  purchaseListing,
  viewInTransactionsBySellerId,
  viewSubTransactionBySellerId,
  viewSubTransactionByUserId,
  viewOneSubTransaction,
  viewSubCountByParamsId,
  viewSubCountById,
} = require("../controllers/transactions");
const router = express.Router();

router.post("/create", authBuyer, createInternalTransaction); //merged with purchase listing - should be can delete
router.get("/view", authBuyer, viewInTransactionsByUserId); //view purchased listing
router.get("/sales", authSeller, viewInTransactionsBySellerId); // view sold listing
router.post("/purchase", authBuyer, purchaseListing);
router.get("/subs", authSeller, viewSubTransactionBySellerId);
router.get("/subs/user", authBuyer, viewSubTransactionByUserId);
router.get("/subs/:id", viewOneSubTransaction);
router.get("/count/:id", viewSubCountByParamsId);
router.get("/count", viewSubCountById);

module.exports = router;
