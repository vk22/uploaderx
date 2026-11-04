const fs = require("fs");
const path = require("path");
const mm = require('music-metadata');
const { sanitizeUserId } = require('../utils/sanitizeUserId');
const discogsClient = require('../clients/discogsClient');
const revibedClient = require('../clients/revibedClient');

const rootDir = process.env.ROOT_DIR || path.join(__dirname, "../..");
const uploadDir = path.join(rootDir, "uploads");
const defaultCoverPath = path.join(rootDir, "cover.jpg");

class MetadataService {

  async readID3Tags(filepath) {
    let metadata, finalData, title
    try {
      const parseFileData = await mm.parseFile(filepath);
      if (parseFileData) {
        metadata = {
          picture: (parseFileData.common.picture) ? parseFileData.common.picture[0] : undefined,
          title: parseFileData.common.title,
          artist: parseFileData.common.artist,
          album: parseFileData.common.album,
          year: parseFileData.common.year
        }
        const discogsData = await this.getDiscogs(metadata);
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
    const { trackData, user, coverNeed } = data

    let mainResult;
    let searchResult;
    let cover = undefined;
    let errors = [];

    const query1 = prepareQuery(trackData)
    const { results } = await discogsClient.search(query1);

    if (!results.length) {
      return {
        success: false,
        message: "Not results"
      };
    } else {
      searchResult = results[0];
    }

    if (searchResult.type === "release") {
      let getMaster, getRelease;
      /// If Release Has Master
      if (searchResult.master_id) {
        getMaster = await discogsClient.getMaster(searchResult.master_id);
        getRelease = await discogsClient.getRelease(getMaster.main_release);
      } else {
        getRelease = await discogsClient.getRelease(searchResult.id);
      }
      const artist_data = await discogsClient.getArtistsData(getRelease.artists);
      const coverUri = getReleaseCoverUri(getRelease);
      if (coverNeed) {
        cover = await saveCoverFromDiscogsOrDefault(coverUri, user, errors);
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
            year: getRelease.year,
            country: getRelease.country,
            genres: getRelease.genres,
            styles: getRelease.styles,
            discogs_release: getRelease.id,
            coverUri: coverUri
          },
          cover: cover,
          errors: errors
        }
      };
      return mainResult;

    } else if (searchResult.type === "master") {

      const getMaster = await discogsClient.getMaster(searchResult.id);
      const getRelease = await discogsClient.getRelease(getMaster.main_release);
      const artist_data = await discogsClient.getArtistsData(getRelease.artists);

      const coverUri = getReleaseCoverUri(getRelease);
      if (coverNeed) {
        cover = await saveCoverFromDiscogsOrDefault(coverUri, user, errors);
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
            coverUri: coverUri
          },
          cover: cover,
          errors: errors,
        }
      };

      return mainResult;

    } else {
      return {
        success: false,
        message: "Error with discogs parsing",
      };
    }
  };

  async getDiscogsReleaseOnly(data) {
    const { trackData } = data

    let mainResult;
    let searchResult;

    const query1 = prepareQuery(trackData)
    const { results } = await discogsClient.search(query1);

    if (!results.length) {
      return {
        success: false,
        message: "Not results"
      };
    } else {
      searchResult = results[0];
    }

    if (searchResult.type === "release") {
      let getMaster, getRelease;
      /// If Release Has Master
      if (searchResult.master_id) {
        getMaster = await discogsClient.getMaster(searchResult.master_id);
        getRelease = await discogsClient.getRelease(getMaster.main_release);
      } else {
        getRelease = await discogsClient.getRelease(searchResult.id);
      }
      const artist_data = await discogsClient.getArtistsData(getRelease.artists);
      const artist = (artist_data.length) ? artist_data[0].name : getRelease.artists_sort
      const coverUri = getReleaseCoverUri(getRelease);
      mainResult = {
        id: getRelease.id,
        link: getRelease.uri,
        album: getRelease.title,
        artist: artistNameHandler(artist),
        artist_data: artist_data,
        year: getRelease.year,
        country: getRelease.country,
        genres: getRelease.genres,
        styles: getRelease.styles,
        coverUri: coverUri
      };

      return {
        success: true,
        data: mainResult
      };

    } else if (searchResult.type === "master") {

      const getMaster = await discogsClient.getMaster(searchResult.id);
      const getRelease = await discogsClient.getRelease(getMaster.main_release);
      const artist_data = await discogsClient.getArtistsData(getRelease.artists);
      const coverUri = getReleaseCoverUri(getRelease);

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
        coverUri: coverUri
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
  };

  async getDiscogsByReleaseID(data) {
    const { releaseID, user } = data;
    let errors = [];
    let release = {};
    let cover = undefined;

    try {
      const getRelease = await discogsClient.getRelease(releaseID);
      const coverUri = getReleaseCoverUri(getRelease);
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
        coverUri: coverUri
      }
    } catch (error) {
      console.log('getRelease error ', error.message)
      errors.push({
        type: 'getRelease error',
        message: error.message
      })
    }

    cover = await saveCoverFromDiscogsOrDefault(release.coverUri, user, errors);

    return {
      success: true,
      data: {
        release: release,
        cover: cover,
        errors: errors
      }
    };
  }

  async checkReleaseInRevibedTools(releaseID) {
    const data = await revibedClient.checkRelease(releaseID);
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
      return await discogsClient.getWantlist(username);
    } catch (err) {
      console.log("error getWanlist", err);
      return false
    }
  }

  async addWanlist(username, releaseID) {
    try {
      return await discogsClient.addToWantlist(username, releaseID);
    } catch (err) {
      console.log("error addWanlist", err);
      return false
    }
  }

  async removeWanlist(username, releaseID) {
    try {
      return await discogsClient.removeFromWantlist(username, releaseID);
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
  return arr.join('+');
}

function downloadImage(data, filePath) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, 'binary', (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({
        success: true,
        message: 'Image downloaded successfully!'
      })
    });
  })
}

function getReleaseCoverUri(release) {
  if (!release || !Array.isArray(release.images) || !release.images.length) {
    return undefined;
  }
  return release.images[0] && release.images[0].uri ? release.images[0].uri : undefined;
}

async function saveCoverFromDiscogsOrDefault(coverUri, user, errors) {
  if (coverUri) {
    try {
      const imageBinary = await discogsClient.getImage(coverUri);
      const imageFromDiscogs = await downloadImage(imageBinary, getUserCoverPath(user));
      if (imageFromDiscogs.success) {
        return `/uploads/${user}/cover.jpg`;
      }
      errors.push({
        type: 'downloadImage error',
        message: imageFromDiscogs.message
      });
    } catch (error) {
      errors.push({
        type: 'downloadImage error',
        message: error.message
      });
    }
  } else {
    errors.push({
      type: 'discogs cover missing',
      message: 'Discogs release has no cover image'
    });
  }

  return copyDefaultCover(user, errors);
}

function copyDefaultCover(user, errors) {
  try {
    const coverPath = getUserCoverPath(user);
    fs.copyFileSync(defaultCoverPath, coverPath);
    return `/uploads/${sanitizeUserId(user)}/cover.jpg`;
  } catch (error) {
    errors.push({
      type: 'default cover error',
      message: error.message
    });
    return undefined;
  }
}

function getUserCoverPath(user) {
  const safeUser = sanitizeUserId(user);
  const userUploadDir = `${uploadDir}/${safeUser}`;
  fs.mkdirSync(userUploadDir, { recursive: true });
  return `${userUploadDir}/cover.jpg`;
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
