const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { google } = require("googleapis");
const service = google.youtube("v3");
const OAuth2 = google.auth.OAuth2;
const rootDir = process.env.ROOT_DIR;
const kxTitle = rootDir + "/sources/kx-title.png";
const uploaderLogo = rootDir + "/sources/uploader-logo.png";
const backgroundBlack = rootDir + "/sources/background.jpg";
const fontBold = rootDir + "/fonts/Montserrat-SemiBold.ttf";
const fontLight = rootDir + "/fonts/Montserrat-Light.ttf";
const Video = require("../models/video-model");
const User = require("../models/user-model");
const axios = require("axios");
const userService = require('../services/userService');
const metadataService = require("../services/metadataService");
const config = require("../config/config");
const sharp = require('sharp');
const sleep = ms => new Promise(r => setTimeout(r, ms))

// function ffmpegSync(coverFile, uploadedFileOriginal, orderFolder) {
//   console.log('ffmpegSync ', coverFile, uploadedFileOriginal, orderFolder)
//     // ffmpeg -loop 1 -framerate 1 -i cover.jpg -i audio.aif -c copy -shortest output.mkv
//     return new Promise((resolve, reject) => {
//       ffmpeg()
//         .input(coverFile)
//         .loop()
//         .addInputOption("-framerate 1")
//         .input(uploadedFileOriginal)
//         .audioCodec("copy")
//         .outputOptions(["-shortest"])
//         .output(orderFolder + "/output.mkv")
//         .on("start", function (commandLine) {
//           console.log("Converting to .mkv");
//           console.log(commandLine);
//         })
//         .on("progress", function (progress) {
//           console.log(+progress.percent);
//           // console.log(+Math.round(progress.percent));
//         })
//         .on("error", function (err) {
//           console.log("An error occurred: " + err.message);
//         })
//         .on("end", function (data) {
//           console.log("Convert to .mkv: Processing finished !" + data);
//           resolve(orderFolder + "/output.mkv");
//         })
//         .run();
//     });
//   }

function ffmpegSync(coverFile, uploadedFileOriginal, orderFolder) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(orderFolder, "output.mp4");

    ffmpeg()
      .input(coverFile)
      .inputOptions(["-loop 1", "-framerate 1"])
      .input(uploadedFileOriginal)
      .outputOptions([
        "-vf scale=1280:-2",
        "-c:v libx264",
        "-preset ultrafast",
        "-tune stillimage",
        "-crf 30",
        "-pix_fmt yuv420p",
        "-c:a aac",
        "-b:a 320k",
        "-ar 44100",
        "-movflags +faststart",
        "-shortest",
        "-threads 1",
      ])
      .output(outputPath)
      .on("start", (cmd) => console.log("FFmpeg started:", cmd))
      .on("progress", (progress) => {
        if (typeof progress.percent === "number") {
          console.log(`Progress: ${Math.min(100, progress.percent).toFixed(0)}%`);
        }
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err.message);
        reject(err);
      })
      .on("end", () => {
        console.log("FFmpeg finished!");
        resolve(outputPath);
      })
      .run();
  });
}

