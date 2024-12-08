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

const createProfileTable = async () => {
  const query = `
  CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID NOT NULL PRIMARY KEY,
    profile_img TEXT DEFAULT 'https://cdn.midjourney.com/972aec0b-b06d-4967-8437-aef445e5b90b/0_1.png' NOT NULL,
    bio TEXT DEFAULT 'Hello! I am a new tradeshark member.' NOT NULL,
    role VARCHAR(20) DEFAULT 'ts_buyer' CHECK (role IN ('ts_buyer', 'ts_seller', 'ts_admin')),
    status VARCHAR(20) DEFAULT 'Beginner' NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`;

  try {
    await pool.query(query);
    console.log("Profiles table created successfully.");
  } catch (err) {
    console.error("Error creating profiles table: ", err);
  }
};

const createProfileTrigger = async () => {
  const functionQuery = `
  CREATE OR REPLACE FUNCTION create_user_profile()
  RETURNS TRIGGER AS $$
  BEGIN
  IF (TG_OP = 'INSERT') THEN
      INSERT INTO user_profiles (user_id, role)
      VALUES (
        NEW.id, 
        NEW.role
      );
      RETURN NEW;
  END IF;
  END;
  $$ LANGUAGE plpgsql;`;

  const dropTriggerFunctionQuery = `
  DROP TRIGGER IF EXISTS trigger_create_user_profile ON users;
`;

  const triggerFunctionQuery = `
  CREATE TRIGGER trigger_create_user_profile
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();
  `;

  try {
    await pool.query(functionQuery);
    await pool.query(dropTriggerFunctionQuery);
    await pool.query(triggerFunctionQuery);

    console.log(
      "Successfully created function to trigger insertion of user profile on sign up"
    );
  } catch (err) {
    console.error("Error creating user profile trigger function: ", err);
  }
};

module.exports = { createUserTable, createProfileTable, createProfileTrigger };
