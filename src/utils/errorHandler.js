const ApiResponse = require("./apiResponse");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || "Internal Server Error",
    statusCode,
  };

  if (process.env.NODE_ENV === "development") {
    response.error = {
      name: err.name,
      stack: err.stack,
    };
  }

  res.status(statusCode).json(response);
};

module.exports = {
  AppError,
  errorHandler,
};
