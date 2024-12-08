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

module.exports = { setUpSubscription, getSubscriptionById };
