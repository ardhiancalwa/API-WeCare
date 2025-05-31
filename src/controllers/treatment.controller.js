// src/controllers/treatment.controller.js
const TreatmentService = require("../services/treatment.service");
const ApiResponse = require("../utils/apiResponse");

exports.createTreatment = async (req, res, next) => {
  try {
    const treatment = await TreatmentService.createTreatment(req.body);
    res
      .status(201)
      .json(ApiResponse.created(treatment, "Treatment created successfully"));
  } catch (error) {
    next(error);
  }
};

exports.getAllTreatments = async (req, res, next) => {
  try {
    const result = await TreatmentService.getAllTreatments(req.query);
    res.json(
      ApiResponse.paginated(
        result.data,
        result.total,
        result.page,
        result.limit,
        "Treatments retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

exports.getTreatmentById = async (req, res, next) => {
  try {
    const treatment = await TreatmentService.getTreatmentById(req.params.id);
    res.json(ApiResponse.success(treatment, "Treatment found successfully"));
  } catch (error) {
    next(error);
  }
};

exports.updateTreatment = async (req, res, next) => {
  try {
    const treatment = await TreatmentService.updateTreatment(
      req.params.id,
      req.body
    );
    res.json(ApiResponse.success(treatment, "Treatment updated successfully"));
  } catch (error) {
    next(error);
  }
};

exports.approveTreatment = async (req, res, next) => {
  try {
    const treatment = await TreatmentService.approveTreatment(req.params.id);
    res.json(ApiResponse.success(treatment, "Treatment approved successfully"));
  } catch (error) {
    next(error);
  }
};

exports.getCostEstimate = async (req, res, next) => {
  try {
    const estimate = await TreatmentService.getCostEstimate(req.body);
    res.json(
      ApiResponse.success(estimate, "Cost estimate retrieved successfully")
    );
  } catch (error) {
    next(error);
  }
};
