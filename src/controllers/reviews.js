const { pool } = require("../db/db");

const createReview = async (req, res) => {
  try {
    const findUser = `SELECT * FROM users WHERE id = $1 AND role = $2`;
    const existingUser = await pool.query(findUser, [
      req.decoded.id,
      "ts_buyer",
    ]);

    if (existingUser.rows.length === 0) {
      throw new Error("User not found or invalid role.");
    }

    const reviewQuery = `INSERT INTO reviews (buyer_id, seller_id, comment, rating) 
      VALUES ($1, $2, $3, $4) RETURNING *`;

    const reviewValues = [
      req.decoded.id,
      req.params.id,
      req.body.comment,
      req.body.rating,
    ];

    const newReview = await pool.query(reviewQuery, reviewValues);

    if (newReview.rowCount === 0) {
      return res.status(404).json({ msg: "Failed to create review." });
    }

    res.status(200).json({
      msg: "Created review successfully.",
      review: newReview.rows[0],
    });
  } catch (err) {
    console.error("Review creation error", err);
    res.status(500).json({ msg: "Review creation failed." });
  }
};

// router.delete("/:id", deleteReview);

const viewReviews = async (req, res) => {
  try {
    const findUser = `SELECT * FROM users WHERE id = $1`;
    const existingUser = await pool.query(findUser, [req.decoded.id]);

    if (existingUser.rows.length === 0) {
      throw new Error("User not found or invalid role.");
    }

    const viewReviewsQuery = `SELECT * FROM reviews WHERE seller_id = $1`;

    const viewReviewsValues = [req.params.id];

    const viewReviews = await pool.query(viewReviewsQuery, viewReviewsValues);

    if (viewReviews.rowCount === 0) {
      return res.status(404).json({ msg: "Failed to fetch reviews." });
    }

    res.status(200).json({
      msg: "Reviews retrieved successfully.",
      review: viewReviews.rows[0],
    });
  } catch (err) {
    console.error("Review retrieve error", err);
    res.status(500).json({ msg: "Review retrieve failed." });
  }
};

const updateReview = async (req, res) => {
  try {
    const findUser = `SELECT * FROM users WHERE id = $1`;
    const existingUser = await pool.query(findUser, [req.decoded.id]);

    if (existingUser.rows.length === 0) {
      throw new Error("User not found or invalid role.");
    }

    const updateReviewQuery = `UPDATE reviews SET comment = $1, rating = $2, posted_on = CURRENT_TIMESTAMP, seller_id = $3, buyer_id = $4 RETURNING * `;

    const updateReviewValues = [
      req.body.comment,
      req.body.rating,
      req.params.id,
      req.decoded.id,
    ];

    const updatedReview = await pool.query(
      updateReviewQuery,
      updateReviewValues
    );

    if (updatedReview.rowCount === 0) {
      return res.status(404).json({ msg: "Failed to update reviews." });
    }

    res.status(200).json({
      msg: "Reviews updated successfully.",
      review: updatedReview.rows[0],
    });
  } catch (err) {
    console.error("Review update error", err);
    res.status(500).json({ msg: "Review update failed." });
  }
};

const deleteReview = async (req, res) => {
  try {
    const findUser = `SELECT * FROM users WHERE id = $1`;
    const existingUser = await pool.query(findUser, [req.decoded.id]);

    if (existingUser.rows.length === 0) {
      throw new Error("User not found or invalid role.");
    }

    const deleteReviewQuery = `DELETE FROM reviews WHERE buyer_id = $1 AND seller_id = $2`;

    const deleteReviewValues = [req.decoded.id, req.params.id];

    const deletedReview = await pool.query(
      deleteReviewQuery,
      deleteReviewValues
    );

    if (deletedReview.rowCount > 0) {
      return res.status(404).json({ msg: "Failed to delete review." });
    }

    res.status(200).json({
      msg: "Review deleted successfully.",
      review: deletedReview.rows[0],
    });
  } catch (err) {
    console.error("Review deletion error", err);
    res.status(500).json({ msg: "Review deletion failed." });
  }
};

module.exports = { createReview, viewReviews, updateReview, deleteReview };
