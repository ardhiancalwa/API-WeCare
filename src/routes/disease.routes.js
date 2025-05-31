const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const diseaseController = require("../controllers/disease.controller");
const { verifyAccessToken } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const paginationValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

const diseaseValidation = [
  body("name").notEmpty().withMessage("Disease name is required"),
  body("type").notEmpty().withMessage("Type is required"),
  body("cost")
    .isFloat({ min: 0 })
    .withMessage("Cost must be a positive number"),
  body("hospitalId")
    .isInt({ min: 1 })
    .withMessage("Valid hospital ID is required"),
];

// Routes
router.get(
  "/diseases",
  verifyAccessToken,
  paginationValidation,
  validate,
  diseaseController.getAllDiseases
);

router.get(
  "/diseases/:id",
  verifyAccessToken,
  diseaseController.getDiseaseById
);

router.post(
  "/diseases",
  verifyAccessToken,
  diseaseValidation,
  validate,
  diseaseController.createDisease
);

router.patch(
  "/diseases/:id",
  verifyAccessToken,
  validate,
  diseaseController.updateDisease
);

router.delete(
  "/diseases/:id",
  verifyAccessToken,
  diseaseController.deleteDisease
);

module.exports = router;