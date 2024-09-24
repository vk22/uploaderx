const fs = require("fs");
const { join, extname, basename } = require("path");
const path = require("path")
const mm = require('music-metadata');
var Discogs = require("disconnect").Client;
var db = new Discogs({
  consumerKey: "ZLPAhBKDWpYhlrbQWUUH",
  consumerSecret: "eXaccGPIbxGhODNMucbRYMEvSKzeJRhM",
}).database();

class MetadataService {
  
  constructor() {
  }

  async readID3Tags (filepath){
    let metadata, finalData, title
    console.log('readID3Tags ', filepath)
    try {
      const parseFileData = await mm.parseFile(filepath);
    //   console.log('metadata.common ', parseFileData.common)
      if (parseFileData) {
        metadata = {
            picture: (parseFileData.common.picture) ? parseFileData.common.picture[0] : undefined,
            title: parseFileData.common.title,
            artist: parseFileData.common.artist,
            album: parseFileData.common.album,
            year: parseFileData.common.year
        }
        const discogsData = await this.getDiscogs(metadata);
        // console.log('discogsData ', discogsData)
        metadata.country = discogsData.country

        if (metadata.year && metadata.country) {
            title = `${metadata.artist} - ${metadata.title} (${metadata.country}, ${metadata.year})`
        } else if (!metadata.year && metadata.country) {
            title = `${metadata.artist} - ${metadata.title} (${metadata.country})`
        } else if (metadata.year && !metadata.country) {
            title = `${metadata.artist} - ${metadata.title} (${metadata.year})`
        } else if (!metadata.year && !metadata.country) {
            title = `${metadata.artist} - ${metadata.title}`
        }

        finalData = {
            picture: metadata.picture,
            title: title
        }

      } else {
        finalData = ''
      }
    } catch (error) {
        console.log('readID3Tags error ', error)
        finalData = ''
    }
    return finalData
}

/// Get Discogs  
async getDiscogs (data) {
    // console.log('getDiscogs ', data)
    const { title, artist, album } = data

    let mainResult;
    let searchResult;
    let cover;
    
    /// searchResult запрос 
    const query1 = `${title}+${artist}+${album}`
    const response = await db.search(query1);

    if (!response.results.length) {
      const query2 = `${artist}+${album}`
      const response2 = await db.search(query2);
      if (!response2.results.length) {
        const query3 = `${title}+${artist}`;
        const response3 = await db.search(query3);
        searchResultl = response3.results;
      } else {
        searchResult = response2.results;
      }
    } else {
      searchResult = response.results;
    }
    // console.log('searchResult ', searchResult)
    if (!searchResult) {
      return false;
    }
    searchResult = searchResult[0];
    // console.log('searchResult ', searchResult)
  
    if (searchResult !== undefined) {
  
      if (searchResult.type === "release") {
        
        let getMaster, getRelease;
  
        /// If Release Has Master
        if (searchResult.master_id) {
          getMaster = await db.getMaster(searchResult.master_id);
          getRelease = await db.getRelease(getMaster.main_release);
        } else {
          getRelease = await db.getRelease(searchResult.id);
        }
        
          mainResult = {
            link: getRelease.uri,
            album: getRelease.title,
            year: getRelease.year,
            country: getRelease.country,
            genres: getRelease.genres,
            styles: getRelease.styles,
            discogs_release: getRelease.id,
            coverUri: (getRelease.images) ? getRelease.images[0].uri : undefined
          };

          return mainResult
  
      } else if (searchResult.type === "master") {
  
        const getMaster = await db.getMaster(searchResult.id);
        const getRelease = await db.getRelease(getMaster.main_release);

  
        mainResult = {
            link: getRelease.uri,
            label: getRelease.labels,
            year: getRelease.year,
            genres: getRelease.genres,
            styles: getRelease.styles,
            country: getRelease.country,
            album: getRelease.title,
            discogs_release: getRelease.id,
            coverUri: (getRelease.images) ? getRelease.images[0].uri : undefined
        };
  
        return mainResult
    
      } else {
        return {
          success: false,
          message: "Error with discogs parsing",
        };
      }
    } else {
      return {
        success: false,
        message: "Error with discogs parsing",
      };
    }
  
  };
}



module.exports = new MetadataService();