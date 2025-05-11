const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.post('/get-token', userController.getToken)
router.post('/refresh-token', userController.refreshToken)
router.post('/checkuser/', userController.checkUser)
router.get('/check-user-tokens/', userController.getUserTokens)
router.get('/get-my-videos/', userController.getMyVideos)


module.exports = router
