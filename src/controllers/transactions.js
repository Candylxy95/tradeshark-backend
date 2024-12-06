const { pool } = require("../db/db");

const depositMoney = async (req, res) => {
  if (req.decoded.role !== "ts_buyer") {
    return res.status(403).json({ msg: "Not authorised" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const findUser = `SELECT * FROM users WHERE id = $1 AND role = $2`;
    const existingUser = await client.query(findUser, [
      req.decoded.id,
      "ts_buyer",
    ]);

    if (existingUser.rows.length === 0) {
      throw new Error("User not found or invalid role.");
    }

    const transactionQuery = `INSERT INTO external_transactions (user_id, user_role, transaction_type, amount) VALUES ($1, $2, $3, $4) RETURNING id, user_role, transaction_type, amount, transaction_date;`;

    const transactionValues = [
      req.decoded.id,
      "ts_buyer",
      "deposit",
      req.body.amount,
    ];

    const newTransaction = await client.query(
      transactionQuery,
      transactionValues
    );

    const updateBalanceQuery = `UPDATE users SET balance = balance + $1 WHERE id = $2 AND role = $3 RETURNING id, first_name, balance;`;

    const updateBalanceValues = [req.body.amount, req.decoded.id, "ts_buyer"];

    const updatedBalance = await client.query(
      updateBalanceQuery,
      updateBalanceValues
    );

    await client.query("COMMIT");
    res.status(200).json({
      msg: "Deposit successful.",
      balance: updatedBalance.rows[0],
      transaction: newTransaction.rows[0],
    });
  } catch (err) {
    console.error("Deposit error", err);
    res.status(500).json({ msg: "Deposit failed." });
  } finally {
    client.release();
  }
};

const withdrawMoney = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const findUser = `SELECT * FROM users WHERE id = $1 AND role = $2`;
    const existingUser = await client.query(findUser, [
      req.decoded.id,
      req.decoded.role,
    ]);

    if (existingUser.rows.length === 0) {
      throw new Error("User not found or invalid role.");
    }

    const transactionQuery = `INSERT INTO external_transactions (user_id, user_role, transaction_type, amount) VALUES ($1, $2, $3, $4) RETURNING id, user_role, transaction_type, amount, transaction_date;`;

    const transactionValues = [
      req.decoded.id,
      req.decoded.role,
      "withdrawal",
      req.body.amount,
    ];

    const newTransaction = await client.query(
      transactionQuery,
      transactionValues
    );

    const updateBalanceQuery = `UPDATE users SET balance = balance - $1 WHERE id = $2 AND role = $3 RETURNING id, first_name, balance;`;

    const updateBalanceValues = [
      req.body.amount,
      req.decoded.id,
      req.decoded.role,
    ];

    const updatedBalance = await client.query(
      updateBalanceQuery,
      updateBalanceValues
    );

    await client.query("COMMIT");
    res.status(200).json({
      msg: "Deposit successful.",
      balance: updatedBalance.rows[0],
      transaction: newTransaction.rows[0],
    });
  } catch (err) {
    console.error("Deposit error", err);
    res.status(500).json({ msg: "Deposit failed." });
  } finally {
    client.release();
  }
};

const purchaseListing = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const findUser = `SELECT * FROM users WHERE id = $1 AND role = $2`;
    const existingUser = await client.query(findUser, [
      req.decoded.id,
      req.decoded.role,
    ]);

    if (existingUser.rows.length === 0) {
      throw new Error("User not found or invalid role.");
    }

    const transactionQuery = `INSERT INTO internal_transactions (buyer_id, seller_id, listing_id, price) VALUES ($1, $2, $3, $4) RETURNING *;`;

    const transactionValues = [
      req.decoded.id,
      req.body.seller_id,
      req.body.listing_id,
      req.body.price,
    ];

    const newTransaction = await client.query(
      transactionQuery,
      transactionValues
    );

    const updateBuyerBalanceQuery = `UPDATE users SET balance = balance - $1 WHERE id = $2 AND role = $3 RETURNING id, first_name, balance;`;

    const updateBuyerBalanceValues = [
      req.body.amount,
      req.decoded.id,
      req.decoded.role,
    ];

    const updatedBuyerBalance = await client.query(
      updateBuyerBalanceQuery,
      updateBuyerBalanceValues
    );

    const updateSellerBalanceQuery = `UPDATE users SET balance = balance + $1 WHERE id = $2 AND role = $3 RETURNING id, first_name, balance;`;

    const updateSellerBalanceValues = [req.body.amount, req.seller_id];

    const updatedSellerBalance = await client.query(
      updateSellerBalanceQuery,
      updateSellerBalanceValues
    );

    await client.query("COMMIT");
    res.status(200).json({
      msg: "Deposit successful.",
      buyer_balance: updatedBuyerBalance.rows[0],
      seller_balance: updatedSellerBalance.rows[0],
      transaction: newTransaction.rows[0],
    });
  } catch (err) {
    console.error("Deposit error", err);
    res.status(500).json({ msg: "Deposit failed." });
  } finally {
    client.release();
  }
};

const createInternalTransaction = async (req, res) => {
  try {
    const inTransactionQuery = `INSERT INTO internal_transactions (buyer_id, seller_id, listing_id, price) 
    VALUES ($1, $2, $3, $4) RETURNING *`;

    const inTransactionValues = [
      req.decoded.id,
      req.body.seller_id,
      req.body.listing_id,
      req.body.price,
    ];

    const newInTransaction = await pool.query(
      inTransactionQuery,
      inTransactionValues
    );

    if (newInTransaction.rowCount === 0) {
      return res.status(404).json({ msg: "Failed to create listing." });
    }

    res.status(200).json({
      msg: "Internal Transaction successfully created.",
      internal_transaction: newInTransaction.rows[0],
    });
  } catch (err) {
    console.error("Internal Transaction creation error", err);
    res.status(500).json({ msg: "Internal Transaction creation failed." });
  }
};

const viewInTransactionsByUserId = async (req, res) => {
  try {
    const findUser = `SELECT * FROM users WHERE id = $1`;
    const existingUser = await pool.query(findUser, [req.decoded.id]);

    if (existingUser.rows.length === 0) {
      throw new Error("User not found or invalid role.");
    }

    const viewQuery = `SELECT listings.ticker AS ticker,
    users.first_name AS seller_first_name,
    users.last_name AS seller_last_name,
    it.price,
    TO_CHAR(it.purchased_on, 'YYYY-MM-DD') AS purchased_date,
    TO_CHAR(it.purchased_on, 'HH24:MI:SS') AS purchased_time
    FROM internal_transactions it
    JOIN listings 
    ON listing_id = listings.id
    JOIN users
    ON it.seller_id = users.id
    WHERE buyer_id = $1 ORDER BY purchased_on DESC`;

    const viewValues = [req.decoded.id];

    const inTransactionList = await pool.query(viewQuery, viewValues);

    if (inTransactionList.rowCount === 0) {
      return res
        .status(404)
        .json({ msg: "Failed to retrieve internal transactions." });
    }

    res.status(200).json({
      msg: "Active listings successfully retrieved.",
      inTransaction: inTransactionList.rows,
    });
  } catch (err) {
    console.error("View internal transaction error", err);
    res.status(500).json({ msg: "View internal transaction failed." });
  }
};

module.exports = {
  depositMoney,
  withdrawMoney,
  createInternalTransaction,
  viewInTransactionsByUserId,
  purchaseListing,
};
