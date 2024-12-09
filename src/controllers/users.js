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
    const viewQuery = `SELECT up.*,
    users.first_name AS first_name,
    users.last_name AS last_name,
    users.email AS email,
    users.phone_number AS phone_number
    FROM user_profiles up 
    JOIN users 
    ON up.user_id = users.id
    WHERE user_id = $1;`;
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

const updateUserProfileById = async (req, res) => {
  try {
    const updateQuery = `UPDATE user_profiles 
    SET bio = COALESCE($1, bio), 
    profile_img = COALESCE($2, profile_img) 
    WHERE user_id = $3`;
    const updateValues = [req.body.bio, req.body.profile_img, req.decoded.id];
    const updatedProfile = await pool.query(updateQuery, updateValues);

    if (updatedProfile.rows[0] === 0) {
      return res.status(404).json({ msg: "User profile not updated" });
    }
    res.status(200).json({
      msg: "User profile successfully updated.",
      profile: updatedProfile.rows[0],
    });
  } catch (err) {
    console.error("Update user profile error", err);
    res.status(500).json({ msg: "Update user profile failed." });
  }
};

const updateUserById = async (req, res) => {
  try {
    const updateQuery = `UPDATE users SET first_name = COALESCE($1, first_name), 
    last_name = COALESCE($2, last_name), 
    phone_number = COALESCE($3, phone_number), 
    email = COALESCE($4, email) 
    WHERE users.id = $5 RETURNING *;`;

    const updateValues = [
      req.body.first_name,
      req.body.last_name,
      req.body.phone_number,
      req.body.email,
      req.decoded.id,
    ];

    const updatedUser = await pool.query(updateQuery, updateValues);

    if (updatedUser.rowCount === 0) {
      return res
        .status(404)
        .json({ msg: "User not found or no changes made." });
    }

    res.status(200).json({
      msg: "User updated successfully.",
      user: updatedUser.rows[0],
    });
  } catch (err) {
    console.error("User update error", err);
    res.status(500).json({ msg: "Update of user failed." });
  }
};

module.exports = {
  viewUserById,
  updateUserBalance,
  viewUserProfileById,
  updateUserProfileById,
  updateUserById,
};
