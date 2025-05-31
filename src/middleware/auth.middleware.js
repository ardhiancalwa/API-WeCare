const jwt = require("jsonwebtoken");
const { AppError } = require("../utils/errorHandler");
const ApiResponse = require("../utils/apiResponse");

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new AppError("Invalid token", 401);
  }
};

exports.verifyAccessToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json(ApiResponse.unauthorized("No token provided"));
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

exports.verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res
        .status(401)
        .json(ApiResponse.unauthorized("No refresh token provided"));
    }

    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
