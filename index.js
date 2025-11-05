// MUST be the very first line to load MONGO_URI from .env
// Note: Vercel will ignore this line in production, 
// but it is needed for local testing with Vercel CLI.
require('dotenv').config(); 

const express = require("express");
const connectDB = require("./config/db"); // Assuming this function connects to Atlas
const authMiddleware = require('./middleware/auth')
const routes = require('./routes/routes')
const cors = require('cors')
const app = express();

// --- MongoDB Connection Setup for Serverless ---
// This function will execute on cold start, opening the connection.
connectDB(); 

app.use(cors({
  origin: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization','auth']
}));

// for body data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware) //check auth

app.use("/api", routes) //all routes (entry point)

// Add a simple root route for Vercel to ping and confirm the function is running
app.get('/', (req, res) => {
    res.status(200).send('API is running.');
});


// !!! REMOVE app.listen() !!!
// Vercel handles the listening part for serverless functions, 
// so this line must be removed or commented out.
// app.listen(5000, () => console.log("Server ready on port 3000."));


// 👇👇👇 This is the crucial line for Vercel Serverless deployment 👇👇👇
module.exports = app;