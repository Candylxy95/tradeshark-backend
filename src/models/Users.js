const { pool } = require("../db/db");

const createUserTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
        id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        first_name VARCHAR(30) NOT NULL,
        last_name VARCHAR(30) NOT NULL,
        email VARCHAR(50) UNIQUE NOT NULL,
        phone_number VARCHAR(15) NOT NULL CHECK (phone_number ~ '^\\+?[1-9][0-9]{0,14}$'),
        password VARCHAR(255) UNIQUE NOT NULL,
        balance decimal(10,2) DEFAULT 0.00,
        role VARCHAR(20) DEFAULT 'ts_buyer' CHECK (role IN ('ts_buyer', 'ts_seller', 'ts_admin'))
    );`;

  try {
    await pool.query(query);
    console.log("Users table created successfully.");
  } catch (err) {
    console.error("Error creating user table: ", err);
  }
};

module.exports = { createUserTable };
