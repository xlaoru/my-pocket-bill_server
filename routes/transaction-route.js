const Router = require("express");
const router = new Router();

const {
    getTransactions,
    getFinanceCategoriesSummary,
    createNewTransaction,
} = require("../controllers/transactions-controller.js");

router.get("/transactions", getTransactions);

router.get(
    "/transactions/finance-categories-summary",
    getFinanceCategoriesSummary
);

router.post("/transactions", createNewTransaction);

module.exports = router;
