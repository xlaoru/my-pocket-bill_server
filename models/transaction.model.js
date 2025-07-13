const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    total: {
        type: Number,
        required: true,
        min: 0,
    },
    type: {
        type: String,
        enum: ["Expense", "Income", "Investment", "Reserve"],
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

module.exports = mongoose.model("Transaction", transactionSchema);