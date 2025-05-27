const express = require('express')
const router = express.Router()
const multer = require('multer')
const uploadController = require('../controllers/uploadController')
const metadataController = require("../controllers/metadataController");
const rootDir = process.env.ROOT_DIR;
const uploadDir =  rootDir + "/uploads";
const uploadDirRVBD =  rootDir + "/uploads/auto/audio";
const storageFiles = multer.diskStorage({
  destination: function (req, file, cb) {
    const userID = req.query.user
    cb(null, uploadDir + '/' + userID)
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split('.').pop();
    const customname = (extension === 'jpg' || extension === 'jpeg' || extension === 'png') ? `cover.${extension}` : `audio.${extension}`
    cb(null, customname)
  
  }
})
const uploadFiles = multer({ storage: storageFiles }).any()

const storageRVBD = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('destination ', file)
    cb(null, uploadDirRVBD)
  },
  filename: function (req, file, cb) {
    console.log('filename ', file)
    cb(null, file.originalname)
  }
})
const uploadRVBD = multer({ storage: storageRVBD }).any()

/// Get Discogs
router.post('/getdiscogs', uploadController.getDiscogs)
router.post('/getdiscogs2', uploadController.getDiscogsByReleaseID)


/// Cover Upload 
router.post('/upload-file', uploadFiles, uploadController.uploadFiles)

/// File Upload 
router.post('/videos-list', uploadController.getAllMyVideos)
router.post('/videos-last', uploadController.getMyLastVideos)


/// File Upload 
router.post('/start-auto-upload', uploadController.startAutoUpload)

/// File Upload 
router.get('/get-video-list', uploadController.getAllVideos)

/// Cover Upload 
router.post('/upload-file-rvbd', uploadRVBD, uploadController.uploadFileRVBD)

/// Cover Upload 
router.post('/get-metadata', metadataController.getFromFile)


module.exports = router
