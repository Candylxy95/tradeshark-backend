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

module.exports = { depositMoney, withdrawMoney };
