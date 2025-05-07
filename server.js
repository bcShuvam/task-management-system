require("dotenv").config();
const express = require('express');
const session = require('express-session');
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/dbConnect");
const PORT = process.env.PORT || 3001;
connectDB();

// built-in middleware to handle urlencoded data
// in other words, form data:
// 'content-type: application/x-www-form-urlencoded'
app.use(express.urlencoded({ extended: false }));

// middleware for cors
app.use(cors({ origin: "*" }));

// built-in middleware for json
app.use(express.json());

app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitilized: true,
    cookie: {secure: false}
}));

app.use('/api/test', require('./routes/test'));
app.use('/api/user', require('./routes/authRoutes'));
app.use('/api/subscription', require('./routes/subscriptionRoutes'));

mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB...");
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});