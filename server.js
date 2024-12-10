require("dotenv").config();

const express = require("express");
const app = express();
const { connectDB } = require("./src/db/db");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { setUpDatabase, setUpTimeZone } = require("./src/db/index");
const authRouter = require("./src/routers/auth");
const listingRouter = require("./src/routers/listing");
const externalTransactionRouter = require("./src/routers/externalTransactions");
const internalTransactionRouter = require("./src/routers/internalTransaction");
const reviewRouter = require("./src/routers/review");
const userRouter = require("./src/routers/user");
const subscriptionRouter = require("./src/routers/subscription");
const { isSignedIn } = require("./src/middleware/auth");
const Stripe = require("stripe");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

connectDB();
setUpDatabase();
setUpTimeZone();

app.use(cors());
app.use(helmet());
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRouter);
app.use(isSignedIn);
app.use("/user", userRouter);
app.use("/transaction", externalTransactionRouter);
app.use("/transaction", internalTransactionRouter);

app.use("/review", reviewRouter);
app.use("/listing", listingRouter);
app.use("/subscription", subscriptionRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`SERVER running on port ${PORT}`);
});
