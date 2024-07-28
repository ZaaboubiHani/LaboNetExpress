const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const app = express();
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "laboNetDB",
  })
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Database connection error:", err));

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("tiny"));

// Import Routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const fileRoutes = require("./routes/fileRoutes");

// Add Routes

app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/file", fileRoutes);
app.use("/uploads", express.static("uploads"));
// Handle 404 errors
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
  });
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status).json({ message: err });
  });
  
  // Start the server
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });