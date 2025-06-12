require("dotenv").config();
const express = require('express');
const session = require('express-session');
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/dbConnect");
const PORT = process.env.PORT || 3001;
const verifyJWT = require('./middleware/verifyJWT');
const verifyRole = require('./middleware/verifyRoles');
connectDB();

// Routes
const authRoute = require('./controller/userAuthController');

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
app.use('/api/auth', require('./routes/authRoutes'));
app.use(verifyJWT);
app.use('/api/admin', verifyRole('Super Admin'), require('./routes/adminRoute'));
app.use('/api/subscription', verifyRole('Super Admin'), require('./routes/subscriptionRoutes'));
app.use('/api/category', require('./routes/category'));
app.use('/api/subcategory', require('./routes/subcategory'));
app.use('/api/company', require('./routes/company'));
app.use('/api/issue', require('./routes/issueRoutes'));

mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB...");
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});