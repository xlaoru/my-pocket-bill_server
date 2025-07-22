const Router = require("express");
const router = new Router();

const {
    getTransactions,
    getFinanceCategoriesSummary,
    createNewTransaction,
    editTransaction,
    deleteTransaction,
} = require("../controllers/transactions-controller.js");

router.get("/transactions", getTransactions);

router.get(
    "/transactions/finance-categories-summary",
    getFinanceCategoriesSummary
);

router.post("/transactions", createNewTransaction);

router.patch("/transactions/:id", editTransaction);

router.delete("/transactions/:id", deleteTransaction);

module.exports = router;
