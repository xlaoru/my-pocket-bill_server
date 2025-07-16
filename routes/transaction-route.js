const Router = require("express");
const router = new Router();

const {
    getTransactions,
    getFinanceCategoriesSummary
} = require("../controllers/transactions-controller.js");

router.get("/transactions", getTransactions);

router.get("/transactions/finance-categories-summary", getFinanceCategoriesSummary)

module.exports = router;