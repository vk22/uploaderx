const axios = require("axios");

const API_URL_TOOLS = "https://tools.revibed.com/api";

function assertApiKeyConfigured() {
  if (!process.env.RTOOLS_API_KEY) {
    const error = new Error("Revibed API key is required");
    error.code = "REVIBED_API_KEY_REQUIRED";
    error.status = "configuration_failed";
    throw error;
  }
}

async function addYoutubeItem(payload) {
  assertApiKeyConfigured();
  const response = await axios.post(`${API_URL_TOOLS}/add-youtube`, payload, {
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "x-api-key": process.env.RTOOLS_API_KEY,
    },
  });
  return response.data;
}

async function checkRelease(releaseID) {
  const response = await axios.post(
    `${API_URL_TOOLS}/check-release`,
    { releaseID },
    { headers: { "x-api-key": process.env.RTOOLS_API_KEY } }
  );
  return response.data;
}

module.exports = { addYoutubeItem, checkRelease };
