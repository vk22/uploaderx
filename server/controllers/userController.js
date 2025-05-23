const userService = require('../services/userService');
const uploadService = require("../services/uploadService");

class UserController {

  async login(req, res, next) {
    try {
      const { user } = req.body;
      const userData = await userService.login(user);
      // res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async logout(req, res, next) {
    try {
      console.log('logout ', req.body)
      const { id } = req.body;
      const data = await userService.logout(id);
      return res.json(data);
    } catch (e) {
      next(e);
    }
  }

  async getToken(req, res, next) {
    try {
      const code = req.body.code;
      const user = await userService.getToken(code);
      return res.json(user);

    } catch (e) {
      console.log("getToken ", e);
      next(e);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const token = req.body.token;
      const refreshToken = await userService.refreshToken(token);
      return res.json(refreshToken);

    } catch (e) {
      console.log("refreshToken ", e);
      next(e);
    }
  }

  async getUserTokens(req, res, next) {
    try {
      console.log('getUserTokens ', req.query)
      const userID = req.query.userID;
      const tokens = await userService.getUserTokens(userID);
      return res.json(tokens);

    } catch (e) {
      console.log("getUserTokens ", e);
      next(e);
    }
  }

  async getVideosFromPlaylist(req, res, next) {
    try {
      console.log('req.query ', req.query)
      const playlistID = req.query.playlistID;
      const userID = req.query.userID;
      const separator = req.query.separator
      const data = await uploadService.getVideosFromPlaylist(userID, playlistID, separator);
      return res.json(data);

    } catch (e) {
      console.log("getMyVideos error ", e);
      next(e);
    }
  }

  async getVideosFromChannel(req, res, next) {
    try {
      console.log('req.query ', req.query)
      const playlistID = req.query.playlistID;
      const userID = req.query.userID;
      const data = await uploadService.getVideosFromChannel(userID, playlistID);
      return res.json(data);

    } catch (e) {
      console.log("getMyVideos error ", e);
      next(e);
    }
  }


  
  

  checkUser(req, res) {
    
  }

}

module.exports = new UserController()
