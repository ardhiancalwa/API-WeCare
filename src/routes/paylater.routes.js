const express = require("express");
const router = express.Router();
const { body, query, param } = require("express-validator");
const payLaterController = require("../controllers/paylater.controller");
const { verifyAccessToken } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const paginationValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

const payLaterValidation = [
  body("tenor")
    .isInt({ min: 1, max: 12 })
    .withMessage("Tenor must be between 1 and 12 months"),
  body("userId").isInt({ min: 1 }).withMessage("Valid user ID is required"),
  body("status")
    .optional()
    .isIn(["PENDING", "APPROVED", "REJECTED", "PAID"])
    .withMessage("Invalid status value"),
];

router.get(
  "/paylaters",
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
  payLaterController.getAllPayLaters
);

router.get(
  "/paylater/:id",
  [param("id").isInt().withMessage("Invalid PayLater ID")],
  validate,
  verifyAccessToken,
  payLaterController.getPayLaterById
);

router.post(
  "/paylaters",
  [
    body("amount")
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("tenor")
      .isInt({ min: 1, max: 36 })
      .withMessage("Tenor must be between 1 and 36 months"),
    body("userId").isInt().withMessage("Invalid user ID"),
  ],
  validate,
  verifyAccessToken,
  payLaterController.createPayLater
);

router.patch(
  "/paylaters/:id",
  verifyAccessToken,
  [
    param("id").isInt().withMessage("Invalid PayLater ID"),
    body("amount")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("tenor")
      .optional()
      .isInt({ min: 1, max: 36 })
      .withMessage("Tenor must be between 1 and 36 months"),
    body("status")
      .optional()
      .isIn(["PENDING", "APPROVED", "REJECTED", "PAID"])
      .withMessage("Invalid status"),
  ],
  validate,
  payLaterController.updatePayLater
);

router.delete(
  "/paylaters/:id",
  verifyAccessToken,
  [param("id").isInt().withMessage("Invalid PayLater ID")],
  payLaterController.deletePayLater
);

router.patch(
  "/paylater/:id/approve",
  [param("id").isInt().withMessage("Invalid PayLater ID")],
  validate,
  payLaterController.approvePayLater
);

module.exports = router;
