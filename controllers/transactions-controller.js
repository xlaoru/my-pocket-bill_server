const Transaction = require("../models/transaction.model.js");

exports.getTransactions = async function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startDate = req.query.startDate
    const endDate = req.query.endDate;
    const type = req.query.type;

    const filter = {};

    if (type) {
        filter.type = type;
    }

    if (startDate || endDate) {
        filter.date = {}

        if (startDate) {
            filter.date.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
        }

        if (endDate) {
            filter.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
        }
    }

    try {
        const total = await Transaction.countDocuments(filter);

        const transactions = await Transaction.find(filter)
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            transactions,
            total,
            page,
            pages: Math.ceil(total / limit),
            message: "Transactions retrieved successfully"
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.getFinanceCategoriesSummary = async function (req, res) {
    try {
        const myBalance = 0

        const monthlyExpenses = 0

        const myInvestments = 0

        const myReserve = 0

        res.status(200).json({
            myBalance,
            monthlyExpenses,
            myInvestments,
            myReserve
        })
    } catch(error) {
        res.status(500).json({ error: "Server error" });
    }
}