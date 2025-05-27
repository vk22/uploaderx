const fs = require('fs-extra')
const { google } = require("googleapis");
const service = google.youtube("v3");
const OAuth2 = google.auth.OAuth2;
const rootDir = process.env.ROOT_DIR;
const uploadDir =  rootDir + "/uploads";
const uploadDirRVBD =  rootDir + "/uploads/auto/audio";
const scopes = ["https://www.googleapis.com/auth/youtube"];
var Discogs = require("disconnect").Client;
var db = new Discogs({
  consumerKey: "ZLPAhBKDWpYhlrbQWUUH",
  consumerSecret: "eXaccGPIbxGhODNMucbRYMEvSKzeJRhM",
}).database();
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const kxTitle = uploadDir + "/kx-title.png";
// const UploadItem = require('./uploadItem.js');
const uploadService = require("../services/uploadService");
const metadataService = require("../services/metadataService");
const Video = require("../models/video-model");

const sleep = ms => new Promise(r => setTimeout(r, ms))

const startAutoUpload = async (req, res) => {
  const uploadData = req.body.data
  const userID = uploadData.userID
  const files = fs.readdirSync(`${autoUploadDir}/audio`)
  const uploadUserDir = `${uploadDir}/${userID}`; 
  // const newUpload = new UploadItem(uploadData, uploadUserDir)
  await uploadService.setUploadData(uploadData, uploadUserDir)


  for (const file of files) {
    if (file !== '.DS_Store') {
      let filePath = `${autoUploadDir}/audio/${file}`
      const metadata = await metadataService.readID3Tags(filePath)
      let releaseID = file.split('--')[0]
      // const pictureData = `data:${metadata.picture.format};base64,${metadata.picture.data.toString('base64')}`
      if (metadata) {
        const pictureData = metadata.picture.data
        /// create cover file
        fs.writeFileSync(`${autoUploadDir}/visual/cover.jpg`, pictureData)
        /// cover move
        fs.copySync(`${autoUploadDir}/visual/cover.jpg`, `${uploadUserDir}/cover.jpg`)
        fs.unlinkSync(`${autoUploadDir}/visual/cover.jpg`);
        /// audio move
        fs.copySync(filePath, `${uploadUserDir}/audio.mp3`)
        fs.unlinkSync(filePath);
      }
      const fileData = {
        title: metadata.title
      }
      //await newUpload.uploadFilesAuto(fileData)
      await uploadService.uploadFilesAuto(fileData)
      await sleep(1000)
      // await newUpload.pushToYoutube(releaseID)
      await uploadService.pushToYoutube(releaseID)
      console.log('pushToYoutube Done!')
      await sleep(20000)
    }
  }
  console.log('All works is done!')
  res.json({
    success: true,
    message: "All works is done!",
    //videoCover: generateVideoCoverRes,
  });
}


const getAllMyVideos = async (req, res) => {
  console.log('getAllMyVideos', req.body.data)
  await uploadService.getMyVideos()
}

const getMyLastVideos = async (req, res) => {
  console.log('getAllMyVideos', req.body.data)
  await uploadService.getMyLastVideos()
}




const uploadFiles = async (req, res) => {
  /// request handler 
  console.log('uploadFiles ', req.body)
  const uploadData = req.body;
  const userID = req.body.userID;
  const releaseID = req.body.releaseID;

  const uploadUserDir = `${uploadDir}/${userID}`;
  const uploadedFiles = req.files

  req.io.sockets.emit("fileUploaded", {
    success: true,
    userId: userID
  });

  /// Upload Set Data
  await uploadService.setUploadData(uploadData, uploadUserDir)

  /// Convert files
  await uploadService.createVideoFile(uploadedFiles)

  req.io.sockets.emit("videoFileReady", {
    success: true,
    userId: userID
  });

  await uploadService.pushToYoutube(releaseID)
  // console.log('newUpload ', newUpload)

  console.log('uploadService.pushVideo ', uploadService.pushVideo)

  if (uploadService.pushVideo.success) {
    
    //// save
    await uploadService.saveVideoToDB()
    await uploadService.saveVideoToUser() 
    
    req.io.sockets.emit("pushToYoutube", {
      success: true,
      message: uploadService.pushVideo.message,
      url: uploadService.pushVideo.url,
      userId: userID
    });

  } else {
    req.io.sockets.emit("pushToYoutube", {
      success: false,
      message: uploadService.pushVideo.message,
      userId: userID
    });
  }

  res.json({
    success: true,
    message: "All works is done!",
    //videoCover: generateVideoCoverRes,
  });
};

const uploadFileRVBD = async (req, res) => {
  /// request handler 
  console.log('uploadFileRVBD ', req.body)
  console.log('uploadFileRVBD ', req.files)
  const uploadData = req.body;
  const userID = req.body.user;
  const uploadUserDir = `${uploadDir}/${userID}`;
  const uploadedFiles = req.files

  res.json({
    success: true,
    message: "uploadFileRVBD is done!",
    //videoCover: generateVideoCoverRes,
  });

};


/// Get Discogs  
const getDiscogs = async (req, res, next) => {

  try {
    const discogsResult = await metadataService.getDiscogs(req.body);
    console.log('discogsResult ', discogsResult)
    res.json(discogsResult);
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
  
};

const getDiscogsByReleaseID = async (req, res) => {

  try {
    const discogsResult = await metadataService.getDiscogsByReleaseID(req.body);
    console.log('discogsResult ', discogsResult)
    res.json(discogsResult);
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }

}

/// Get Subscribers 
const getAllVideos = async (req, res, next) => {
  // const token = await getToken(req.headers);
  // console.log('token ', token)
  // if (!token) {
  //   return res.status(401).json({ message: "Ошибка авторизации" });
  // }
  try {
    const videosAll = await Video.find({}).sort({ _id: -1 });
    if (!videosAll) {
      return res.status(400).json({message: `Ничего не найдено`})
    }
    return res.json({ success: true, items: videosAll });
  } catch (e) {
    console.log(e)
    res.status(400).json({ message: "Access Error" });
  }
}


module.exports = {
  getDiscogs,
  getDiscogsByReleaseID,
  uploadFiles,
  getAllMyVideos,
  startAutoUpload,
  getAllVideos,
  getMyLastVideos,
  uploadFileRVBD
};
