// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const userController = require('../controllers/user.controller');
const { verifyAccessToken } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { upload } = require('../config/cloudinary');

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

const userValidation = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').matches(/^(\+62|62|0)8[1-9][0-9]{6,9}$/).withMessage('Valid phone number is required'),
  body('provinsi').notEmpty().withMessage('Provinsi is required'),
  body('kota').notEmpty().withMessage('Kota is required'),
  body('kecamatan').notEmpty().withMessage('Kecamatan is required'),
  body('kodepos').notEmpty().withMessage('Kodepos is required'),
  body('role').optional().isIn(['BPJS', 'NON_BPJS', 'NON_ACTIVE_BPJS', 'HOSPITAL_ADMIN'])
];

router.get(
  '/users',
  verifyAccessToken,
  paginationValidation,
  validate,
  userController.getAllUsers
);

router.get(
  '/users/:id',
  verifyAccessToken,
  userController.getUserById
);

router.post(
  '/users',
  verifyAccessToken,
  userValidation,
  validate,
  userController.createUser
);

router.patch(
  '/users/:id',
  verifyAccessToken,
  userValidation,
  upload.single('identity'), 
  userController.updateUser
);

router.delete(
  '/user/:id',
  verifyAccessToken,
  userController.deleteUser
);

module.exports = router;