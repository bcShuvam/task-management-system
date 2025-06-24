require("dotenv").config();
const express = require('express');
// const session = require('express-session');
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/dbConnect");
const PORT = process.env.PORT || 3001;
const verifyJWT = require('./middleware/verifyJWT');
const verifyRole = require('./middleware/verifyRoles');
const os = require('os');
connectDB();

// Routes
// const authRoute = require('./controller/userAuthController');

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});

// built-in middleware to handle urlencoded data
// in other words, form data:
// 'content-type: application/x-www-form-urlencoded'
app.use(express.urlencoded({ extended: false }));

// middleware for cors
app.use(cors({ origin: "*" }));

// built-in middleware for json
app.use(express.json());

// app.use(session({
//     secret: 'supersecretkey',
//     resave: false,
//     saveUninitilized: true,
//     cookie: {secure: false}
// }));
console.log('Hello world!');
app.use('/api/test', require('./routes/test'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use(verifyJWT);
app.use('/api/admin', verifyRole('Super Admin'), require('./routes/adminRoute'));
app.use('/api/subscription', verifyRole('Super Admin'), require('./routes/subscriptionRoutes'));
app.use('/api/category', require('./routes/category'));
app.use('/api/subcategory', require('./routes/subCategory'));
app.use('/api/company', require('./routes/company'));
app.use('/api/issue', require('./routes/issueRoutes'));

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB...");

  const server = app.listen(PORT, '0.0.0.0', () => {
    const networkInterfaces = os.networkInterfaces();
    const port = server.address().port;

    console.log("Server is running on the following network interfaces:");
    for (const [name, infos] of Object.entries(networkInterfaces)) {
      for (const info of infos) {
        if (info.family === 'IPv4' && !info.internal) {
          console.log(`➡️ http://${info.address}:${port} (${name})`);
        }
      }
    }
  });
});