const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: "localhost",
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgresQL database");
    client.release();
  } catch (err) {
    console.error("Connection to database error", err);
    process.exit(1);
  }
};

module.exports = { connectDB, pool };
