const fs = require("fs");
const { google } = require("googleapis");
const { createUploadError } = require("../utils/errors");
const { normalizeTags } = require("../utils/tags");

const service = google.youtube("v3");
const OAuth2 = google.auth.OAuth2;

function createOAuth2Client(tokens, redirectUrl = "") {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    throw createUploadError(
      "YOUTUBE_CREDENTIALS_REQUIRED",
      "YouTube OAuth credentials are required",
      "configuration_failed"
    );
  }
  if (!tokens || !tokens.access_token) {
    throw createUploadError(
      "YOUTUBE_TOKENS_REQUIRED",
      "YouTube user tokens are missing or invalid",
      "auth_failed"
    );
  }

  const oauth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, redirectUrl);
  oauth2Client.credentials = tokens;
  oauth2Client.scopes = ["https://www.googleapis.com/auth/youtube"];
  return oauth2Client;
}

async function uploadVideo({ auth, title, description, tags, privacyStatus, filePath }) {
  const response = await service.videos.insert({
    resource: {
      snippet: {
        title,
        description: description || "",
        categoryId: 10,
        tags: normalizeTags(tags),
      },
      status: {
        privacyStatus: privacyStatus || "unlisted",
        license: "youtube",
      },
    },
    auth,
    part: "snippet,status",
    media: {
      body: fs.createReadStream(filePath),
    },
  });

  if (!response || !response.data || !response.data.id) {
    throw createUploadError(
      "YOUTUBE_UPLOAD_EMPTY_RESPONSE",
      "YouTube upload finished without a video id",
      "youtube_upload_failed",
      response?.data
    );
  }

  return response.data;
}

async function listChannelUploadsPlaylist({ auth, handle }) {
  const { data } = await service.channels.list({
    part: "id,snippet,contentDetails",
    forHandle: handle,
    maxResults: 50,
    auth,
  });

  return data?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
}

async function listPlaylistItems({ auth, playlistId, pageToken }) {
  const res = await service.playlistItems.list({
    part: "id,snippet,contentDetails",
    playlistId,
    pageToken,
    maxResults: 50,
    auth,
  });

  return {
    items: res.data.items,
    nextPageToken: res.data.nextPageToken,
  };
}

module.exports = {
  createOAuth2Client,
  uploadVideo,
  listChannelUploadsPlaylist,
  listPlaylistItems,
};
