const Transaction = require("../models/transaction.model.js");

exports.getTransactions = async function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const type = req.query.type;
    const search = req.query.search;

    const filter = {};

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

    if (type) {
        filter.type = type;
    }

    if (search) {
        filter.title = { $regex: search, $options: "i" };
    }

    try {
        const total = await Transaction.countDocuments(filter);

        const transactions = await Transaction.find(filter)
            .sort({ date: -1, _id: -1 })
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

        const result = await Transaction.aggregate([
            {
                $facet: {
                    totals: [
                        {
                            $group: {
                                _id: "$type",
                                sum: { $sum: "$total" },
                            },
                        },
                    ],
                    monthlyExpenses: [
                        {
                            $match: {
                                type: "Expense",
                                date: { $gte: startOfMonth, $lte: endOfMonth },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                sum: { $sum: "$total" },
                            },
                        },
                    ],
                },
            },
        ]);

        const totals = result[0].totals || [];
        const monthlyExpenses = result[0].monthlyExpenses[0]?.sum || 0;

        let myBalance = 0;
        let myInvestments = 0;
        let myReserve = 0;

        for (const total of totals) {
            switch (total._id) {
                case "Income":
                    myBalance += total.sum;
                    break;
                case "Expense":
                case "Investment":
                case "Reserve":
                    myBalance -= total.sum;
                    break;
            }
            if (total._id === "Investment") myInvestments = total.sum;
            if (total._id === "Reserve") myReserve = total.sum;
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

exports.editTransaction = async function (req, res) {
    try {
        const { id } = req.params;
        const currentTransaction = await Transaction.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!currentTransaction) {
            return res.status(404).json({
                message: `Transaction with id ${id} not found`,
            });
        }

        res.status(200).json({
            message: "Transaction updated successfully",
            transaction: currentTransaction,
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.deleteTransaction = async function (req, res) {
    try {
        const { id } = req.params;
        const currentTransaction = await Transaction.findByIdAndDelete(id);

        if (!currentTransaction) {
            return res.status(404).json({
                message: `Transaction with id ${id} not found`,
            });
        }

        res.status(200).json({
            message: "Transaction deleted successfully",
            transaction: currentTransaction,
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
