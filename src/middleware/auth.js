const jwt = require("jsonwebtoken");

const isSignedIn = (req, res, next) => {
  if (!("authorization" in req.headers)) {
    return res.status(401).json({ error: "missing authorization" });
  }
  const token = req.headers["authorization"].replace("Bearer ", "");
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
      req.decoded = decoded;
      next();
    } catch (error) {
      console.error("Verification error", error.message);
      return res.status(401).json({ msg: "Not authorized" });
    }
  } else {
    return res
      .status(403)
      .json({ status: "error", msg: "you're not signed in" });
  }
};

const authBuyer = (req, res, next) => {
  try {
    const { role } = req.decoded;
    if (role === "ts_buyer" || role === "ts_superadmin") {
      next();
    } else
      return res
        .status(403)
        .json({ status: "error", mag: "you're not authorised" });
  } catch (error) {
    console.error(error.message);
    return res.status(401).json({ status: "error", msg: "not authorised" });
  }
};

const authSeller = (req, res, next) => {
  try {
    const { role } = req.decoded;
    if (role === "ts_seller" || role === "ts_superadmin") {
      next();
    } else
      return res
        .status(403)
        .json({ status: "error", mag: "you're not authorised" });
  } catch (error) {
    console.error(error.message);
    return res.status(401).json({ status: "error", msg: "not authorised" });
  }
};

const isUser = async (req, res, next) => {
  try {
    const findUser = `SELECT * FROM users WHERE id = $1`;
    const existingUser = await pool.query(findUser, [req.decoded.id]);

    if (existingUser.rows.length === 0) {
      throw new Error("User not authenticated");
    }
    next();
  } catch (error) {
    console.error(error.message);
    return res.status(401).json({ status: "error", msg: "not authorised" });
  }
};

module.exports = { isSignedIn, authBuyer, authSeller, isUser };
