const fs = require("fs");
const sharp = require("sharp");
const util = require("util");
const execFile = util.promisify(require("child_process").execFile);

const rootDir = process.env.ROOT_DIR;
const kxTitle = rootDir + "/sources/kx-title.png";
const uploaderLogo = rootDir + "/sources/uploader-logo.png";
const backgroundBlack = rootDir + "/sources/background.jpg";
const fontBold = rootDir + "/fonts/Montserrat-SemiBold.ttf";
const fontLight = rootDir + "/fonts/Montserrat-Light.ttf";

async function generateVideoCover(file, coverType, overlayText = {}) {
  const { audioArtist = "", audioTitle = "", audioCountryYear = "" } = overlayText;

  try {
    if (coverType === "KX") {
      await execFile("convert", [
        file, "-resize", "1920x1080", "-gravity", "East",
        "-background", "#1a1a1a", "-extent", "1920x1080", file,
      ]);
      await execFile("composite", [
        "-gravity", "West", "-geometry", "+50+150",
        kxTitle, file, "-colorspace", "rgb", "-type", "truecolor", file,
      ]);
    } else if (coverType === "1") {
      await execFile("convert", [
        file, "-resize", "920x920", backgroundBlack, "+swap",
        "-gravity", "West", "-geometry", "+100+0", "-compose", "over",
        "-composite", file,
      ]);
      await execFile("composite", [
        "-gravity", "SouthEast", "-geometry", "+80+80",
        uploaderLogo, file, file,
      ]);
      await execFile("convert", [
        file, "-font", fontBold, "-pointsize", "32", "-fill", "white",
        "-gravity", "NorthEast",
        "-draw", `text 80,80 '${audioArtist}'`,
        "-font", fontLight,
        "-draw", `text 80,130 '${audioTitle}'`,
        "-draw", `text 80,180 '${audioCountryYear}'`,
        file,
      ]);
    } else if (coverType === "2") {
      await execFile("convert", [
        file, "-resize", "1920x1080", "-gravity", "center",
        "-background", "#000000", "-extent", "1920x1080", file,
      ]);
    }
    return { file, error: null };
  } catch (error) {
    console.log("generateVideoCover error ", error);
    return { file, error };
  }
}

async function convertToJpeg(startImage, finalImage) {
  try {
    await sharp(startImage).jpeg({ quality: 100 }).toFile(finalImage);
    fs.unlinkSync(startImage);
    return true;
  } catch (error) {
    console.log("convertToJpeg error ", error);
    return false;
  }
}

module.exports = { generateVideoCover, convertToJpeg };
