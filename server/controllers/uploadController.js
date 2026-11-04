const { sanitizeUserId } = require('../utils/sanitizeUserId')
const uploadStorage = require('../storage/uploadStorage')
const UploadService = require("../services/uploadService");
const metadataService = require("../services/metadataService");
const Video = require("../models/video-model");

const sleep = ms => new Promise(r => setTimeout(r, ms))

const startAutoUpload = async (req, res) => {
  console.log('startAutoUpload ', req.body)
  const uploadData = req.body.data
  let userID
  try {
    userID = sanitizeUserId(uploadData.userID)
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
  const audioDir = uploadStorage.getAutoAudioDir()
  const visualDir = uploadStorage.getAutoVisualDir()
  const files = uploadStorage.listFiles(audioDir)
  const uploadUserDir = uploadStorage.getUserUploadDir(userID);
  const uploadService = new UploadService()
  await uploadService.setUploadData(uploadData, uploadUserDir)

  for (const file of files) {
    if (file !== '.DS_Store') {
      let filePath = `${audioDir}/${file}`
      const metadata = await metadataService.readID3Tags(filePath)
      let releaseID = file.split('--')[0]
      if (metadata) {
        const pictureData = metadata.picture.data
        const visualCoverPath = `${visualDir}/cover.jpg`
        /// create cover file
        uploadStorage.writeFile(visualCoverPath, pictureData)
        /// cover move
        uploadStorage.copyFile(visualCoverPath, `${uploadUserDir}/cover.jpg`)
        uploadStorage.removeFile(visualCoverPath);
        /// audio move
        uploadStorage.copyFile(filePath, `${uploadUserDir}/audio.mp3`)
        uploadStorage.removeFile(filePath);
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
  const releaseID = req.body.releaseID;

  let userID
  try {
    userID = sanitizeUserId(req.body.userID)
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }

  const uploadUserDir = uploadStorage.getUserUploadDir(userID);
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
      video: pushVideo.video,
      youtube: pushVideo.youtube,
      integrations: pushVideo.integrations,
      warnings: pushVideo.warnings,
      userId: userID
    });

  } else {
    req.io.sockets.emit("pushToYoutube", {
      success: false,
      message: pushVideo.message,
      youtube: pushVideo.youtube,
      integrations: pushVideo.integrations,
      errors: pushVideo.errors,
      warnings: pushVideo.warnings,
      userId: userID
    });
  }

  res.json({
    success: pushVideo.success,
    message: pushVideo.message,
    url: pushVideo.url,
    video: pushVideo.video,
    youtube: pushVideo.youtube,
    integrations: pushVideo.integrations,
    errors: pushVideo.errors,
    warnings: pushVideo.warnings,
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
    let userID
    try {
      userID = sanitizeUserId(req.body.userID || req.body.user);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const releaseID = uploadedFile.originalname.split('--')[0]
    if (!releaseID) {
      return res.status(400).json({
        success: false,
        message: "releaseID is required in file name",
      });
    }

    const uploadUserDir = uploadStorage.getUserUploadDir(userID);

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

    uploadStorage.moveFile(uploadedFile.path, `${uploadUserDir}/audio.mp3`, { overwrite: true });

    if (!uploadStorage.fileExists(`${uploadUserDir}/cover.jpg`)) {
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

    return res.status(pushVideo.success ? 200 : getPushToYoutubeHttpStatus(pushVideo)).json({
      success: pushVideo.success,
      message: pushVideo.message,
      url: pushVideo.url,
      video: pushVideo.video,
      youtube: pushVideo.youtube,
      integrations: pushVideo.integrations,
      errors: pushVideo.errors,
      warnings: pushVideo.warnings,
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

function getPushToYoutubeHttpStatus(pushVideo) {
  const status = pushVideo.errors && pushVideo.errors[0] && pushVideo.errors[0].status;
  if (status === "validation_failed") {
    return 400;
  }
  if (status === "auth_failed") {
    return 401;
  }
  if (status === "configuration_failed") {
    return 500;
  }
  if (status === "youtube_upload_failed") {
    return 502;
  }
  return 500;
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
