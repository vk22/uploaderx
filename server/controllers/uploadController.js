const fs = require('fs-extra')
const { google } = require("googleapis");
const service = google.youtube("v3");
const OAuth2 = google.auth.OAuth2;
const config = require("../config/config");
const uploadDir =  config.rootDir + "/uploads";
const autoUploadDir = config.autoUploadDir
const scopes = ["https://www.googleapis.com/auth/youtube"];
var Discogs = require("disconnect").Client;
var db = new Discogs({
  consumerKey: "ZLPAhBKDWpYhlrbQWUUH",
  consumerSecret: "eXaccGPIbxGhODNMucbRYMEvSKzeJRhM",
}).database();
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const kxTitle = uploadDir + "/kx-title.png";
// const UploadItem = require('./uploadItem.js');
const uploadService = require("../services/uploadService");
const metadataService = require("../services/metadataService");
const Video = require("../models/video-model");

const sleep = ms => new Promise(r => setTimeout(r, ms))

const startAutoUpload = async (req, res) => {
  const uploadData = req.body.data
  const userID = uploadData.userID
  const files = fs.readdirSync(`${autoUploadDir}/audio`)
  const uploadUserDir = `${uploadDir}/${userID}`; 
  // const newUpload = new UploadItem(uploadData, uploadUserDir)
  await uploadService.setUploadData(uploadData, uploadUserDir)


  for (file of files) {
    if (file !== '.DS_Store') {
      let filePath = `${autoUploadDir}/audio/${file}`
      const metadata = await metadataService.readID3Tags(filePath)
      let releaseID = file.split('--')[0]
      // const pictureData = `data:${metadata.picture.format};base64,${metadata.picture.data.toString('base64')}`
      if (metadata) {
        const pictureData = metadata.picture.data
        /// create cover file
        fs.writeFileSync(`${autoUploadDir}/visual/cover.jpg`, pictureData)
        /// cover move
        fs.copySync(`${autoUploadDir}/visual/cover.jpg`, `${uploadUserDir}/cover.jpg`)
        fs.unlinkSync(`${autoUploadDir}/visual/cover.jpg`);
        /// audio move
        fs.copySync(filePath, `${uploadUserDir}/audio.mp3`)
        fs.unlinkSync(filePath);
      }
      const fileData = {
        title: metadata.title
      }
      //await newUpload.uploadFilesAuto(fileData)
      await uploadService.uploadFilesAuto(fileData)
      await sleep(1000)
      // await newUpload.pushToYoutube(releaseID)
      await uploadService.pushToYoutube(releaseID)
      console.log('pushToYoutube Done!')
      await sleep(20000)
    }
  }
  console.log('All works is done!')
  res.json({
    success: true,
    message: "All works is done!",
    //videoCover: generateVideoCoverRes,
  });
}


const getAllMyVideos = async (req, res) => {
  console.log('getAllMyVideos', req.body.data)
  await uploadService.getMyVideos()
}

const getMyLastVideos = async (req, res) => {
  console.log('getAllMyVideos', req.body.data)
  await uploadService.getMyLastVideos()
}




const uploadFiles = async (req, res) => {
  /// request handler 
  console.log('uploadFiles ', req.body)
  const uploadData = req.body;
  const userID = req.body.userID;
  const uploadUserDir = `${uploadDir}/${userID}`;
  const uploadedFiles = req.files

  req.io.sockets.emit("fileUploaded", {
    success: true,
    userId: userID
  });

  /// Upload Set Data
  await uploadService.setUploadData(uploadData, uploadUserDir)

  /// Convert files
  await uploadService.createVideoFile(uploadedFiles)

  req.io.sockets.emit("videoFileReady", {
    success: true,
    userId: userID
  });

  await uploadService.pushToYoutube()
  // console.log('newUpload ', newUpload)

  console.log('uploadService.pushVideo ', uploadService.pushVideo)

  if (uploadService.pushVideo.success) {
    
    //// save
    await uploadService.saveVideoToDB()
    await uploadService.saveVideoToUser() 
    
    req.io.sockets.emit("pushToYoutube", {
      success: true,
      message: uploadService.pushVideo.message,
      url: uploadService.pushVideo.url,
      userId: userID
    });

  } else {
    req.io.sockets.emit("pushToYoutube", {
      success: false,
      message: uploadService.pushVideo.message,
      userId: userID
    });
  }

  res.json({
    success: true,
    message: "All works is done!",
    //videoCover: generateVideoCoverRes,
  });
};

