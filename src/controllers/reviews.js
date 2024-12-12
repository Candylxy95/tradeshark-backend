const { pool } = require("../db/db");

const createReview = async (req, res) => {
  try {
    const reviewQuery = `INSERT INTO reviews (buyer_id, seller_id, comment, rating, title) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *`;

    const reviewValues = [
      req.decoded.id,
      req.params.id,
      req.body.comment,
      req.body.rating,
      req.body.title,
    ];

    const newReview = await pool.query(reviewQuery, reviewValues);

    if (newReview.rowCount.length === 0) {
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

//buyer view seller view by param id
const viewReviews = async (req, res) => {
  try {
    const findUser = `SELECT * FROM users WHERE id = $1`;
    const existingUser = await pool.query(findUser, [req.decoded.id]);

    if (existingUser.rows.length === 0) {
      throw new Error("User not found or invalid role.");
    }

    const viewReviewsQuery = `SELECT rev.*, users.first_name, users.last_name FROM reviews rev JOIN users ON buyer_id = users.id WHERE seller_id = $1 ORDER BY posted_on DESC`;

    const viewReviewsValues = [req.params.id];

    const viewReviews = await pool.query(viewReviewsQuery, viewReviewsValues);

    if (viewReviews.rowCount === 0) {
      return res.status(404).json({ msg: "Failed to fetch reviews." });
    }

    res.status(200).json({
      msg: "Reviews retrieved successfully.",
      review: viewReviews.rows,
    });
  } catch (err) {
    console.error("Review retrieve error", err);
    res.status(500).json({ msg: "Review retrieve failed." });
  }
};

//seller view own review
const viewReviewsBySellerId = async (req, res) => {
  try {
    const viewReviewsQuery = `SELECT rev.*, users.first_name, users.last_name FROM reviews rev JOIN users ON buyer_id = users.id WHERE seller_id = $1 ORDER BY posted_on DESC`;

    const viewReviewsValues = [req.decoded.id];

    const viewReviews = await pool.query(viewReviewsQuery, viewReviewsValues);

    if (viewReviews.rowCount === 0) {
      return res.status(404).json({ msg: "Failed to fetch reviews." });
    }

    res.status(200).json({
      msg: "Reviews retrieved successfully.",
      review: viewReviews.rows,
    });
  } catch (err) {
    console.error("Review retrieve error", err);
    res.status(500).json({ msg: "Review retrieve failed." });
  }
};

//buyer view their own review
const viewReviewsByUserId = async (req, res) => {
  try {
    const viewReviewsQuery = `SELECT rev.*, users.first_name, users.last_name FROM reviews rev JOIN users ON buyer_id = users.id WHERE buyer_id = $1`;

    const viewReviewsValues = [req.decoded.id];

    const viewReviews = await pool.query(viewReviewsQuery, viewReviewsValues);

    if (viewReviews.rowCount === 0) {
      return res.status(404).json({ msg: "Failed to fetch reviews." });
    }

    res.status(200).json({
      msg: "User's review retrieved successfully.",
      review: viewReviews.rows[0],
    });
  } catch (err) {
    console.error("User's review retrieve error", err);
    res.status(500).json({ msg: "User's review retrieve failed." });
  }
};

const updateReview = async (req, res) => {
  try {
    const updateReviewQuery = `UPDATE reviews
    SET comment = COALESCE($1, comment),
        rating = COALESCE($2, rating),
        posted_on = CURRENT_TIMESTAMP,
        title = $5
    WHERE seller_id = $3 AND buyer_id = $4
    RETURNING *; `;

    const updateReviewValues = [
      req.body.comment,
      req.body.rating,
      req.params.id,
      req.decoded.id,
      req.body.title,
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

const viewUniqueReview = async (req, res) => {
  try {
    const uniqueReviewQuery = `SELECT * FROM reviews WHERE buyer_id = $1 AND seller_id = $2`;

    const uniqueReviewValues = [req.decoded.id, req.params.id];

    const uniqueReview = await pool.query(
      uniqueReviewQuery,
      uniqueReviewValues
    );

    if (uniqueReview.rowCount === 0) {
      return res.status(404).json({ msg: "No review found" });
    }

    res.status(200).json({
      msg: "Review retrieved successfully.",
      review: uniqueReview.rows[0],
    });
  } catch (err) {
    console.error("Review retrieve error", err);
    res.status(500).json({ msg: "Review retrieve failed." });
  }
};

module.exports = {
  createReview,
  viewReviews,
  updateReview,
  deleteReview,
  viewReviewsByUserId,
  viewReviewsBySellerId,
  viewUniqueReview,
};
