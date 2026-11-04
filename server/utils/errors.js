function createUploadError(code, message, status, details) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  error.details = details;
  return error;
}

function normalizeError(error, fallbackStatus = "failed") {
  const responseData = error?.response?.data;
  const responseStatus = error?.response?.status;

  return {
    code: error?.code || responseData?.error?.code || "UNKNOWN_ERROR",
    status: error?.status || fallbackStatus,
    message: error?.message || responseData?.error?.message || "Unknown error",
    httpStatus: responseStatus || null,
    details: error?.details || responseData || null,
  };
}

module.exports = { createUploadError, normalizeError };
