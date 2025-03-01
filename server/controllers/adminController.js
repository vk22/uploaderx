const AdminService = require("../services/adminService");

class AdminController {

  async getAllVideos(req, res) {
    try {
      const result = await AdminService.getAllVideos()
      return res.json(result);
    } catch (e) {
      res.status(500).json(e) 
    }
  }
  async getAllUsers(req, res) {
    try {
      const result = await AdminService.getAllUsers()
      return res.json(result);
    } catch (e) {
      res.status(500).json(e) 
    }
  }
}

module.exports = new AdminController();