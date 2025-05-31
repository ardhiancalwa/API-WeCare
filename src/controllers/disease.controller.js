const DiseaseService = require("../services/disease.service");
const ApiResponse = require("../utils/apiResponse");

exports.getAllDiseases = async (req, res, next) => {
  try {
    const result = await DiseaseService.getAllDiseases(req.query);
    res.json(
      ApiResponse.paginated(
        result.data,
        result.total,
        result.page,
        result.limit,
        "Diseases retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

exports.getDiseaseById = async (req, res, next) => {
  try {
    const disease = await DiseaseService.getDiseaseById(req.params.id);
    res.json(ApiResponse.success(disease, "Disease retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

exports.createDisease = async (req, res, next) => {
  try {
    const disease = await DiseaseService.createDisease(req.body);
    res
      .status(201)
      .json(ApiResponse.created(disease, "Disease created successfully"));
  } catch (error) {
    next(error);
  }
};

exports.updateDisease = async (req, res, next) => {
  try {
    const disease = await DiseaseService.updateDisease(
      req.params.id,
      req.body
    );
    res.json(ApiResponse.success(disease, "Disease updated successfully"));
  } catch (error) {
    next(error);
  }
};

exports.deleteDisease = async (req, res, next) => {
  try {
    const result = await DiseaseService.deleteDisease(req.params.id);
    res.json(ApiResponse.success(result, "Disease deleted successfully"));
  } catch (error) {
    next(error);
  }
};