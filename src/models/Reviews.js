const { pool } = require("../db/db");

const createReviewsTable = async () => {
  const query = `
      CREATE TABLE IF NOT EXISTS reviews (
        buyer_id UUID NOT NULL,
        seller_id UUID NOT NULL,
        comment TEXT NOT NULL,
        rating NUMERIC(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
        posted_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        FOREIGN KEY (buyer_id) references users(id) ON DELETE CASCADE,
        FOREIGN KEY (seller_id) references users(id),
        PRIMARY KEY (buyer_id, seller_id)
    );
    `;

  try {
    await pool.query(query);
    console.log("Review table created successfully.");
  } catch (err) {
    console.error("Error creating Review table: ", err);
  }
};

module.exports = { createReviewsTable };
