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
    await client.query("ROLLBACK");
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
    await client.query("ROLLBACK");
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
    const findUser = `SELECT * FROM users WHERE id = $1 AND role = 'ts_buyer'`;
    const existingUser = await client.query(findUser, [req.decoded.id]);

    if (existingUser.rows.length === 0) {
      throw new Error("User not found or invalid role.");
    }

    if (existingUser.rows[0].balance < req.body.price) {
      throw new Error("Insufficient balance to complete the purchase.");
    }

    if (req.decoded.id === req.body.seller_id) {
      throw new Error("Cannot purchase your own listing.");
    }

    //add condition that if buyers already have this existing listing - disallow purchase.

    const listingDetailsQuery = `SELECT id, price, expires_at FROM listings WHERE id = $1`;
    const listingDetails = await client.query(listingDetailsQuery, [
      req.body.listing_id,
    ]);
    if (listingDetails.rows.length === 0) {
      throw new Error("Listing not found.");
    }

    const currentTime = new Date();
    const expiryTime = new Date(listingDetails.rows[0].expires_at);
    if (currentTime > expiryTime) {
      throw new Error("Unable to purchase expired listing.");
    }

    const listingPrice = listingDetails.rows[0].price;

    const transactionQuery = `INSERT INTO internal_transactions (buyer_id, seller_id, listing_id, price) VALUES ($1, $2, $3, $4) RETURNING *;`;

    const transactionValues = [
      req.decoded.id,
      req.body.seller_id,
      req.body.listing_id,
      listingPrice,
    ];

    const newTransaction = await client.query(
      transactionQuery,
      transactionValues
    );

    const updateBuyerBalanceQuery = `UPDATE users SET balance = balance - $1 WHERE id = $2 AND role = $3 RETURNING id, first_name, last_name, balance;`;

    const updateBuyerBalanceValues = [listingPrice, req.decoded.id, "ts_buyer"];

    const updatedBuyerBalance = await client.query(
      updateBuyerBalanceQuery,
      updateBuyerBalanceValues
    );

    const updateSellerBalanceQuery = `UPDATE users SET balance = balance + $1 WHERE id = $2 AND role = $3 RETURNING id, first_name, last_name, balance;`;

    const updateSellerBalanceValues = [
      listingPrice,
      req.body.seller_id,
      "ts_seller",
    ];

    const updatedSellerBalance = await client.query(
      updateSellerBalanceQuery,
      updateSellerBalanceValues
    );

    await client.query("COMMIT");
    res.status(200).json({
      msg: "Listing purchase successful.",
      buyer_balance: updatedBuyerBalance.rows[0],
      seller_balance: updatedSellerBalance.rows[0],
      transaction: newTransaction.rows[0],
      listing_details: listingDetails.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Purchase transaction error", err);
    res.status(500).json({ msg: "Purchase transaction failed." });
  } finally {
    client.release();
  }
};

//merged with purchase listing - should be can delete
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
      return res
        .status(404)
        .json({ msg: "Failed to create internal transaction." });
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

//Buyer view purchases
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

//Seller view sales
const viewInTransactionsBySellerId = async (req, res) => {
  try {
    const findUser = `SELECT * FROM users WHERE id = $1`;
    const existingUser = await pool.query(findUser, [req.decoded.id]);

    if (existingUser.rows.length === 0) {
      throw new Error("User not found or invalid role.");
    }

    const viewQuery = `SELECT listings.ticker AS ticker,
    users.first_name AS buyer_first_name,
    users.last_name AS buyer_last_name,
    it.price,
    TO_CHAR(it.purchased_on, 'YYYY-MM-DD') AS purchased_date,
    TO_CHAR(it.purchased_on, 'HH24:MI:SS') AS purchased_time
    FROM internal_transactions it
    JOIN listings 
    ON listing_id = listings.id
    JOIN users
    ON it.buyer_id = users.id
    WHERE it.seller_id = $1 ORDER BY purchased_on DESC`;

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

const viewSubTransactionBySellerId = async (req, res) => {
  try {
    const viewQuery = `SELECT
    users.first_name AS buyer_first_name,
    users.last_name AS buyer_last_name,
    st.price,
    st.seller_id
    TO_CHAR(st.purchased_on, 'YYYY-MM-DD') AS purchased_date,
    TO_CHAR(st.purchased_on, 'HH24:MI:SS') AS purchased_time
    FROM subscription_transactions st
    JOIN users
    ON buyer_id = users.id
    WHERE st.seller_id = $1 ORDER BY purchased_on DESC`;

    const viewValues = [req.decoded.id];

    const subTransactionList = await pool.query(viewQuery, viewValues);

    if (subTransactionList.rowCount === 0) {
      return res
        .status(404)
        .json({ msg: "Failed to retrieve sub transactions." });
    }

    res.status(200).json({
      msg: "Sub transactions successfully retrieved.",
      subTransaction: subTransactionList.rows,
    });
  } catch (err) {
    console.error("View sub transaction error", err);
    res.status(500).json({ msg: "View sub transaction failed." });
  }
};

const viewSubTransactionByUserId = async (req, res) => {
  try {
    const viewQuery = `SELECT * FROM subcription_transactions
    WHERE buyer_id = $1 ORDER BY purchased_on DESC`;

    const viewValues = [req.decoded.id];

    const subTransactionList = await pool.query(viewQuery, viewValues);

    if (subTransactionList.rowCount === 0) {
      return res
        .status(404)
        .json({ msg: "Failed to retrieve sub transactions." });
    }

    res.status(200).json({
      msg: "Sub transactions successfully retrieved.",
      subTransaction: subTransactionList.rows,
    });
  } catch (err) {
    console.error("View sub transaction error", err);
    res.status(500).json({ msg: "View sub transaction failed." });
  }
};

module.exports = {
  depositMoney,
  withdrawMoney,
  createInternalTransaction,
  viewInTransactionsByUserId,
  viewInTransactionsBySellerId,
  purchaseListing,
  viewSubTransactionBySellerId,
  viewSubTransactionByUserId,
};