class UploadService {
    constructor() {
        this.tokens = {}
        this.uploadDir = null;
        this.userID = null;
        this.title = null
        this.description = null
        this.tags = null
        this.privacyStatus = null
        this.uploadTemplate = null
        this.releaseCoverIsUploaded = null
        this.videoCover = null
        this.videoMusic = null
        this.pushVideo = {
            success: false,
            message: undefined,
            url: null
        }
        this.errors = {
            cover: [],
            audio: [],
            youtube: []
        }
        this.audioTitle = null
        this.audioArtist = null
        this.audioCountryYear = null
    }
    async setUserID(data) {
        this.userID = data.userID;
    }
    async setUploadData(uploadData, uploadDir) {
      console.log('setUploadData ', uploadData)
        this.userID = uploadData.userID;
        this.uploadDir = uploadDir;
        this.title = uploadData.title
        this.description = (uploadData.uploadTemplate === 'KX') ? config.kxDescription : uploadData.description
        this.tags = (uploadData.uploadTemplate === 'KX') ? config.tags : uploadData.tags
        this.privacyStatus = uploadData.privacyStatus
        this.uploadTemplate = uploadData.uploadTemplate
        this.releaseCoverIsUploaded = uploadData.releaseCoverIsUploaded
        this.audioTitle = (uploadData.audioTitle) ? uploadData.audioTitle.replace(/["']/g, "") : ''
        this.audioArtist = (uploadData.audioArtist) ? uploadData.audioArtist.replace(/["']/g, "") : ''
        this.audioCountryYear = uploadData.audioCountryYear
    }
    async createVideoFile (uploadedFiles) {
        // console.log('uploadedFiles ', uploadedFiles)    
        let coverFilePath = undefined
        const coverFile = uploadedFiles.find( item => item.fieldname === 'coverFile')
        if (coverFile) {
          if (coverFile.mimetype !== 'image/jpg') {
            await convertToJPG(coverFile.path, `${this.uploadDir}/cover.jpg`)
            coverFilePath = `${this.uploadDir}/cover.jpg`
          } else {
            coverFilePath = coverFile.path
          }
        }

        const videoCoverFile = (coverFile) ? 
            await this.generateVideoCover(coverFilePath, this.uploadTemplate) :
            await this.generateVideoCover(`${this.uploadDir}/cover.jpg`, this.uploadTemplate)

        const audioFile = uploadedFiles.find( item => item.fieldname === 'audioFile')
        const videoMusicFile = await ffmpegSync(
            videoCoverFile,
            audioFile.path,
            this.uploadDir
        );
        this.videoMusic = videoMusicFile
    }
    async uploadFilesAuto (fileData) {
      // console.log('uploadedFiles ', uploadedFiles)    
      this.title = fileData.title
      const coverFile = `${this.uploadDir}/cover.jpg`
      const videoCoverFile = await this.generateVideoCover(coverFile, this.uploadTemplate) 
      const audioFile = `${this.uploadDir}/audio.mp3`
      const videoMusicFile = await ffmpegSync(
          videoCoverFile,
          audioFile,
          this.uploadDir
      );
      this.videoMusic = videoMusicFile
      return true
  }
    async generateVideoCover(file, coverType) {
      console.log('generateVideoCover ', coverType)
        try {
          if (coverType === "KX") {
            // console.log('kxTitle ', kxTitle)
            const im1 = `magick ${file} -resize 1920x1080 -gravity East -background '#1a1a1a' -extent 1920x1080 ${file}`;
            const im2 = `magick composite -gravity West -geometry +50+150 ${kxTitle} ${file} -colorspace rgb -type truecolor ${file}`;
            await exec(im1);
            await exec(im2);
          } else if (coverType === "1") {
            // const im1 = `magick -size 1920x1080 xc:none -colorspace rgb -type truecolor ${backgroundBlack}`;
            const im1 = `magick ${file} -resize 920x920 ${backgroundBlack} +swap -gravity West -geometry +100+0 -compose over -composite ${file}`;
            const im2 = `magick composite -gravity SouthEast -geometry +80+80 ${uploaderLogo} ${file} ${file}`;
            const im3 = `magick ${file} -font ${fontBold} -pointsize 32 -fill white -gravity NorthEast -draw "text 80,80 '${this.audioArtist}'" -font ${fontLight} -draw "text 80,130 '${this.audioTitle}'" -draw "text 80,180 '${this.audioCountryYear}'" ${file}`
            // await exec(im1);
            await exec(im1);
            await exec(im2);
            await exec(im3);
          } else if (coverType === "2") {
            const im1 = `magick ${file} -resize 1920x1080 -gravity center -background '#000000' -extent 1920x1080 ${file}`;
            await exec(im1);
          }
        } catch (err) {
          console.log('err ', err)
          this.errors.cover.push(err)
        }
        this.videoCover = file;
        return file
    }
    async pushToYoutube(releaseID) {
      const result = this.createPushResult(releaseID);

      try {
        this.validateYoutubeUploadInput();

        const oauth2Client = await this.createYoutubeClient();
        const video = await this.uploadVideoToYoutube(oauth2Client);

        result.success = true;
        result.status = "uploaded";
        result.message = "File uploaded";
        result.url = video.id;
        result.video = {
          id: video.id,
          url: `https://www.youtube.com/watch?v=${video.id}`,
          title: video.snippet?.title || this.title,
          publishedAt: video.snippet?.publishedAt || null,
          thumbnails: video.snippet?.thumbnails || null,
        };
        result.youtube.upload = {
          success: true,
          response: video,
        };

        if (this.shouldSendToRevibed()) {
          console.log("sendUplodedItemToRevibed...");
          result.integrations.revibed = await this.sendUplodedItemToRevibed(video, releaseID);
          if (!result.integrations.revibed.success) {
            result.warnings.push({
              code: "REVIBED_SEND_FAILED",
              message: result.integrations.revibed.error?.message || "Revibed integration failed",
              details: result.integrations.revibed,
            });
          }
        } else {
          result.integrations.revibed = {
            success: true,
            status: "skipped",
            reason: "User is not configured for Revibed sync",
          };
        }

        this.pushVideo = {
          success: true,
          message: result.message,
          url: video.id,
          videoId: video.id,
          youtubeUrl: result.video.url,
        };

        return result;
      } catch (error) {
        const normalizedError = normalizeError(error);
        console.log("pushToYoutube error ", normalizedError);

        result.success = false;
        result.status = normalizedError.status || "youtube_upload_failed";
        result.message = normalizedError.message;
        result.errors.push(normalizedError);
        result.youtube.upload = {
          success: false,
          error: normalizedError,
        };

        this.pushVideo = {
          success: false,
          message: normalizedError.message,
          url: null,
          error: normalizedError,
        };

        return result;
      }
    }

    createPushResult(releaseID) {
      return {
        success: false,
        status: "pending",
        message: undefined,
        url: null,
        releaseID: releaseID || null,
        video: null,
        youtube: {
          upload: null,
        },
        integrations: {
          revibed: null,
        },
        errors: [],
        warnings: [],
      };
    }

    validateYoutubeUploadInput() {
      if (!this.userID) {
        throw createUploadError("YOUTUBE_USER_REQUIRED", "YouTube userID is required", "validation_failed");
      }
      if (!this.videoMusic) {
        throw createUploadError("VIDEO_FILE_REQUIRED", "Video file is required", "validation_failed");
      }
      if (!fs.existsSync(this.videoMusic)) {
        throw createUploadError("VIDEO_FILE_NOT_FOUND", `Video file not found: ${this.videoMusic}`, "validation_failed");
      }
      if (!this.title) {
        throw createUploadError("YOUTUBE_TITLE_REQUIRED", "YouTube title is required", "validation_failed");
      }
      if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
        throw createUploadError("YOUTUBE_CREDENTIALS_REQUIRED", "YouTube OAuth credentials are required", "configuration_failed");
      }
    }

    async createYoutubeClient() {
      const tokens = await userService.getUserTokens(this.userID);
      if (!tokens || !tokens.access_token) {
        throw createUploadError("YOUTUBE_TOKENS_REQUIRED", "YouTube user tokens are missing or invalid", "auth_failed");
      }

      const oauth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, '');
      oauth2Client.credentials = tokens;
      oauth2Client.scopes = ["https://www.googleapis.com/auth/youtube"];
      return oauth2Client;
    }

    async uploadVideoToYoutube(oauth2Client) {
      console.log('uploading... ', this.title)
      console.log('uploading... ', this.description)

      const response = await service.videos.insert({
        resource: {
          snippet: {
            title: this.title,
            description: this.description || "",
            categoryId: 10,
            tags: normalizeTags(this.tags),
          },
          status: {
            privacyStatus: this.privacyStatus || "unlisted",
            license: "youtube",
          },
        },
        auth: oauth2Client,
        part: "snippet,status",
        media: {
          body: fs.createReadStream(this.videoMusic),
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

      console.log("Video Insert Done.", response.data);
      return response.data;
    }

    shouldSendToRevibed() {
      return this.userID === '102814452894667054158' || this.userID === '104745960371715319263';
    }

    async getVideosFromChannel(userID, playlistID) {
      console.log('getMyVideos playlistID ', playlistID)
      const tokens = await userService.getUserTokens(userID)
      //// credentials
      const clientSecret = process.env.CLIENT_SECRET;
      const clientId = process.env.CLIENT_ID;
      const redirectUrl = process.env.REDIRECT_URIS;
      const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
      oauth2Client.credentials = tokens;
      oauth2Client.scopes = ["https://www.googleapis.com/auth/youtube"];

      let nextPageToken = null
      let items = undefined
      let allItems = []
      let page = 1
      
      let { data } = await service.channels.list({
            part: "id,snippet,contentDetails",
            forHandle: playlistID,
            pageToken: nextPageToken,
            maxResults: 50,
            auth: oauth2Client
        });

      if (data) {
        let uploadsID = data.items[0].contentDetails.relatedPlaylists.uploads;
        console.log('uploadsID ', uploadsID);

        let res = await service.playlistItems.list({
            part: "id,snippet,contentDetails",
            playlistId: uploadsID,
            pageToken: nextPageToken,
            maxResults: 50,
            auth: oauth2Client
        });

        console.log('res ', res.data.items)

      }  

      

      return {
        allItems: true
      }
    }
    async getVideosFromPlaylist(userID, playlistID, stringSeparator = '-') {
      console.log('getMyVideos playlistID ', playlistID)
      const tokens = await userService.getUserTokens(userID)
      //// credentials
      const clientSecret = process.env.CLIENT_SECRET;
      const clientId = process.env.CLIENT_ID;
      const redirectUrl = process.env.REDIRECT_URIS;
      const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
      oauth2Client.credentials = tokens;
      oauth2Client.scopes = ["https://www.googleapis.com/auth/youtube"];

      let nextPageToken = null
      let items = undefined
      let allItems = []
      let page = 1
      while (page == 1 || nextPageToken) {
        let res = await service.playlistItems.list({
            part: "id,snippet,contentDetails",
            playlistId: playlistID,
            pageToken: nextPageToken,
            maxResults: 50,
            auth: oauth2Client
        });
        
        nextPageToken = res.data.nextPageToken
        items = res.data.items;
        
        if (items) {
          // fs.writeFileSync(`${rootDir}/list-${page}.json`, JSON.stringify(items) , 'utf-8');

          items.forEach(item => allItems.push(item.snippet.title));
        }
        page += 1
      }

      const goodReleases = await this.afterYoutubeRequest(allItems, stringSeparator);
      return {
        allItems: goodReleases
      }
    }

    async afterYoutubeRequest(allItems, stringSeparator) {
      const goodReleases = []
      for (let item of allItems) {
          try {
            item = item.split("[").shift().split("(").shift();
            const titleAsArray = item.split(stringSeparator);
            const artist = titleAsArray[0] ? titleAsArray[0].trim() : '';
            const title = titleAsArray[1] ? titleAsArray[1].trim() : '';
            const album = '';
            const trackData = { artist, title, album };
            /// Discogs
            const { success, data } = await metadataService.getDiscogsReleaseOnly({ trackData });
            if (success) {
              await sleep(1000);
              /// Revibed
              const checkReleaseInRevibedTools = await metadataService.checkReleaseInRevibedTools(data.id);
              data.releaseExist = checkReleaseInRevibedTools.result
              data.labelsWarnings = checkReleaseInRevibedTools.labelsWarnings

              console.log('discogsResult ', data)
              if (data) {
                const exist = goodReleases.find(item => item.id === data.id)
                if (!exist) {
                  goodReleases.push(data)
                }
              }
            }

            await sleep(2000);

          } catch (error) {
            console.log('error.message ', error.message)
          }
      }
      return goodReleases
    }

    async saveVideoToDB() {
      let videoData = {
        userID: this.userID,
        url: this.pushVideo.url,
        date: Date.now()
      }
      const videoForSave = new Video(videoData);
      let saveItem = await videoForSave.save();
      if (saveItem) {
        //console.log('Track item saved')
        return true;
      } else {
        //console.log('err')
        return false;
      }
    }
    async saveVideoToUser() {
      let videoData = {
        title: this.title,
        description: this.description,
        tags: this.tags,
        url: this.pushVideo.url,
        date: Date.now()
      }
      let user = await User.findOne({ id: this.userID } )
      if (!user) {
        console.log('user not found')
        return false;
      } else {
        user.uploads.push(videoData)
        let saveItem = await user.save()
        if (saveItem) {
          //console.log('Track item saved')
          return true;
        } else {
          //console.log('err')
          return false;
        }
      }

    }
    async sendUplodedItemToRevibed(data, releaseID) {
      let newYoutubeItem = {
        videoId: data.id,
        title: data.snippet?.title || this.title,
        publishedAt: data.snippet?.publishedAt || null,
        thumbnails: data.snippet?.thumbnails ? data.snippet.thumbnails : null,
        releaseID: releaseID ? releaseID : null
      }

      if (!process.env.RTOOLS_API_KEY) {
        return {
          success: false,
          status: "configuration_failed",
          error: {
            code: "REVIBED_API_KEY_REQUIRED",
            message: "Revibed API key is required",
          },
          payload: newYoutubeItem,
        };
      }

      try {
        const response = await axios.post('https://tools.revibed.com/api/add-youtube', newYoutubeItem, {
          headers: {
            'content-type': 'application/json',
            'accept': 'application/json',
            'x-api-key': process.env.RTOOLS_API_KEY
          }
        });
        console.log(response.data);

        return {
          success: true,
          status: "sent",
          response: response.data,
          payload: newYoutubeItem,
        };
      } catch (error) {
        const normalizedError = normalizeError(error, "revibed_failed");
        console.log("sendUplodedItemToRevibed error ", normalizedError);

        return {
          success: false,
          status: normalizedError.status,
          error: normalizedError,
          payload: newYoutubeItem,
        };
      }

    }
    toString() {
        return this
    }
}



async function convertToJPG(startImage, finalImage) {

  ///// create cover.jpg
  try {
    // fs.copyFileSync(coverFile, previewCoverFile);

    // await createCoverSmall(previewCoverFile, previewCoverFileSmall);
    await sharp(startImage)
      .jpeg({
        quality: 100
      })
      .toFile(finalImage)
      .then(info => {
       //console.log(info);
        fs.unlinkSync(startImage);
        return true;
      })
      .catch(err => {
       //console.log(err);
        return false
      });

  } catch (err) {
   //console.log(err)
  }
}

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

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.filter(Boolean);
  }
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return undefined;
}

module.exports = UploadService;
