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
      rated BOOLEAN DEFAULT FALSE NOT NULL,
      purchased_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (buyer_id) REFERENCES users(id),
      FOREIGN KEY (seller_id, listing_id) REFERENCES listings(seller_id, id),
      PRIMARY KEY (seller_id, listing_id, buyer_id)
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
      expires_at TIMESTAMP GENERATED ALWAYS AS (purchased_on + INTERVAL '1 month') STORED,
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

const createRatedTrigger = async () => {
  const functionQuery = `
  CREATE OR REPLACE FUNCTION rate_listing()
  RETURNS TRIGGER AS $$
  BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.rated = TRUE AND OLD.rated IS DISTINCT FROM NEW.rated) THEN
      UPDATE listings SET likes = likes + 1
      WHERE id = NEW.listing_id;
      END IF;

  IF (TG_OP = 'UPDATE' AND NEW.rated = FALSE AND OLD.rated IS DISTINCT FROM NEW.rated) THEN
  UPDATE listings SET likes = likes - 1
  WHERE id = NEW.listing_id;
  END IF;

  RETURN NEW;
END;
  $$ LANGUAGE plpgsql;`;

  const dropTriggerFunctionQuery = `
  DROP TRIGGER IF EXISTS trigger_rate_listing ON internal_transactions;
`;

  const triggerFunctionQuery = `
  CREATE TRIGGER trigger_rate_listing
    AFTER UPDATE OF rated ON internal_transactions
    FOR EACH ROW
    EXECUTE FUNCTION rate_listing();
  `;

  try {
    await pool.query(functionQuery);
    await pool.query(dropTriggerFunctionQuery);
    await pool.query(triggerFunctionQuery);

    console.log("Successfully created update rate trigger");
  } catch (err) {
    console.error("Error logging with update rate function: ", err);
  }
};

module.exports = {
  createExternalTransactionTable,
  createInternalTransactionTable,
  createSubscriptionTransactionTable,
  createRatedTrigger,
};
