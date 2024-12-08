const { pool } = require("../db/db");

const createSubscriptionsTable = async () => {
  const query = `
      CREATE TABLE IF NOT EXISTS subscriptions (
        seller_id UUID NOT NULL PRIMARY KEY,
        description TEXT NOT NULL,
        type TEXT CHECK (type IN ('Stocks', 'Forex', 'Both')),
        price DECIMAL(10,2) DEFAULT 0 NOT NULL,
        created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        FOREIGN KEY (seller_id) references users(id)
\    );
    `;

  try {
    await pool.query(query);
    console.log("Subscription transaction table created successfully.");
  } catch (err) {
    console.error("Error creating Subscription transaction table: ", err);
  }
};

module.exports = { createSubscriptionsTable };
