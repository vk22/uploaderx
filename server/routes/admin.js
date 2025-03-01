const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')

router.get('/videos', adminController.getAllVideos);
router.get('/users', adminController.getAllUsers);


module.exports = router
