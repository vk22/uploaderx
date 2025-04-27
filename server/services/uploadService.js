const fs = require("fs");
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
const config = require("../config/config");

const sharp = require('sharp');

function ffmpegSync(coverFile, uploadedFileOriginal, orderFolder) {
  console.log('ffmpegSync ', coverFile, uploadedFileOriginal, orderFolder)
    // ffmpeg -loop 1 -framerate 1 -i cover.jpg -i audio.aif -c copy -shortest output.mkv
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(coverFile)
        .loop()
        .addInputOption("-framerate 1")
        .input(uploadedFileOriginal)
        .audioCodec("copy")
        .outputOptions(["-shortest"])
        .output(orderFolder + "/output.mkv")
        .on("start", function (commandLine) {
          console.log("Converting to .mkv");
          console.log(commandLine);
        })
        .on("progress", function (progress) {
          console.log(+progress.percent);
          // console.log(+Math.round(progress.percent));
        })
        .on("error", function (err) {
          console.log("An error occurred: " + err.message);
        })
        .on("end", function (data) {
          console.log("Convert to .mkv: Processing finished !" + data);
          resolve(orderFolder + "/output.mkv");
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
    async setUploadData(uploadData, uploadDir) {
      console.log('setUploadData ', uploadData)
        this.uploadDir = uploadDir;
        this.userID = uploadData.userID;
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
        /// get tokens from BD
        const tokens = await userService.getUserTokens(this.userID)
        const file = this.videoMusic;
        const title = this.title;
        const uploadTemplate = this.uploadTemplate;
        const description = this.description
        const tags = this.tags;
        const privacyStatus = this.privacyStatus
        // //// credentials
        const clientSecret = process.env.CLIENT_SECRET;
        const clientId = process.env.CLIENT_ID;
        const redirectUrl = '';
        const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
        oauth2Client.credentials = tokens;
        oauth2Client.scopes = ["https://www.googleapis.com/auth/youtube"];

        console.log('uploading... ', title)
        console.log('uploading... ', description)

        return new Promise((resolve, reject) => {
          try {
            service.videos.insert({
                resource: {
                  snippet: {
                    title: title,
                    description: description,
                    categoryId: 10,
                    tags: tags,
                  },
                  status: {
                    privacyStatus: privacyStatus,
                    license: "youtube",
                  },
                },
                auth: oauth2Client,
                part: "snippet,status",
                media: {
                  body: fs.createReadStream(file),
                },
              },
              (err, data) => {
                if (data) {
                    console.log("Video Insert Done.", data.data);
      
                    //// Add to Playlist IF KX
                    if (uploadTemplate === "KX") {

                        service.playlistItems.insert({
                            part: "id,snippet",
                            resource: {
                            snippet: {
                                playlistId: "PLfw2qURVvqds10Nt2t2MrBSGLN1evMCU5",
                                resourceId: {
                                videoId: data.data.id,
                                kind: "youtube#video",
                                },
                            },
                            },
                            auth: oauth2Client,
                        },
                        function (err, data, response) {
                            if (err) {
                            console.log("Error.", err);
                            } else if (data) {
                            console.log("Video Added To Playlist.", data.data.id);
                            }
                            if (response) {
                            console.log("Status code: " + response.statusCode);
                            }
                        });

                        ////
                        this.sendUplodedItemToRevibed(data.data, releaseID)
                    }
                    if (this.userID === '102814452894667054158' || this.userID === '104745960371715319263') {
                      console.log("sendUplodedItemToRevibed...");
                      this.sendUplodedItemToRevibed(data.data, releaseID)
                    }

                    this.pushVideo = {
                        success: true,
                        message: "File uploaded",
                        url: data.data.id
                    }
                    
                    resolve(true);
                }
      
                if (err) {
                    console.log("Error.", err);
                    this.pushVideo = {
                        success: false,
                        message: err,
                        url: null,
                    }
                    resolve(false);
                }
              }
            );
          } catch (error) {
            console.log(error);
          }
        });
    }
    async getMyVideos() {
      const token = this.token;
      //// credentials
      const clientSecret = process.env.CLIENT_SECRET;
      const clientId = process.env.CLIENT_ID;
      const redirectUrl = process.env.REDIRECT_URIS;
      const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
      oauth2Client.credentials = token;
      oauth2Client.scopes = ["https://www.googleapis.com/auth/youtube"];


      let nextPageToken = null
      let items = undefined
      let page = 1
      while (page == 1 || nextPageToken) {
        let res = await service.playlistItems.list({
            part: "id,snippet,contentDetails",
            playlistId: "PLfw2qURVvqds10Nt2t2MrBSGLN1evMCU5",
            pageToken: nextPageToken,
            maxResults: 50,
            auth: oauth2Client
        });
        nextPageToken = res.data.nextPageToken
        items = res.data.items
        if (items) {
          fs.writeFileSync(`${rootDir}/list-${page}.json`, JSON.stringify(items) , 'utf-8');
        }
        page += 1
      }
    }
    async getMyLastVideos() {
      const token = this.token;
      //// credentials
      const clientSecret = process.env.CLIENT_SECRET;
      const clientId = process.env.CLIENT_ID;
      const redirectUrl = process.env.REDIRECT_URIS;
      const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
      oauth2Client.credentials = token;
      oauth2Client.scopes = ["https://www.googleapis.com/auth/youtube"];

      let res = await service.playlistItems.list({
          part: "id,snippet,contentDetails",
          playlistId: "PLfw2qURVvqds10Nt2t2MrBSGLN1evMCU5",
          maxResults: 50,
          auth: oauth2Client
      });
      let items = res.data.items
      console.log('items ', items)
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
        title: data.snippet.title,
        publishedAt: data.snippet.publishedAt,
        thumbnails: data.snippet.thumbnails ? data.snippet.thumbnails : null,
        releaseID: releaseID ? releaseID : null
      }
      axios.post('https://tools.revibed.com/api/add-youtube', newYoutubeItem, {
        headers: {
          'content-type': 'application/json',
          'accept': 'application/json',
          'x-api-key': 'l74b9ba9qmext9a6ulniigq8'
        }
      })
      .then((response) => {
        console.log(response.data);
      }, (error) => {
        console.log(error);
      });

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

module.exports = new UploadService();


