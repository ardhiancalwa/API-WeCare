const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(
      ApiResponse.validationError(errors.array())
    );
  }
  next();
};