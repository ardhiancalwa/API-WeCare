// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const userController = require('../controllers/user.controller');
const { verifyAccessToken } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

router.get(
  '/',
  verifyAccessToken,
  paginationValidation,
  validate,
  userController.getAllUsers
);

module.exports = router;