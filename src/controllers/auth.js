const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../db/db");
const { v4: uuidv4 } = require("uuid");

const registration = async (req, res) => {
  try {
    const findUser = `SELECT * FROM users WHERE email = $1 OR phone_number = $2 AND role = $3`;
    const existingUser = await pool.query(findUser, [
      req.body.email,
      req.body.phone_number,
      req.body.role,
    ]);

    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ msg: "Email or phone number already taken." });
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 12);
    req.body.password = hashedPassword;

    const createUser = `INSERT INTO users (first_name, last_name, email, phone_number, password, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, last_name, email, phone_number, role;`;

    const values = [
      req.body.first_name,
      req.body.last_name,
      req.body.email,
      req.body.phone_number,
      hashedPassword,
      req.body.role,
    ];

    const newUser = await pool.query(createUser, values);

    res.status(201).json({
      msg: "Registration successful. Please sign in.",
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error("Registration error", err);
    res.status(500).json({ msg: "Registration failed." });
  }
};

const login = async (req, res) => {
  try {
    if (!req.body.email && !req.body.phone_number) {
      return res
        .status(400)
        .json({ msg: "Email or phone number is required." });
    }
    if (!req.body.password) {
      return res.status(400).json({ msg: "Password is required" });
    }
    const findUser = `SELECT * FROM users WHERE (email = $1 OR phone_number = $2) AND role = $3`;
    const existingUser = await pool.query(findUser, [
      req.body.email,
      req.body.phone_number,
      req.body.role,
    ]);
    if (existingUser.rows.length === 0) {
      return res.status(400).json({ msg: "Incorrect credentials" });
    }

    const validPassword = bcrypt.compareSync(
      req.body.password,
      existingUser.rows[0].password
    );

    if (!validPassword) {
      return res.status(400).json({ msg: "Wrong credentials" });
    }

    const claims = {
      id: existingUser.rows[0].id,
      name: existingUser.rows[0].first_name,
      role: existingUser.rows[0].role,
      email: existingUser.rows[0].email,
    };
    const access = jwt.sign(claims, process.env.ACCESS_SECRET, {
      expiresIn: "15d",
      jwtid: uuidv4(),
    });

    res.status(200).json({ msg: "Successfully logged in", access });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Login failed." });
  }
};

module.exports = { registration, login };
