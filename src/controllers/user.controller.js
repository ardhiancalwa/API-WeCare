const UserService = require("../services/user.service");
const ApiResponse = require("../utils/apiResponse");
const { deleteImage } = require('../utils/cloudinary');

exports.getAllUsers = async (req, res, next) => {
  try {
    const result = await UserService.getAllUsers(req.query);
    res.json(
      ApiResponse.paginated(
        result.data,
        result.total,
        result.page,
        result.limit,
        "Users retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    res.json(ApiResponse.success(user, "User retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const user = await UserService.createUser(req.body);
    res
      .status(201)
      .json(ApiResponse.created(user, "User created successfully"));
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await UserService.updateUser(req.params.id, req.body);
    res.json(ApiResponse.success(user, "User updated successfully"));
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const result = await UserService.deleteUser(req.params.id);
    res.json(ApiResponse.success(result, "User deleted successfully"));
  } catch (error) {
    next(error);
  }
};
