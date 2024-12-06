const { pool } = require("../db/db");

const createListing = async (req, res) => {
  try {
    const findUser = `SELECT * FROM users WHERE id = $1 AND role = $2`;
    const existingUser = await pool.query(findUser, [
      req.decoded.id,
      "ts_seller",
    ]);

    if (existingUser.rows.length === 0) {
      throw new Error("User not found or invalid role.");
    }

    const listingQuery = `INSERT INTO listings (seller_id, ticker, asset_class, position, entry_price, 
        take_profit, stop_loss, price, notes, duration, img_src) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;

    const listingValues = [
      req.decoded.id,
      req.body.ticker,
      req.body.asset_class,
      req.body.position,
      req.body.entry_price,
      req.body.take_profit,
      req.body.stop_loss,
      req.body.price,
      req.body.notes,
      req.body.duration,
      req.body.img_src,
    ];

    const newListing = await pool.query(listingQuery, listingValues);

    if (newListing.rowCount === 0) {
      return res.status(404).json({ msg: "Failed to create listing." });
    }

    res.status(200).json({
      msg: "Listed successfully.",
      listing: newListing.rows[0],
    });
  } catch (err) {
    console.error("Listing error", err);
    res.status(500).json({ msg: "Listing failed." });
  }
};

const viewActiveListing = async (req, res) => {
  try {
    const findUser = `SELECT * FROM users WHERE id = $1`;
    const existingUser = await pool.query(findUser, [req.decoded.id]);

    if (existingUser.rows.length === 0) {
      throw new Error("User not found or invalid role.");
    }

    const viewQuery = `SELECT lst.*,
    TO_CHAR(lst.posted_at, 'YYYY-MM-DD') AS posted_date,
TO_CHAR(lst.posted_at, 'HH24:MI:SS') AS posted_time,
TO_CHAR(lst.expires_at, 'YYYY-MM-DD') AS expiry_date,
TO_CHAR(lst.expires_at, 'HH24:MI:SS') AS expiry_time,
    users.first_name,
    users.last_name
    FROM listings lst
    JOIN users 
    ON lst.seller_id = users.id 
    WHERE NOW() < expires_at ORDER BY posted_at DESC;`;

    const activeListing = await pool.query(viewQuery);

    if (activeListing.rowCount === 0) {
      return res
        .status(404)
        .json({ msg: "Failed to retrieve active listings." });
    }

    res.status(200).json({
      msg: "Active listings successfully retrieved.",
      listing: activeListing.rows,
    });
  } catch (err) {
    console.error("View listing error", err);
    res.status(500).json({ msg: "View listing failed." });
  }
};

const viewExpiredListing = async (req, res) => {
  try {
    const findUser = `SELECT * FROM users WHERE id = $1`;
    const existingUser = await pool.query(findUser, [req.decoded.id]);

    if (existingUser.rows.length === 0) {
      throw new Error("User not found or invalid role.");
    }

    const viewQuery = `SELECT lst.*,
    TO_CHAR(lst.posted_at, 'YYYY-MM-DD') AS posted_date,
TO_CHAR(lst.posted_at, 'HH24:MI:SS') AS posted_time,
TO_CHAR(lst.expires_at, 'YYYY-MM-DD') AS expiry_date,
TO_CHAR(lst.expires_at, 'HH24:MI:SS') AS expiry_time,
    users.first_name,
    users.last_name
    FROM listings lst
    JOIN users 
    ON lst.seller_id = users.id 
    WHERE NOW() > expires_at;`;

    const activeListing = await pool.query(viewQuery);

    if (activeListing.rowCount === 0) {
      return res
        .status(404)
        .json({ msg: "Failed to retrieve expired listings." });
    }

    res.status(200).json({
      msg: "Past listings successfully retrieved.",
      listing: activeListing.rows,
    });
  } catch (err) {
    console.error("View listing error", err);
    res.status(500).json({ msg: "View listing failed." });
  }
};

const updateListing = async (req, res) => {
  try {
    const findUser = `SELECT * FROM users WHERE id = $1 AND role = $2`;
    const existingUser = await pool.query(findUser, [
      req.decoded.id,
      "ts_seller",
    ]);

    if (existingUser.rows.length === 0) {
      throw new Error("User not found or invalid role.");
    }

    const updateListingQuery = `UPDATE listings SET ticker = $1, asset_class = $2, position = $3, 
        entry_price = $4, take_profit = $5, stop_loss = $6, 
        price = $7, notes = $8, duration = $9, img_src=$10 WHERE id = $11 RETURNING *`;

    const updateListingValues = [
      req.body.ticker,
      req.body.asset_class,
      req.body.position,
      req.body.entry_price,
      req.body.take_profit,
      req.body.stop_loss,
      req.body.price,
      req.body.notes,
      req.body.duration,
      req.body.img_src,
      req.params.id,
    ];

    const updatedListing = await pool.query(
      updateListingQuery,
      updateListingValues
    );

    if (updatedListing.rowCount === 0) {
      return res
        .status(404)
        .json({ msg: "Listing not found or no changes made." });
    }

    res.status(200).json({
      msg: "Listing updated successfully.",
      listing: updatedListing.rows[0],
    });
  } catch (err) {
    console.error("Listing update error", err);
    res.status(500).json({ msg: "Update of listing failed." });
  }
};

module.exports = {
  createListing,
  viewActiveListing,
  viewExpiredListing,
  updateListing,
};
