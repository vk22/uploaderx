const USER_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

function sanitizeUserId(userID) {
  const value = String(userID ?? "");
  if (!USER_ID_PATTERN.test(value)) {
    const error = new Error("Invalid userID");
    error.status = "validation_failed";
    throw error;
  }
  return value;
}

module.exports = { sanitizeUserId };
