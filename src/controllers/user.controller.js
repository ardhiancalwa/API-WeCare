const UserService = require("../services/user.service");
const ApiResponse = require("../utils/apiResponse");

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
