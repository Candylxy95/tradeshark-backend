const { pool } = require("../db/db");

const checkBuyerTransaction = async (req, res, next) => {
  try {
    const findTransactionQuery = `
      SELECT listing_id 
      FROM internal_transactions 
      WHERE buyer_id = $1
    `;
    const transaction = await pool.query(findTransactionQuery, [
      req.decoded.id,
    ]);

    if (transaction.rowCount === 0) {
      return res.status(404).json({ msg: "Not authorized" });
    }

    next();
  } catch (error) {
    console.error("Buyer has no transaction, not authorised:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = checkBuyerTransaction;
