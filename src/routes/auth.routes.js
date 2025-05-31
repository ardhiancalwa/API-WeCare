// src/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");
const {
  verifyRefreshToken,
  verifyAccessToken,
} = require("../middleware/auth.middleware");

// Validation middleware
const registerValidation = [
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  body("phone").matches(/^(\+62|62|0)8[1-9][0-9]{6,9}$/),
  body("fullName").notEmpty(),
  body("provinsi").notEmpty(),
  body("kota").notEmpty(),
  body("kecamatan").notEmpty(),
  body("kodepos").notEmpty(),
];

const loginValidation = [body("email").isEmail(), body("password").notEmpty()];

// Routes
router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);
router.post("/refresh-token", verifyRefreshToken, authController.refreshToken);
router.post("/logout", authController.logout);

module.exports = router;
