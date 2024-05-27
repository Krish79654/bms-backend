const handleError = (err, req, res, next) => {
  let statusCode;
  let error;
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    statusCode = 400;
    error = "Images count should not exceed 6.";
  } else {
    statusCode = err.statusCode || 500;
    error = err.message || "Internal Server Error";
  }

  return res.status(statusCode).json({ error });
};

module.exports = handleError;
