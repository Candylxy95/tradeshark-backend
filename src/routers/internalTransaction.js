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
  updateInternalTransactionsRated,
} = require("../controllers/transactions");
const router = express.Router();

router.get("/view", isUser, authBuyer, viewInTransactionsByUserId); //view purchased listing
router.get("/sales", isUser, authSeller, viewInTransactionsBySellerId); // view sold listing
router.post("/purchase", isUser, authBuyer, purchaseListing);
router.get("/subs", isUser, authSeller, viewSubTransactionBySellerId);
router.get("/rated/:id", updateInternalTransactionsRated);
router.get("/subs/user", isUser, authBuyer, viewSubTransactionByUserId);
router.get("/subs/:id", isUser, authBuyer, viewOneSubTransaction);
router.get("/count/:id", isUser, authBuyer, viewSubCountByParamsId);
router.get("/count", isUser, authSeller, viewSubCountById);

module.exports = router;