const uploadFileRVBD = async (req, res) => {
  /// request handler 
  console.log('uploadFileRVBD ', req.body)
  console.log('uploadFileRVBD ', req.files)
  const uploadData = req.body;
  const userID = req.body.user;
  const uploadUserDir = `${uploadDir}/${userID}`;
  const uploadedFiles = req.files

  res.json({
    success: true,
    message: "uploadFileRVBD is done!",
    //videoCover: generateVideoCoverRes,
  });

};


/// Get Discogs  
const getDiscogs = async (req, res, next) => {

  console.log('getDiscogs ', req.body)
  const album = req.body.data.album;
  const artist = req.body.data.artist;
  const title = req.body.data.title;
  const coverNeed = req.body.сoverNeed;
  const userID = req.body.user;

  console.log('coverNeed ', coverNeed)
  console.log('req.body.сoverNeed ', req.body.сoverNeed)

  let mainResult;
  let searchResult;
  let cover;
  
  /// searchResult запрос 
  const query1 = artist.concat(album).concat(title).join("+");
  const response = await db.search(query1);

  if (!response.results.length) {
    const query2 = artist.concat(album).join("+");
    const response2 = await db.search(query2);
    if (!response2.results.length) {
      const query3 = artist.concat(title).join("+");
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
    sendDiscogsRes({
      success: false,
      message: "Not results"
    });
    return;
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
      
      const artist_data = await getArtistData(getRelease.artists);

        if (coverNeed && getRelease.images) {
          if (getRelease.images.length) {
            if (getRelease.images[0].uri) {
              const imageBinary = await db.getImage(getRelease.images[0].uri)
              const imageFromDiscogs = await downloadImage(imageBinary, `${uploadDir}/${userID}/cover.jpg`)
              if (imageFromDiscogs.success) {
                cover = `/uploads/${userID}/cover.jpg`
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
        sendDiscogsRes(mainResult);

    } else if (searchResult.type === "master") {

      const getMaster = await db.getMaster(searchResult.id);
      const getRelease = await db.getRelease(getMaster.main_release);
      const artist_data = getArtistData(getRelease.artists);

      if (coverNeed && getRelease.images) {
        if (getRelease.images.length) {
          if (getRelease.images[0].uri) {
            const imageBinary = await db.getImage(getRelease.images[0].uri)
            const imageFromDiscogs = await downloadImage(imageBinary, `${uploadDir}/${userID}/cover.jpg`)
            if (imageFromDiscogs.success) {
              cover = `/uploads/${userID}/cover.jpg`
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

      sendDiscogsRes(mainResult);
  
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

  function sendDiscogsRes(result) {
    console.log("sendDiscogsRes ", result);
    if (result !== undefined) {
      res.send(result);
    } else {
      return {
        success: false,
        message: "Error with discogs parsing",
      };
    }
  }
};

const getDiscogsByReleaseID = async (req, res) => {

  let errors = []
  let release = {}
  let cover = undefined

  console.log('getDiscogsByReleaseID ', req.body)
  const releaseID = req.body.releaseID;
  const userID = req.body.user;
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
      const imageFromDiscogs = await downloadImage(imageBinary, `${uploadDir}/${userID}/cover.jpg`)
      if (imageFromDiscogs.success) {
        cover = `/uploads/${userID}/cover.jpg`
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

  // res.send({
  //   success: false,
  //   message: "The Discogs resource was not found",
  // })

  res.send(result)


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

function uniqueIDGenerate() {
  function chr4 () {
    return Math.random().toString(16).slice(-4)
  }
  return chr4() + chr4() + chr4() + chr4()
}

/// Get Subscribers 
const getAllVideos = async (req, res, next) => {
  // const token = await getToken(req.headers);
  // console.log('token ', token)
  // if (!token) {
  //   return res.status(401).json({ message: "Ошибка авторизации" });
  // }
  try {
    const videosAll = await Video.find({}).sort({ _id: -1 });
    if (!videosAll) {
      return res.status(400).json({message: `Ничего не найдено`})
    }
    return res.json({ success: true, items: videosAll });
  } catch (e) {
    console.log(e)
    res.status(400).json({ message: "Access Error" });
  }
}


module.exports = {
  getDiscogs,
  getDiscogsByReleaseID,
  uploadFiles,
  getAllMyVideos,
  startAutoUpload,
  getAllVideos,
  getMyLastVideos,
  uploadFileRVBD
};
