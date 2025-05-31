// src/controllers/auth.controller.js
const AuthService = require("../services/auth.service");
const { AppError } = require("../utils/errorHandler");
const ApiResponse = require("../utils/apiResponse");

exports.register = async (req, res, next) => {
  try {
    // Debug logging
    console.log("Request headers:", req.headers);
    console.log("Request body:", req.body);
    console.log("Content-Type:", req.headers["content-type"]);

    // Check if body exists and has content
    if (!req.body) {
      throw new AppError("Request body is missing", 400);
    }

    // Check if body is empty
    if (Object.keys(req.body).length === 0) {
      throw new AppError("Request body is empty", 400);
    }

    const result = await AuthService.register(req.body);
    res
      .status(201)
      .json(ApiResponse.created(result, "User registered successfully"));
  } catch (error) {
    console.error("Register error:", error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(ApiResponse.success(result, "Login successful"));
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshToken(refreshToken);
    res.json(ApiResponse.success(result, "Token refreshed successfully"));
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }
    const result = await AuthService.logout(refreshToken);
    res.json(ApiResponse.success(result, "Logged out successfully"));
  } catch (error) {
    next(error);
  }
};
