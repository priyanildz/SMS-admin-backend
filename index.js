// // MUST be the very first line to load MONGO_URI from .env
// // Note: Vercel will ignore this line in production, 
// // but it is needed for local testing with Vercel CLI.
// require('dotenv').config(); 

// const express = require("express");
// const connectDB = require("./config/db"); // Assuming this function connects to Atlas
// const authMiddleware = require('./middleware/auth')
// const routes = require('./routes/routes')
// const cors = require('cors')
// const app = express();

// // --- MongoDB Connection Setup for Serverless ---
// // This function will execute on cold start, opening the connection.
// connectDB(); 

// app.use(cors({
//   origin: true, 
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization','auth']
// }));

// // for body data
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // 🛑 STEP 1: ADD UNPROTECTED TEST ROUTE HERE
// // When you visit the Vercel URL (e.g., /api/), this route runs first 
// // and confirms the server is alive BEFORE the authentication check runs.
// app.get('/', (req, res) => {
//     res.status(200).send('API is running successfully! Authentication will apply to all subsequent routes.');
// });


// // 🛑 STEP 2: APPLY AUTH MIDDLEWARE TO EVERYTHING ELSE
// // Any requests that make it past this point (e.g., /api/users) will require the 'auth' header.
// app.use(authMiddleware) 


// // 🛑 STEP 3: APPLY ALL OTHER ROUTES
// // Note: Since all your specific API routes are mounted under "/api" here, 
// // and the Vercel rewrite routes the root (/) to this entire file, 
// // the full URL for your routes will be: https://your-domain.vercel.app/api/route-name
// app.use("/api", routes) 


// // !!! REMOVE app.listen() !!!
// // Vercel handles the listening part for serverless functions, 
// // so this line must be removed or commented out.
// // app.listen(5000, () => console.log("Server ready on port 3000."));


// // 👇👇👇 This is the crucial line for Vercel Serverless deployment 👇👇👇
// module.exports = app;











// MUST be the very first line to load MONGO_URI from .env
require('dotenv').config(); 

const express = require("express");
const connectDB = require("./config/db");
const authMiddleware = require('./middleware/auth');
const routes = require('./routes/routes');
const cors = require('cors');

const app = express();

// --- MongoDB Connection ---
connectDB();

// --- CORS ---
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'auth']
}));

// 👇 IMPORTANT: Explicitly allow OPTIONS before auth
app.options('*', cors());

// --- Body parsers ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health check (no auth) ---
app.get('/', (req, res) => {
  res.status(200).send(
    'API is running successfully! Authentication applies to protected routes.'
  );
});

// ✅ APPLY AUTH — but SKIP OPTIONS
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  return authMiddleware(req, res, next);
});

// --- Protected routes ---
app.use("/api", routes);

// --- Vercel export ---
module.exports = app;
