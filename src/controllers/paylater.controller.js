const PayLaterService = require("../services/paylater.service");
const ApiResponse = require("../utils/apiResponse");

exports.createPayLater = async (req, res, next) => {
  try {
    const paylater = await PayLaterService.createPayLater(req.body);
    res
      .status(201)
      .json(ApiResponse.created(paylater, "PayLater created successfully"));
  } catch (error) {
    next(error);
  }
};

exports.getAllPayLaters = async (req, res, next) => {
  try {
    const result = await PayLaterService.getAllPayLaters(req.query);
    res.json(
      ApiResponse.paginated(
        result.data,
        result.total,
        result.page,
        result.limit,
        "PayLater retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

exports.getPayLaterById = async (req, res, next) => {
  try {
    const paylater = await PayLaterService.getPayLaterById(req.params.id);
    res.json(ApiResponse.success(paylater, "PayLater found successfully"));
  } catch (error) {
    next(error);
  }
};

exports.updatePayLater = async (req, res, next) => {
  try {
    const paylater = await PayLaterService.updatePayLater(
      req.params.id,
      req.body
    );
    res.json(ApiResponse.success(paylater, "PayLater updated successfully"));
  } catch (error) {
    next(error);
  }
};

exports.deletePayLater = async (req, res, next) => {
  try {
    const result = await PayLaterService.deletePayLater(req.params.id);
    res.json(ApiResponse.success(result, "PayLater deleted successfully"));
  } catch (error) {
    next(error);
  }
};

exports.approvePayLater = async (req, res, next) => {
  try {
    const paylater = await PayLaterService.approvePayLater(req.params.id);
    res.json(ApiResponse.success(paylater, "PayLater approved successfully"));
  } catch (error) {
    next(error);
  }
};
