const fs = require("fs");
const { join, extname, basename } = require("path");
const path = require("path");
const axios = require("axios");
const mm = require('music-metadata');
var Discogs = require("disconnect").Client;
var db = new Discogs({
  consumerKey: "ZLPAhBKDWpYhlrbQWUUH",
  consumerSecret: "eXaccGPIbxGhODNMucbRYMEvSKzeJRhM",
}).database();
const wantlist = new Discogs({
  userToken: "jLTzotZkrkcXdTbeogLPhQdmUCnbicJBqVKaYSWC"
}).user().wantlist();
const uploadDir = process.env.ROOT_DIR + "/uploads";
const API_URL_TOOLS = 'https://tools.revibed.com/api'


class MetadataService {

  constructor() {
  }

  async readID3Tags(filepath) {
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
  async getDiscogs(data) {
    console.log('getDiscogs ', data)
    const { trackData, user, coverNeed } = data

    console.log('trackData ', trackData)
    let mainResult;
    let searchResult;
    //coverNeed = true;

    /// searchResult запрос 
    const query1 = prepareQuery(trackData)
    console.log('query1 ', query1)
    const { results } = await db.search(query1);
    console.log('results ', results)

    if (!results.length) {
      return {
        success: false,
        message: "Not results"
      };
    } else {
      searchResult = results[0];
    }

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
        const artist_data = await getArtistData(getRelease.artists);
        if (coverNeed && getRelease.images) {
          if (getRelease.images.length) {
            if (getRelease.images[0].uri) {
              const imageBinary = await db.getImage(getRelease.images[0].uri)
              const imageFromDiscogs = await downloadImage(imageBinary, `${uploadDir}/${user}/cover.jpg`)
              if (imageFromDiscogs.success) {
                cover = `/uploads/${user}/cover.jpg`
              } else {
                errors.push({
                  type: 'downloadImage error',
                  message: imageFromDiscogs.message
                })
              }
            }
          }
        }
        const artist = (artist_data.length) ? artist_data[0].name : getRelease.artists_sort
        mainResult = {
          success: true,
          data: {
            message: "File parsed by Discogs",
            release: {
              link: getRelease.uri,
              album: getRelease.title,
              artist: artistNameHandler(artist),
              artist_data: artist_data,
              // label: getRelease.label,
              year: getRelease.year,
              country: getRelease.country,
              genres: getRelease.genres,
              styles: getRelease.styles,
              discogs_release: getRelease.id,
              coverUri: getRelease.images[0].uri
            },
            cover: cover
          }
        };
        return mainResult;

      } else if (searchResult.type === "master") {

        const getMaster = await db.getMaster(searchResult.id);
        const getRelease = await db.getRelease(getMaster.main_release);
        const artist_data = getArtistData(getRelease.artists);

        if (coverNeed && getRelease.images) {
          if (getRelease.images.length) {
            if (getRelease.images[0].uri) {
              const imageBinary = await db.getImage(getRelease.images[0].uri)
              const imageFromDiscogs = await downloadImage(imageBinary, `${uploadDir}/${user}/cover.jpg`)
              if (imageFromDiscogs.success) {
                cover = `/uploads/${user}/cover.jpg`
              } else {
                errors.push({
                  type: 'downloadImage error',
                  message: imageFromDiscogs.message
                })
              }
            }
          }
        }
        mainResult = {
          success: true,
          data: {
            message: "File parsed by Discogs",
            release: {
              link: getRelease.uri,
              label: getRelease.labels,
              year: getRelease.year,
              genres: getRelease.genres,
              styles: getRelease.styles,
              country: getRelease.country,
              artist: artistNameHandler(getRelease.artists_sort),
              artist_data: artist_data,
              album: getRelease.title,
              discogs_release: getRelease.id,
              coverUri: getRelease.images[0].uri
            },
            cover: cover,

          }
        };

        return mainResult;

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

  async getDiscogsReleaseOnly(data) {
    console.log('getDiscogs ', data)
    const { trackData } = data

    console.log('trackData ', trackData)
    let mainResult;
    let searchResult;
    //coverNeed = true;

    /// searchResult запрос 
    const query1 = prepareQuery(trackData)
    console.log('query1 ', query1)
    const { results } = await db.search(query1);
    // console.log('results ', results)

    if (!results.length) {
      return {
        success: false,
        message: "Not results"
      };
    } else {
      searchResult = results[0];
    }

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
        const artist_data = await getArtistData(getRelease.artists);
        const artist = (artist_data.length) ? artist_data[0].name : getRelease.artists_sort
        mainResult = {
          id: getRelease.id,
          link: getRelease.uri,
          album: getRelease.title,
          artist: artistNameHandler(artist),
          artist_data: artist_data,
          // label: getRelease.label,
          year: getRelease.year,
          country: getRelease.country,
          genres: getRelease.genres,
          styles: getRelease.styles,
          coverUri: getRelease.images[0].uri
        };

        return {
          success: true,
          data: mainResult
        };

      } else if (searchResult.type === "master") {

        const getMaster = await db.getMaster(searchResult.id);
        const getRelease = await db.getRelease(getMaster.main_release);
        const artist_data = getArtistData(getRelease.artists);

        mainResult = {
          id: getRelease.id,
          link: getRelease.uri,
          label: getRelease.labels,
          year: getRelease.year,
          genres: getRelease.genres,
          styles: getRelease.styles,
          country: getRelease.country,
          artist: artistNameHandler(getRelease.artists_sort),
          artist_data: artist_data,
          album: getRelease.title,
          coverUri: getRelease.images[0].uri
        }

        return {
          success: true,
          data: mainResult
        };

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

  async getDiscogsByReleaseID(data) {

    const { releaseID, user } = data;
    let errors = [];
    let release = {};
    let cover = undefined;

    try {
      const getRelease = await db.getRelease(releaseID);
      console.log('getRelease ', getRelease.title)
      release = {
        link: getRelease.uri,
        label: getRelease.labels,
        year: getRelease.year,
        genres: getRelease.genres,
        styles: getRelease.styles,
        country: getRelease.country,
        artist: artistNameHandler(getRelease.artists_sort),
        album: getRelease.title,
        discogs_release: getRelease.id,
        coverUri: getRelease.images[0].uri
      }
    } catch (error) {
      console.log('getRelease error ', error.message)
      errors.push({
        type: 'getRelease error',
        message: error.message
      })
    }

    if (release.coverUri) {
      const imageBinary = await db.getImage(release.coverUri)
      const imageFromDiscogs = await downloadImage(imageBinary, `${uploadDir}/${user}/cover.jpg`)
      if (imageFromDiscogs.success) {
        cover = `/uploads/${user}/cover.jpg`
      } else {
        errors.push({
          type: 'downloadImage error',
          message: imageFromDiscogs.message
        })
      }
    }

    const result = {
      success: true,
      data: {
        release: release,
        cover: cover,
        errors: errors
      }
    };
    return result;
  }

  async checkReleaseInRevibedTools(releaseID) {
    const { data } = await axios.post(
      `${API_URL_TOOLS}/check-release`,
      { releaseID: releaseID },
      {
        headers: {
          'x-api-key': 'l74b9ba9qmext9a6ulniigq8'
        }
      }
    )
    const result = data.result;
    const labelsWarningsArr = Object.values(data.data);
    const labelsWarnings = labelsWarningsArr.some(
      (item) => item === 'warning' || item === 'blocked'
    )
    return {
      result,
      labelsWarnings
    }
  }
  async getWanlist(username) {
    try {
      const data = await wantlist.getReleases(username);
      return data;
    } catch (err) {
      console.log("error getWanlist", err);
      return false
    }
  }

  async addWanlist(username, releaseID) {
    try {
      console.log('releaseID: ', releaseID)
      const data = await wantlist.addRelease(username, releaseID);
      return data;
    } catch (err) {
      console.log("error addWanlist", err);
      return false
    }
  }

  async removeWanlist(username, releaseID) {
    try {
      console.log('releaseID ', releaseID)
      const data = await wantlist.removeRelease(username, releaseID);
      return data;
    } catch (err) {
      console.log("error removeWanlist", err);
      return false
    }
  }

}



//// utils

function prepareQuery(trackData) {
  let arr = []
  for (let key in trackData) {
    arr = arr.concat(trackData[key])
  }
  const queryAsString = arr.join('+');
  return queryAsString;
}

function downloadImage(data, path) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, 'binary', (err) => {
      if (err) throw err;
      console.log('Image downloaded successfully!');
      resolve({
        success: true,
        message: 'Image downloaded successfully!'
      })
    });
  })
}

async function getArtistData(artists) {
  const artist_data = []
  for (const artist of artists) {
    try {
      const getArtist = await db.getArtist(artist.id);
      if (getArtist.members) {
        getArtist.members.map((member) => artist_data.push(member));
      } else {
        artist_data.push({
          name: getArtist.name,
          id: getArtist.id,
        });
      }
    } catch (err) {
      //console.log("getArtist err ", err);
    }
  }
  return artist_data
}

function artistNameHandler(str) {
  function isNumber(n) {
    return Number(n) === n;
  }
  let result;
  let afterName = str.substring(str.indexOf("(") + 1, str.lastIndexOf(")"));
  if (afterName && isNumber(+afterName)) {
    result = str.substring(0, str.indexOf("(") - 1);
  } else {
    result = str;
  }
  return result;
}



module.exports = new MetadataService();