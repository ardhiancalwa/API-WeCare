// src/routes/treatment.routes.js
const express = require("express");
const router = express.Router();
const { body, param, query } = require("express-validator");
const { validate } = require("../middleware/validation.middleware");
const { verifyAccessToken } = require("../middleware/auth.middleware");
const treatmentController = require("../controllers/treatment.controller");

// Create treatment
router.post(
  "/treatments",
  [
    body("appointmentDate").isISO8601().withMessage("Invalid appointment date"),
    body("userId").isInt().withMessage("Invalid user ID"),
    body("diseaseId").isInt().withMessage("Invalid disease ID"),
    body("hospitalId").isInt().withMessage("Invalid hospital ID"),
    body("payLaterId").optional().isInt().withMessage("Invalid PayLater ID"),
    body("notes").optional().isString().withMessage("Notes must be a string"),
  ],
  validate,
  verifyAccessToken,
  treatmentController.createTreatment
);

// Get all treatments with pagination
router.get(
  "/treatments",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Invalid page number"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Invalid limit"),
  ],
  validate,
  verifyAccessToken,
  treatmentController.getAllTreatments
);

// Get treatment by ID
router.get(
  "/treatment/:id",
  [param("id").isInt().withMessage("Invalid treatment ID")],
  validate,
  verifyAccessToken,
  treatmentController.getTreatmentById
);

// Update treatment
router.put(
  "/treatments/:id",
  [
    param("id").isInt().withMessage("Invalid treatment ID"),
    body("appointmentDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid appointment date"),
    body("status")
      .optional()
      .isIn(["PENDING", "ONGOING", "COMPLETED", "CANCELLED"])
      .withMessage("Invalid status"),
    body("notes").optional().isString().withMessage("Notes must be a string"),
  ],
  validate,
  verifyAccessToken,
  treatmentController.updateTreatment
);

router.patch(
  "/treatment/:id/approve",
  [param("id").isInt().withMessage("Invalid treatment ID")],
  validate,
  verifyAccessToken,
  treatmentController.approveTreatment
);

router.post(
  "/treatments/cost-estimate",
  [
    body("diseaseId").isInt().withMessage("Invalid disease ID"),
    body("hospitalId").isInt().withMessage("Invalid hospital ID"),
    body("payLaterId").optional().isInt().withMessage("Invalid PayLater ID"),
  ],
  validate,
  verifyAccessToken,
  treatmentController.getCostEstimate
);

module.exports = router;
