const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const metadataController = require("../controllers/metadataController");

router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.post('/get-token', userController.getToken)
router.post('/refresh-token', userController.refreshToken)
router.post('/checkuser/', userController.checkUser)
router.get('/check-user-tokens/', userController.getUserTokens)
router.get('/get-playlist-videos/', userController.getVideosFromPlaylist)
router.get('/get-channel-videos/', userController.getVideosFromChannel)

router.get('/get-wantlist/', metadataController.getWanlist)
router.post('/add-wantlist/', metadataController.addWanlist)
router.post('/remove-wantlist/', metadataController.removeWanlist)


module.exports = router
