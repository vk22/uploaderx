const fs = require("fs-extra");
const path = require("path");
const { sanitizeUserId } = require("../utils/sanitizeUserId");

const rootDir = process.env.ROOT_DIR || path.join(__dirname, "../..");
const uploadDir = path.join(rootDir, "uploads");
const autoUploadDir = path.join(uploadDir, "auto");
const defaultCoverPath = path.join(rootDir, "cover.jpg");

function getUserUploadDir(userID) {
  const safeUserID = sanitizeUserId(userID);
  const dir = path.join(uploadDir, safeUserID);
  fs.ensureDirSync(dir);
  return dir;
}

function getUserCoverPath(userID) {
  return path.join(getUserUploadDir(userID), "cover.jpg");
}

function getDefaultCoverPath() {
  return defaultCoverPath;
}

function getAutoAudioDir() {
  const dir = path.join(autoUploadDir, "audio");
  fs.ensureDirSync(dir);
  return dir;
}

function getAutoVisualDir() {
  const dir = path.join(autoUploadDir, "visual");
  fs.ensureDirSync(dir);
  return dir;
}

function listFiles(dirPath) {
  return fs.readdirSync(dirPath);
}

function writeFile(filePath, data) {
  fs.writeFileSync(filePath, data);
}

function writeBinaryFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, "binary", (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function copyFile(source, destination) {
  fs.copySync(source, destination);
}

function moveFile(source, destination, options) {
  fs.moveSync(source, destination, options);
}

function removeFile(filePath) {
  fs.unlinkSync(filePath);
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

module.exports = {
  getUserUploadDir,
  getUserCoverPath,
  getDefaultCoverPath,
  getAutoAudioDir,
  getAutoVisualDir,
  listFiles,
  writeFile,
  writeBinaryFile,
  copyFile,
  moveFile,
  removeFile,
  fileExists,
};
