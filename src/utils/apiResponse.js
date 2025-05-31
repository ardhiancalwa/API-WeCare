const Pagination = require("./pagination");

class ApiResponse {
  static success(data = null, message = "Success", statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
    };
  }

  static error(message = "Error", statusCode = 500, errors = null) {
    return {
      success: false,
      statusCode,
      message,
      errors,
    };
  }

  static paginated(data, total, page, limit, message = "Success") {
    const paginatedData = Pagination.getPaginationResponse(
      data,
      total,
      page,
      limit
    );
    return this.success(paginatedData, message);
  }

  // Specific response methods
  static created(data = null, message = "Resource created successfully") {
    return this.success(data, message, 201);
  }

  static badRequest(message = "Bad Request", errors = null) {
    return this.error(message, 400, errors);
  }

  static unauthorized(message = "Unauthorized") {
    return this.error(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return this.error(message, 403);
  }

  static notFound(message = "Resource not found") {
    return this.error(message, 404);
  }

  static validationError(errors) {
    return this.error("Validation Error", 422, errors);
  }

  static serverError(message = "Internal Server Error") {
    return this.error(message, 500);
  }
}

module.exports = ApiResponse;
