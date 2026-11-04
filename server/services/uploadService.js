const Video = require("../models/video-model");
const User = require("../models/user-model");
const userService = require("../services/userService");
const metadataService = require("../services/metadataService");
const config = require("../config/config");
const coverGenerator = require("../media/coverGenerator");
const videoAssembler = require("../media/videoAssembler");
const youtubeClient = require("../clients/youtubeClient");
const revibedClient = require("../clients/revibedClient");
const uploadStorage = require("../storage/uploadStorage");
const { createUploadError, normalizeError } = require("../utils/errors");

const sleep = ms => new Promise(r => setTimeout(r, ms))

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
        this.audioCountryYear = (uploadData.audioCountryYear) ? uploadData.audioCountryYear.replace(/["']/g, "") : ''
    }
    async createVideoFile (uploadedFiles) {
        let coverFilePath = undefined
        const coverFile = uploadedFiles.find( item => item.fieldname === 'coverFile')
        if (coverFile) {
          if (coverFile.mimetype !== 'image/jpg') {
            await coverGenerator.convertToJpeg(coverFile.path, `${this.uploadDir}/cover.jpg`)
            coverFilePath = `${this.uploadDir}/cover.jpg`
          } else {
            coverFilePath = coverFile.path
          }
        }

        const videoCoverFile = (coverFile) ?
            await this.generateVideoCover(coverFilePath, this.uploadTemplate) :
            await this.generateVideoCover(`${this.uploadDir}/cover.jpg`, this.uploadTemplate)

        const audioFile = uploadedFiles.find( item => item.fieldname === 'audioFile')
        this.videoMusic = await videoAssembler.assembleVideo(
            videoCoverFile,
            audioFile.path,
            this.uploadDir
        );
    }
    async uploadFilesAuto (fileData) {
      this.title = fileData.title
      const coverFile = `${this.uploadDir}/cover.jpg`
      const videoCoverFile = await this.generateVideoCover(coverFile, this.uploadTemplate)
      const audioFile = `${this.uploadDir}/audio.mp3`
      this.videoMusic = await videoAssembler.assembleVideo(
          videoCoverFile,
          audioFile,
          this.uploadDir
      );
      return true
    }
    async generateVideoCover(file, coverType) {
        const { file: resultFile, error } = await coverGenerator.generateVideoCover(file, coverType, {
          audioArtist: this.audioArtist,
          audioTitle: this.audioTitle,
          audioCountryYear: this.audioCountryYear,
        });
        if (error) {
          this.errors.cover.push(error)
        }
        this.videoCover = resultFile;
        return resultFile
    }
    async pushToYoutube(releaseID) {
      const result = this.createPushResult(releaseID);

      try {
        this.validateYoutubeUploadInput();

        const tokens = await userService.getUserTokens(this.userID);
        const auth = youtubeClient.createOAuth2Client(tokens);
        const video = await youtubeClient.uploadVideo({
          auth,
          title: this.title,
          description: this.description,
          tags: this.tags,
          privacyStatus: this.privacyStatus,
          filePath: this.videoMusic,
        });

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
      if (!uploadStorage.fileExists(this.videoMusic)) {
        throw createUploadError("VIDEO_FILE_NOT_FOUND", `Video file not found: ${this.videoMusic}`, "validation_failed");
      }
      if (!this.title) {
        throw createUploadError("YOUTUBE_TITLE_REQUIRED", "YouTube title is required", "validation_failed");
      }
    }

    shouldSendToRevibed() {
      return this.userID === '102814452894667054158' || this.userID === '104745960371715319263';
    }

    async getVideosFromChannel(userID, playlistID) {
      const tokens = await userService.getUserTokens(userID)
      const auth = youtubeClient.createOAuth2Client(tokens, process.env.REDIRECT_URIS)

      const uploadsPlaylistId = await youtubeClient.listChannelUploadsPlaylist({ auth, handle: playlistID })
      if (uploadsPlaylistId) {
        await youtubeClient.listPlaylistItems({ auth, playlistId: uploadsPlaylistId })
      }

      return {
        allItems: true
      }
    }
    async getVideosFromPlaylist(userID, playlistID, stringSeparator = '-') {
      const tokens = await userService.getUserTokens(userID)
      const auth = youtubeClient.createOAuth2Client(tokens, process.env.REDIRECT_URIS)

      let nextPageToken = null
      let allItems = []
      let page = 1
      while (page == 1 || nextPageToken) {
        const { items, nextPageToken: newNextPageToken } = await youtubeClient.listPlaylistItems({
          auth,
          playlistId: playlistID,
          pageToken: nextPageToken,
        })

        nextPageToken = newNextPageToken

        if (items) {
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
      return !!saveItem;
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
      }
      user.uploads.push(videoData)
      const saveItem = await user.save()
      return !!saveItem;
    }
    async sendUplodedItemToRevibed(data, releaseID) {
      const newYoutubeItem = {
        videoId: data.id,
        title: data.snippet?.title || this.title,
        publishedAt: data.snippet?.publishedAt || null,
        thumbnails: data.snippet?.thumbnails ? data.snippet.thumbnails : null,
        releaseID: releaseID ? releaseID : null
      }

      try {
        const response = await revibedClient.addYoutubeItem(newYoutubeItem);
        return {
          success: true,
          status: "sent",
          response,
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

module.exports = UploadService;
