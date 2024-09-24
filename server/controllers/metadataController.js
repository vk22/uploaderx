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
}

module.exports = new MetadataController();