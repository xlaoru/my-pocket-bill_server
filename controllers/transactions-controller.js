const Transaction = require("../models/transaction.model.js");

exports.getTransactions = async function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const type = req.query.type;

    const filter = {};

    if (type) {
        filter.type = type;
    }

    if (startDate || endDate) {
        filter.date = {};

        if (startDate) {
            filter.date.$gte = new Date(
                new Date(startDate).setHours(0, 0, 0, 0)
            );
        }

        if (endDate) {
            filter.date.$lte = new Date(
                new Date(endDate).setHours(23, 59, 59, 999)
            );
        }
    }

    try {
        const total = await Transaction.countDocuments(filter);

        const transactions = await Transaction.find(filter)
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            transactions,
            total,
            page,
            pages: Math.ceil(total / limit),
            message: "Transactions retrieved successfully",
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.getFinanceCategoriesSummary = async function (req, res) {
    try {
        const transactions = await Transaction.find({});

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
        );

        let myBalance = 0;
        let monthlyExpenses = 0;
        let myInvestments = 0;
        let myReserve = 0;

        for (const transaction of transactions) {
            const total = transaction.total || 0;

            if (transaction.type === "Income") {
                myBalance += total;
            } else if (
                transaction.type === "Expense" ||
                transaction.type === "Investment" ||
                transaction.type === "Reserve"
            ) {
                myBalance -= total;
            }

            if (transaction.type === "Investment") {
                myInvestments += total;
            }

            if (transaction.type === "Reserve") {
                myReserve += total;
            }

            if (
                transaction.type === "Expense" &&
                new Date(transaction.date) >= startOfMonth &&
                new Date(transaction.date) <= endOfMonth
            ) {
                monthlyExpenses += total;
            }
        }

        res.status(200).json({
            myBalance,
            monthlyExpenses,
            myInvestments,
            myReserve,
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.createNewTransaction = async function (req, res) {
    try {
        const { title, total, type, date } = req.body;

        if (!title || !total || !type || !date) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newTransaction = new Transaction({
            title,
            total,
            type,
            date: new Date(date),
        });

        await newTransaction.save();

        res.status(200).json({
            message: "Transaction created successfully",
            transaction: newTransaction,
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
