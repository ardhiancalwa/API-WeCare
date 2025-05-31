const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

const { errorHandler } = require("./utils/errorHandler");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log("Incoming request:", {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers,
  });
  next();
});
// Routes
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
