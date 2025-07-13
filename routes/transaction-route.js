const Router = require("express");
const router = new Router();

const {
    getTransactions,
} = require("../controllers/transactions-controller.js");

router.get("/transactions", getTransactions);

module.exports = router;