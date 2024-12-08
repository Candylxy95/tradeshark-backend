const {
  createUserTable,
  createProfileTable,
  createProfileTrigger,
} = require("../models/Users");
const {
  createExternalTransactionTable,
  createInternalTransactionTable,
  createSubscriptionTransactionTable,
} = require("../models/Transactions");
const {
  createListingTable,
  createListingHistoryTable,
  createUpdateTrigger,
} = require("../models/Listings");
const { createReviewsTable } = require("../models/Reviews");
const { createSubscriptionsTable } = require("../models/Subscriptions");

const setUpDatabase = async () => {
  await createUserTable();
  await createExternalTransactionTable();
  await createListingTable();
  await createListingHistoryTable();
  await createUpdateTrigger();
  await createInternalTransactionTable();
  await createSubscriptionsTable();
  await createReviewsTable();
  await createSubscriptionTransactionTable();
  await createProfileTable();
  await createProfileTrigger();
};

module.exports = { setUpDatabase };
