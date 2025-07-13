require('dotenv').config();

const express = require("express");
const cookieParser = require('cookie-parser');
const mongoose = require("mongoose");
const cors = require("cors");

const transactionRoutes = require("./routes/transaction-route")

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
    res.end("My Pocket Bill server is working");
});

app.use("/api", transactionRoutes);

app.use((error, req, res, next) => {
    console.log(error.message);
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
});

mongoose
    .connect(
        process.env.MONGODB_URI
    )
    .then(() => {
        console.log("Connected to DB");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(() => {
        console.log("Connection failed");
    });