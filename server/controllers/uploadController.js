const fs = require('fs-extra')
const { google } = require("googleapis");
const service = google.youtube("v3");
const OAuth2 = google.auth.OAuth2;
const rootDir = process.env.ROOT_DIR;
const uploadDir =  rootDir + "/uploads";
const autoUploadDir =  rootDir + "/uploads/auto";
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
const UploadService = require("../services/uploadService");
const metadataService = require("../services/metadataService");
const Video = require("../models/video-model");

const sleep = ms => new Promise(r => setTimeout(r, ms))

const startAutoUpload = async (req, res) => {
  console.log('startAutoUpload ', req.body)
  const uploadData = req.body.data
  const userID = uploadData.userID
  const files = fs.readdirSync(`${autoUploadDir}/audio`)
  const uploadUserDir = `${uploadDir}/${userID}`; 
  const uploadService = new UploadService()
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
  const uploadService = new UploadService()
  await uploadService.getMyVideos()
}

const getMyLastVideos = async (req, res) => {
  console.log('getAllMyVideos', req.body.data)
  const uploadService = new UploadService()
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
  const uploadService = new UploadService()

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

  const pushVideo = await uploadService.pushToYoutube(releaseID)
  // console.log('newUpload ', newUpload)

  console.log('pushVideo ', pushVideo)

  if (pushVideo.success) {
    
    //// save
    await uploadService.saveVideoToDB()
    await uploadService.saveVideoToUser() 
    
    req.io.sockets.emit("pushToYoutube", {
      success: true,
      message: pushVideo.message,
      url: pushVideo.url,
      userId: userID
    });

  } else {
    req.io.sockets.emit("pushToYoutube", {
      success: false,
      message: pushVideo.message,
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
  try {
    console.log('uploadFileRVBD ', req.body)
    console.log('uploadFileRVBD ', req.files)

    const uploadedFile = req.files && req.files[0]
    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required",
      });
    }

    const uploadData = req.body;
    const userID = req.body.userID || req.body.user;
    if (!userID) {
      return res.status(400).json({
        success: false,
        message: "userID is required",
      });
    }

    const releaseID = uploadedFile.originalname.split('--')[0]
    if (!releaseID) {
      return res.status(400).json({
        success: false,
        message: "releaseID is required in file name",
      });
    }

    const uploadUserDir = `${uploadDir}/${userID}`;
    fs.ensureDirSync(uploadUserDir);

    const discogsResult = await metadataService.getDiscogsByReleaseID({
      releaseID,
      user: userID
    });

    if (
      !discogsResult.success ||
      !discogsResult.data ||
      !discogsResult.data.release ||
      !discogsResult.data.release.discogs_release
    ) {
      return res.status(400).json({
        success: false,
        message: "Discogs release was not found",
        discogs: discogsResult,
      });
    }

    const release = discogsResult.data.release;
    const title = uploadData.title || buildReleaseTitle(release);
    const description = uploadData.description || buildReleaseDescription(release);
    const audioCountryYear = buildCountryYear(release);
    const uploadService = new UploadService()

    fs.moveSync(uploadedFile.path, `${uploadUserDir}/audio.mp3`, { overwrite: true });

    if (!fs.existsSync(`${uploadUserDir}/cover.jpg`)) {
      return res.status(400).json({
        success: false,
        message: "Discogs cover was not downloaded",
        discogs: discogsResult,
      });
    }

    req.io.sockets.emit("fileUploaded", {
      success: true,
      userId: userID
    });

    await uploadService.setUploadData({
      ...uploadData,
      userID,
      title,
      description,
      privacyStatus: uploadData.privacyStatus || 'unlisted',
      uploadTemplate: uploadData.uploadTemplate || '2',
      audioTitle: release.album,
      audioArtist: release.artist,
      audioCountryYear,
    }, uploadUserDir)

    await uploadService.uploadFilesAuto({ title })

    req.io.sockets.emit("videoFileReady", {
      success: true,
      userId: userID
    });

    const pushVideo = await uploadService.pushToYoutube(releaseID)
    if (pushVideo.success) {
      await uploadService.saveVideoToDB()
      await uploadService.saveVideoToUser()
    }

    // req.io.sockets.emit("pushToYoutube", {
    //   success: pushVideo.success,
    //   message: pushVideo.message,
    //   url: pushVideo.url,
    //   userId: userID
    // });

    return res.json({
      success: pushVideo.success,
      message: pushVideo.message,
      url: pushVideo.url,
      releaseID,
      discogs: discogsResult.data,
    });
  } catch (error) {
    console.log('uploadFileRVBD error ', error)
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

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

function buildReleaseTitle(release) {
  const artist = release.artist || '';
  const album = release.album || '';
  const countryYear = buildCountryYear(release);
  const baseTitle = [artist, album].filter(Boolean).join(' - ');
  if (!baseTitle) {
    return countryYear;
  }
  return countryYear ? `${baseTitle} ${countryYear}` : baseTitle;
}

function buildCountryYear(release) {
  if (release.country && release.year) {
    return `(${release.country}, ${release.year})`;
  }
  if (release.country) {
    return `(${release.country})`;
  }
  if (release.year) {
    return `(${release.year})`;
  }
  return '';
}

function buildReleaseDescription(release) {
  const lines = [];
  if (release.album) {
    lines.push(`Album: ${release.album}`);
  }
  if (release.link) {
    lines.push(`Discogs: ${release.link}`);
  }
  return lines.join('\n');
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
