const { pool } = require("../db/db");

const viewUserById = async (req, res) => {
  try {
    const findUser = `SELECT * FROM users WHERE id = $1`;
    const existingUser = await pool.query(findUser, [req.decoded.id]);

    if (existingUser.rows.length === 0) {
      throw new Error("User not found or invalid role.");
    }
    res.status(200).json({
      msg: "User info successfully retrieved.",
      user: existingUser.rows[0],
    });
  } catch (err) {
    console.error("View user info error", err);
    res.status(500).json({ msg: "View user info failed." });
  }
};

const updateUserBalance = async (req, res) => {
  try {
    const findUser = `SELECT * FROM users WHERE id = $1 AND role = $2`;
    const existingUser = await pool.query(findUser, [
      req.decoded.id,
      "ts_seller",
    ]);

    if (existingUser.rows.length === 0) {
      throw new Error("User not found or invalid role.");
    }

    const updateBalanceQuery = `UPDATE users SET balance = balance + $1 WHERE users.id = $2 RETURNING *;`;

    const updateBalanceValues = [req.body.balance, req.decoded.id];

    const updatedBalance = await pool.query(
      updateBalanceQuery,
      updateBalanceValues
    );

    if (updatedBalance.rowCount === 0) {
      return res
        .status(404)
        .json({ msg: "Balance not found or no changes made." });
    }

    res.status(200).json({
      msg: "Balance updated successfully.",
      listing: updatedBalance.rows[0],
    });
  } catch (err) {
    console.error("Bal update error", err);
    res.status(500).json({ msg: "Update of Bal failed." });
  }
};

const viewUserProfileById = async (req, res) => {
  try {
    const viewQuery = `SELECT * FROM user_profiles WHERE user_id = $1`;
    const userProfile = await pool.query(viewQuery, [req.decoded.id]);

    if (userProfile.rows[0] === 0) {
      return res.status(404).json({ msg: "User profile not found" });
    }
    res.status(200).json({
      msg: "User info successfully retrieved.",
      profile: userProfile.rows[0],
    });
  } catch (err) {
    console.error("View user profile error", err);
    res.status(500).json({ msg: "View user profile failed." });
  }
};

module.exports = { viewUserById, updateUserBalance, viewUserProfileById };
