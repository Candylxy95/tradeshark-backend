const { pool } = require("../db/db");

const createExternalTransactionTable = async () => {
  const query = `
      CREATE TABLE IF NOT EXISTS external_transactions (
         id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
         user_id UUID NOT NULL,
         user_role VARCHAR(20) NOT NULL,
         transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal')),
         amount DECIMAL(10,2) NOT NULL,
         transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (user_id) references users(id) ON DELETE CASCADE
      );
      `;

  try {
    await pool.query(query);
    console.log("External Transaction table created successfully.");
  } catch (err) {
    console.error("Error creating External Transaction table: ", err);
  }
};

const createInternalTransactionTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS internal_transactions (
      buyer_id UUID NOT NULL,
      seller_id UUID NOT NULL,
      listing_id UUID NOT NULL,
      price DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
      purchased_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (buyer_id) REFERENCES users(id),
      FOREIGN KEY (seller_id, listing_id) REFERENCES listings(seller_id, id),
      PRIMARY KEY (seller_id, listing_id)
  );
  `;

  try {
    await pool.query(query);
    console.log("Internal Transaction table created successfully.");
  } catch (err) {
    console.error("Error creating Internal Transaction table: ", err);
  }
};

const createSubscriptionTransactionTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS subscription_transactions (
      buyer_id UUID NOT NULL,
      seller_id UUID NOT NULL,
      price DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
      purchased_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (buyer_id) references users(id),
      FOREIGN KEY (seller_id) REFERENCES subscriptions(seller_id),
      PRIMARY KEY (seller_id, buyer_id)
  );
  `;

  try {
    await pool.query(query);
    console.log("Internal Transaction table created successfully.");
  } catch (err) {
    console.error("Error creating Internal Transaction table: ", err);
  }
};

module.exports = {
  createExternalTransactionTable,
  createInternalTransactionTable,
  createSubscriptionTransactionTable,
};
