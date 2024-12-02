const { createUserTable } = require("../models/Users");
const {
  createExternalTransactionTable,
  createInternalTransactionTable,
} = require("../models/Transactions");
const {
  createListingTable,
  createListingHistoryTable,
  createUpdateTrigger,
} = require("../models/Listings");
const { createReviewsTable } = require("../models/Reviews");

const setUpDatabase = async () => {
  await createUserTable();
  await createExternalTransactionTable();
  await createListingTable();
  await createListingHistoryTable();
  await createUpdateTrigger();
  await createInternalTransactionTable();
  await createReviewsTable();
};

module.exports = { setUpDatabase };
