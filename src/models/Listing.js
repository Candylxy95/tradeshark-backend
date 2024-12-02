const { pool } = require("../db/db");

const createListingTable = async () => {
  const query = `
        CREATE TABLE IF NOT EXISTS listings (
           id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
           user_id UUID NOT NULL,
           img_src VARCHAR(255),
           ticker VARCHAR(10),
           asset_class VARCHAR(10) NOT NULL CHECK (asset_class IN ('Stock', 'Forex')),
           position VARCHAR(10) NOT NULL CHECK (position IN ('Long', 'Short')),
           entry_price DECIMAL(10,2) NOT NULL,
           take_profit DECIMAL(10,2) NOT NULL,
           stop_loss DECIMAL(10,2) NOT NULL,
           rr_ratio DECIMAL(10,2) GENERATED ALWAYS AS (entry_price / take_profit) STORED,
           price DECIMAL(4,2),
           notes TEXT,
           posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
           duration INTERVAL NOT NULL,
           expires_at TIMESTAMP GENERATED ALWAYS AS (posted_at + duration) STORED,
           likes NUMERIC DEFAULT 0 NOT NULL,
           FOREIGN KEY (user_id) references users(id)
        );
      `;

  try {
    await pool.query(query);
    console.log("Listing table created successfully.");
  } catch (err) {
    console.error("Error creating Listing table: ", err);
  }
};

const createListingHistoryTable = async () => {
  const query = `
  CREATE TABLE IF NOT EXISTS listing_history (
    history_id SERIAL PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES listings(id),
    user_id UUID NOT NULL,
    img_src VARCHAR(255),
    ticker VARCHAR(10),
    asset_class VARCHAR(10),
    position VARCHAR(10),
    entry_price DECIMAL(10,2),
    take_profit DECIMAL(10,2),
    stop_loss DECIMAL(10,2),
    rr_ratio DECIMAL(10,2) GENERATED ALWAYS AS (entry_price / take_profit) STORED,
    notes TEXT,
    posted_at TIMESTAMP NOT NULL,
    duration INTERVAL NOT NULL,
    expires_at TIMESTAMP GENERATED ALWAYS AS (posted_at + duration) STORED,
    action VARCHAR(20) DEFAULT 'UPDATE' NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );`;
  try {
    await pool.query(query);
    console.log("Listing history table created successfully.");
  } catch (err) {
    console.error("Error creating Listing history table: ", err);
  }
};

const createUpdateTrigger = async () => {
  const functionQuery = `
  CREATE OR REPLACE FUNCTION log_listing_history()
  RETURNS TRIGGER AS $$
  BEGIN
  IF (TG_OP = 'UPDATE') THEN
      INSERT INTO listing_history (listing_id, user_id, img_src, ticker, asset_class, position, entry_price, take_profit, stop_loss, notes, posted_at, duration, action, updated_at)
      VALUES (OLD.id, OLD.user_id, OLD.img_src, OLD.ticker, OLD.asset_class, OLD.position, OLD.entry_price, OLD.take_profit, OLD.stop_loss, OLD.notes, OLD.posted_at, OLD.duration, 'UPDATE', CURRENT_TIMESTAMP);
      RETURN NEW;
      END IF;
      RETURN NULL;
  END;
  $$ LANGUAGE plpgsql;`;

  const dropTriggerFunctionQuery = `
  DROP TRIGGER IF EXISTS trigger_log_listing_history ON listings;
`;

  const triggerFunctionQuery = `
  CREATE TRIGGER trigger_log_listing_history
    AFTER UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION log_listing_history();
  `;

  try {
    await pool.query(functionQuery);
    await pool.query(dropTriggerFunctionQuery);
    await pool.query(triggerFunctionQuery);

    console.log("Successfully created update trigger");
  } catch (err) {
    console.error("Error logging with update function: ", err);
  }
};

//remember condition to make this available to sellers only
module.exports = {
  createListingTable,
  createListingHistoryTable,
  createUpdateTrigger,
};
