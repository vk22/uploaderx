const Video = require("../models/video-model");
const User = require("../models/user-model");

class AdminService {
    constructor() {
    }
    async getAllVideos () {
        try {
          const videosAll = await Video.find({}).sort({ _id: -1 });
          if (!videosAll) {
            return res.status(400).json({message: `No results`})
          }
          return { success: true, videos: videosAll };
        } catch (e) {
          console.log(e)
          return { message: "Access Error" };
        }
      }

    async getAllUsers() {

        try {
            const usersAll = await User.find({}).sort({ _id: -1 });
            if (!usersAll) {
              return res.status(400).json({message: `No results`})
            }
            return { success: true, users: usersAll };
          } catch (e) {
            console.log(e)
            return { message: "Access Error" };
          }


    }
}

module.exports = new AdminService();