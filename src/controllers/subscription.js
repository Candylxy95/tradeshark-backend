const { pool } = require("../db/db");

const setUpSubscription = async (req, res) => {
  try {
    const subscriptionQuery = `INSERT INTO subscriptions (seller_id, description, type, price) 
      VALUES ($1, $2, $3, $4) RETURNING *`;

    const subscriptionValues = [
      req.decoded.id,
      req.body.description,
      req.body.type,
      req.body.price,
    ];

    const newSubscriptionSetUp = await pool.query(
      subscriptionQuery,
      subscriptionValues
    );

    if (newSubscriptionSetUp.rowCount === 0) {
      return res.status(404).json({ msg: "Failed to set up subscription." });
    }

    res.status(200).json({
      msg: "Subscription successfully set up.",
      subscription: newSubscriptionSetUp.rows[0],
    });
  } catch (err) {
    console.error("Subscription set up error", err);
    res.status(500).json({ msg: "Subscription set up failed." });
  }
};

//get by seller iD
const getSubscriptionById = async (req, res) => {
  try {
    const subscriptionQuery = `SELECT * FROM subscriptions WHERE seller_id = $1`;

    const subscriptionValues = [req.decoded.id];

    const subscription = await pool.query(
      subscriptionQuery,
      subscriptionValues
    );

    if (subscription.rowCount === 0) {
      return res.status(404).json({ msg: "Failed to retrieve subscription." });
    }

    res.status(200).json({
      msg: "Subscription successfully retrieved.",
      subscription: subscription.rows[0],
    });
  } catch (err) {
    console.error("Subscription retrieving error", err);
    res.status(500).json({ msg: "Subscription retrieving failed." });
  }
};

const purchaseSubscription = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    //find subscription details
    const subscriptionQuery = `SELECT * FROM subscriptions WHERE seller_id = $1`;

    if (req.decoded.id === req.params.id) {
      throw new Error("Cannot subscribe to yourself.");
    }
    const subscriptionDetails = await client.query(subscriptionQuery, [
      req.params.id,
    ]);
    if (subscriptionDetails.rows.length === 0) {
      throw new Error("Seller have yet to set up subscription.");
    }
    const subscriptionPrice = subscriptionDetails.rows[0].price;

    //check if buyer alrd bought this
    const existTransactionQuery = `SELECT * FROM subscription_transactions WHERE seller_id = $1 AND buyer_id =$2;`;
    const existTransactionValues = [req.params.id, req.decoded.id];
    const existingTransaction = await client.query(
      existTransactionQuery,
      existTransactionValues
    );

    if (existingTransaction.rows.length > 0) {
      throw new Error("User is already subscribed");
    }

    const checkBuyerBalanceQuery = `SELECT balance FROM users WHERE id = $1 AND role = $2;`;
    const checkBuyerBalanceValues = [req.decoded.id, "ts_buyer"];

    const buyerBalance = await client.query(
      checkBuyerBalanceQuery,
      checkBuyerBalanceValues
    );

    if (Number(buyerBalance.rows[0]?.balance) < subscriptionPrice) {
      throw new Error("Insufficient Balance");
    }

    const transactionQuery = `INSERT INTO subscription_transactions (buyer_id, seller_id, price) 
    VALUES ($1, $2, $3) RETURNING *;`;

    const transactionValues = [
      req.decoded.id,
      req.params.id,
      subscriptionPrice,
    ];

    const newTransaction = await client.query(
      transactionQuery,
      transactionValues
    );

    const updateBuyerBalanceQuery = `UPDATE users SET balance = balance - $1 WHERE id = $2 AND role = $3 RETURNING id, first_name, last_name, balance;`;

    const updateBuyerBalanceValues = [
      subscriptionPrice,
      req.decoded.id,
      "ts_buyer",
    ];

    const updatedBuyerBalance = await client.query(
      updateBuyerBalanceQuery,
      updateBuyerBalanceValues
    );

    const updateSellerBalanceQuery = `UPDATE users SET balance = balance + $1 WHERE id = $2 AND role = $3 RETURNING id, first_name, last_name, balance;`;

    const updateSellerBalanceValues = [
      subscriptionPrice,
      req.params.id,
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
      subscription_details: subscriptionDetails.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Subscription transaction error", err);
    res.status(500).json({ msg: "Subscription failed." });
  } finally {
    client.release();
  }
};

const getSubscriptionByParamsId = async (req, res) => {
  try {
    const subscriptionQuery = `SELECT scp.*, users.first_name, users.last_name, 
    CURRENT_DATE AS purchased_date, CURRENT_DATE + INTERVAL '1 month' AS expiry_date 
    FROM subscriptions scp JOIN users ON seller_id = users.id WHERE seller_id = $1;`;

    const subscriptionValues = [req.params.id];

    const subscription = await pool.query(
      subscriptionQuery,
      subscriptionValues
    );

    if (subscription.rowCount === 0) {
      return res.status(404).json({ msg: "Failed to retrieve subscription." });
    }

    res.status(200).json({
      msg: "Subscription successfully retrieved.",
      subscription: subscription.rows[0],
    });
  } catch (err) {
    console.error("Subscription retrieving error", err);
    res.status(500).json({ msg: "Subscription retrieving failed." });
  }
};

//view all active sub listings - posted before the end of subs expiry
const viewAllSubListingsById = async (req, res) => {
  try {
    const subscriptionQuery = `SELECT lst.*, TO_CHAR(lst.posted_at, 'YYYY-MM-DD') AS posted_date,
    TO_CHAR(lst.posted_at, 'HH24:MI:SS') AS posted_time,
    TO_CHAR(lst.expires_at, 'YYYY-MM-DD') AS expiry_date,
    TO_CHAR(lst.expires_at, 'HH24:MI:SS') AS expiry_time,
    users.first_name AS first_name, users.last_name AS last_name FROM subscription_transactions st
    JOIN listings lst ON st.seller_id = lst.seller_id JOIN users on st.seller_id = users.id WHERE st.buyer_id = $1 
    AND lst.posted_at < st.expires_at AND NOW() < lst.expires_at ORDER BY lst.posted_at;`;

    const subscriptionValues = [req.decoded.id];

    const sublistings = await pool.query(subscriptionQuery, subscriptionValues);

    if (sublistings.rows.length === 0) {
      return res
        .status(404)
        .json({ msg: "Failed to retrieve subscription based listings." });
    }

    res.status(200).json({
      msg: "Subscription based listings successfully retrieved.",
      sublisting: sublistings.rows,
    });
  } catch (err) {
    console.error("Subscription based listings retrieving error", err);
    res
      .status(500)
      .json({ msg: "Subscription based listings retrieving failed." });
  }
};

module.exports = {
  setUpSubscription,
  getSubscriptionById,
  purchaseSubscription,
  getSubscriptionByParamsId,
  viewAllSubListingsById,
};
