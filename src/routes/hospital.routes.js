const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const hospitalController = require("../controllers/hospital.controller");
const { verifyAccessToken } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { optionalSingle, upload } = require("../config/cloudinary"); 

const paginationValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

const hospitalValidation = [
  body("name").notEmpty().withMessage("Hospital name is required"),
  body("type").notEmpty().withMessage("Type is required"),
  body("provinsi").notEmpty().withMessage("Provinsi is required"),
  body("kota").notEmpty().withMessage("Kota is required"),
  body("kecamatan").notEmpty().withMessage("Kecamatan is required"),
  body("kodepos").notEmpty().withMessage("Kodepos is required"),
  body("phone")
    .matches(/^(\+62|62|0)8[1-9][0-9]{6,9}$/)
    .withMessage("Valid phone number is required"),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
  body("services").isArray().withMessage("Services must be an array"),
  body("services.*").isString().withMessage("Each service must be a string"),
  body("openTime")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Open time must be in HH:mm format"),
  body("closeTime")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Close time must be in HH:mm format"),
  body("offDays").isArray().withMessage("Off days must be an array"),
  body("offDays.*")
    .isIn([
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
      "Minggu",
    ])
    .withMessage("Invalid day name"),
  body("holidays").isArray().withMessage("Holidays must be an array"),
  body("holidays.*")
    .isISO8601()
    .withMessage("Invalid date format for holidays"),
];

// Routes
router.get(
  "/hospitals",
  // verifyAccessToken,
  paginationValidation,
  validate,
  hospitalController.getAllHospitals
);

router.get(
  "/hospitals/:id",
  verifyAccessToken,
  hospitalController.getHospitalById
);

router.post(
  "/hospitals",
  verifyAccessToken,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'verificationDocuments', maxCount: 1 }
  ]),
  hospitalValidation,
  validate,
  hospitalController.createHospital
);

router.patch(
  "/hospital/:id",
  verifyAccessToken,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'verificationDocuments', maxCount: 1 }
  ]),
  validate,
  hospitalController.updateHospital
);

router.delete(
  "/hospital/:id",
  verifyAccessToken,
  hospitalController.deleteHospital
);

module.exports = router;
