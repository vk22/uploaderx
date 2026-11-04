const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const { requireBasicAuth } = require('../middleware/basicAuth')

router.get('/videos', requireBasicAuth, adminController.getAllVideos);
router.get('/users', requireBasicAuth, adminController.getAllUsers);


module.exports = router
