const MetaDataService = require("../services/metadataService");

class MetadataController {

  async getFromFile(req, res) {
    const filePath = req.body.filePath
    try {
      const metadata = await MetaDataService.readID3Tags(filePath)
      return res.json(metadata);
    } catch (e) {
      res.status(500).json(e)
    }
  }

  async getWanlist(req, res) {

    try {
      const username = req.query.username;
      const data = await MetaDataService.getWanlist(username)
      res.json(data)
    } catch (e) {
      console.log('getWanlist errr', e)
      res.status(500).json(e.message)
    }

  }
  async addWanlist(req, res) {

    try {
      const username = req.body.username;
      const releaseID = req.body.releaseID;
      const data = await MetaDataService.addWanlist(username, releaseID)
      res.json(data)
    } catch (e) {
      console.log('addWanlist errr', e)
      res.status(500).json(e.message)
    }

  }
  async removeWanlist(req, res) {

    try {
      const username = req.body.username;
      const releaseID = req.body.releaseID;
      const data = await MetaDataService.removeWanlist(username, releaseID)
      res.json(data)
    } catch (e) {
      console.log('removeWanlist errr', e)
      res.status(500).json(e.message)
    }

  }

}

module.exports = new MetadataController();