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
      
  )
}`;
};

module.exports = { createExternalTransactionTable };
