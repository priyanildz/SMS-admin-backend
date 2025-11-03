// // const express = require("express");
// // const connectDB = require("./config/db");
// // const authMiddleware = require('./middleware/auth')
// // const routes = require('./routes/routes')
// // const cors = require('cors')
// // const app = express();

// // app.use(cors({
// //   origin: true, 
// //   methods: ['GET', 'POST', 'PUT', 'DELETE'],
// //   credentials: true,
// //   allowedHeaders: ['Content-Type', 'Authorization','auth']
// // }));



// // //for body data
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));
// // app.use(authMiddleware) //check auth

// // app.use("/api", routes) //all routes (entry point)

// // const startServer = async() =>{
// //   await connectDB();
// //   app.listen(5000,()=>{
// //     console.log("Server Started at 5000")
// //   })
// // }
// // startServer();
// // Add this line at the very top to load your MONGO_URI from the .env file

// require('dotenv').config();

// const express = require("express");
// const connectDB = require("./config/db");
// const authMiddleware = require('./middleware/auth')
// const routes = require('./routes/routes')
// const cors = require('cors')
// const app = express();

// app.use(cors({
//   origin: true, 
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization','auth']
// }));

// // for body data
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(authMiddleware) //check auth

// app.use("/api", routes) //all routes (entry point)

// const startServer = async() =>{
//   // This connects to MongoDB using the MONGO_URI loaded above
//   await connectDB();
//   app.listen(5000,()=>{
//     console.log("Server Started at 5000")
//   })
// }
// startServer();

// MUST be the very first line to load MONGO_URI from .env
require('dotenv').config(); 

const express = require("express");
const connectDB = require("./config/db");
const authMiddleware = require('./middleware/auth')
const routes = require('./routes/routes')
const cors = require('cors')
const app = express();

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

const startServer = async() =>{
  // This connects to MongoDB using the MONGO_URI loaded above
  await connectDB();
  app.listen(5000,()=>{
    console.log("Server Started at 5000")
  })
}
startServer();