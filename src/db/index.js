const { createUserTable } = require("../models/Users");
const { createExternalTransactionTable } = require("../models/Transactions");
const {
  createListingTable,
  createListingHistoryTable,
  createUpdateTrigger,
} = require("../models/Listing");

const setUpDatabase = async () => {
  await createUserTable();
  await createExternalTransactionTable();
  await createListingTable();
  await createListingHistoryTable();
  await createUpdateTrigger();
};

module.exports = { setUpDatabase };
