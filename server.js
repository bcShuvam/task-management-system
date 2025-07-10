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

// Add this line after main: server.js line on package.json file
// "type": "module", to use import

var admin = require("firebase-admin");
var serviceAccount = require("./deskgoo-task-firebase-adminsdk-fbsvc-b498e99945.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

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
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/notification', require('./routes/notificationRoutes'));
app.use(verifyJWT);
app.use('/api/test', require('./routes/test'));
app.use('/api/admin', verifyRole('Super Admin'), require('./routes/adminRoute'));
app.use('/api/subscription', verifyRole('Super Admin'), require('./routes/subscriptionRoutes'));
app.use('/api/category', require('./routes/category'));
app.use('/api/subcategory', require('./routes/subCategory'));
app.use('/api/company', require('./routes/company'));
app.use('/api/issue', require('./routes/issueRoutes'));

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB...");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  // const server = app.listen(PORT, '0.0.0.0', () => {
  //   const networkInterfaces = os.networkInterfaces();
  //   const port = server.address().port;

  //   console.log("Server is running on the following network interfaces:");
  //   for (const [name, infos] of Object.entries(networkInterfaces)) {
  //     for (const info of infos) {
  //       if (info.family === 'IPv4' && !info.internal) {
  //         console.log(`➡️ http://${info.address}:${port} (${name})`);
  //       }
  //     }
  //   }
  // });
});
// local: http://192.168.1.84:8005