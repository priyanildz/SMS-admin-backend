const mongoose = require("mongoose");

// REMOVED: require("dotenv").config(); - This should only be in index.js

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // Removed deprecated options: useNewUrlParser and useUnifiedTopology
    });
    console.log("MongoDB Atlas Connected");
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;