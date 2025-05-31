const HospitalService = require("../services/hospital.service");
const ApiResponse = require("../utils/apiResponse");
const { AppError } = require("../utils/errorHandler");

exports.getAllHospitals = async (req, res, next) => {
  try {
    const result = await HospitalService.getAllHospitals(req.query);
    res.json(
      ApiResponse.paginated(
        result.data,
        result.total,
        result.page,
        result.limit,
        "Hospitals retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

exports.getHospitalById = async (req, res, next) => {
  try {
    const hospital = await HospitalService.getHospitalById(req.params.id);
    res.json(ApiResponse.success(hospital, "Hospital retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

exports.createHospital = async (req, res, next) => {
  try {
    const hospitalData = { ...req.body };
    if (req.files && req.files.image) {
      hospitalData.image = req.files.image[0].path;
    }
    if (req.files && req.files.verificationDocuments) {
      hospitalData.verificationDocuments =
        req.files.verificationDocuments[0].path;
    }

    if (typeof hospitalData.services === "string") {
      hospitalData.services = JSON.parse(hospitalData.services);
    }
    if (typeof hospitalData.offDays === "string") {
      hospitalData.offDays = JSON.parse(hospitalData.offDays);
    }
    if (typeof hospitalData.holidays === "string") {
      hospitalData.holidays = JSON.parse(hospitalData.holidays);
    }
    const hospital = await HospitalService.createHospital(hospitalData);
    res
      .status(201)
      .json(ApiResponse.created(hospital, "Hospital created successfully"));
  } catch (error) {
    next(error);
  }
};

exports.updateHospital = async (req, res, next) => {
  try {
    const hospitalData = { ...req.body };

    if (req.files && req.files.image) {
      hospitalData.image = req.files.image[0].path;
    }
    if (req.files && req.files.verificationDocuments) {
      hospitalData.verificationDocuments =
        req.files.verificationDocuments[0].path;
    }

    if (typeof hospitalData.services === "string") {
      hospitalData.services = JSON.parse(hospitalData.services);
    }
    if (typeof hospitalData.offDays === "string") {
      hospitalData.offDays = JSON.parse(hospitalData.offDays);
    }
    if (typeof hospitalData.holidays === "string") {
      hospitalData.holidays = JSON.parse(hospitalData.holidays);
    }

    const hospital = await HospitalService.updateHospital(
      req.params.id,
      hospitalData
    );
    res.json(ApiResponse.success(hospital, "Hospital updated successfully"));
  } catch (error) {
    next(error);
  }
};

exports.deleteHospital = async (req, res, next) => {
  try {
    const result = await HospitalService.deleteHospital(req.params.id);
    res.json(ApiResponse.success(result, "Hospital deleted successfully"));
  } catch (error) {
    next(error);
  }
};
