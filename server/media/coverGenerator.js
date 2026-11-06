const fs = require("fs");
const sharp = require("sharp");

const rootDir = process.env.ROOT_DIR;
const kxTitlePath = rootDir + "/sources/kx-title.png";
const uploaderLogoPath = rootDir + "/sources/uploader-logo.png";
const backgroundBlackPath = rootDir + "/sources/background.jpg";

// Resolved by fontconfig (see server/config/fonts.conf, activated via the
// FONTCONFIG_FILE env var in the Dockerfile), which points at the
// bind-mounted /app/data/fonts directory containing these two TTFs.
const FONT_BOLD = "Montserrat SemiBold";
const FONT_LIGHT = "Montserrat Light";

// Reproduces ImageMagick's `-gravity <dir> -geometry +X+Y` placement math,
// so the composited result matches the previous ImageMagick-based pipeline.
function gravityOffset(gravity, canvasW, canvasH, overlayW, overlayH, offsetX = 0, offsetY = 0) {
  const positions = {
    northwest: { left: offsetX, top: offsetY },
    north: { left: (canvasW - overlayW) / 2 + offsetX, top: offsetY },
    northeast: { left: canvasW - overlayW - offsetX, top: offsetY },
    west: { left: offsetX, top: (canvasH - overlayH) / 2 + offsetY },
    center: { left: (canvasW - overlayW) / 2 + offsetX, top: (canvasH - overlayH) / 2 + offsetY },
    east: { left: canvasW - overlayW - offsetX, top: (canvasH - overlayH) / 2 + offsetY },
    southwest: { left: offsetX, top: canvasH - overlayH - offsetY },
    south: { left: (canvasW - overlayW) / 2 + offsetX, top: canvasH - overlayH - offsetY },
    southeast: { left: canvasW - overlayW - offsetX, top: canvasH - overlayH - offsetY },
  };
  const { left, top } = positions[gravity];
  return { left: Math.round(left), top: Math.round(top) };
}

function escapePangoMarkup(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Renders one line of white text with sharp's native (Pango/cairo) text
// support. Font size 32 at the default 72dpi matches ImageMagick's
// `-pointsize 32` almost exactly.
//
// sharp's text renderer always outputs a black glyph + alpha mask (color
// markup/tint don't recolor it), so to get white text we composite that
// mask over a solid white layer with blend "dest-in": the result keeps
// white's color but inherits the mask's alpha, i.e. white glyphs on a
// transparent background.
async function renderTextLine(text, fontFamily, fontSize = 32) {
  const mask = await sharp({
    text: {
      text: escapePangoMarkup(text),
      font: `${fontFamily} ${fontSize}`,
      rgba: true,
    },
  })
    .png()
    .toBuffer();
  const { width, height } = await sharp(mask).metadata();

  return sharp({
    create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

// Right-aligned text block anchored `rightMargin` px from the canvas's
// right edge, matching the old `-gravity NorthEast -draw "text X,Y ..."`
// ImageMagick calls (which right-align text under East-side gravities).
async function buildTextOverlays(canvasW, lines, rightMargin = 80) {
  const anchorX = canvasW - rightMargin;
  const overlays = [];
  for (const { text, y, fontFamily } of lines) {
    if (!text) continue;
    const buffer = await renderTextLine(text, fontFamily);
    const { width } = await sharp(buffer).metadata();
    overlays.push({ input: buffer, left: anchorX - width, top: y });
  }
  return overlays;
}

async function generateKxCover(file) {
  const canvasW = 1920;
  const canvasH = 1080;

  const resized = await sharp(file)
    .resize(canvasW, canvasH, { fit: "contain", background: "#1a1a1a", position: "east" })
    .toBuffer();

  const kxTitle = sharp(kxTitlePath);
  const { width: titleW, height: titleH } = await kxTitle.metadata();
  const { left, top } = gravityOffset("west", canvasW, canvasH, titleW, titleH, 50, 150);

  await sharp(resized)
    .composite([{ input: kxTitlePath, left, top }])
    .toFile(file);
}

async function generateTemplate1Cover(file, overlayText) {
  const background = sharp(backgroundBlackPath);
  const { width: canvasW, height: canvasH } = await background.metadata();

  const coverBuffer = await sharp(file)
    .resize(920, 920, { fit: "inside" })
    .toBuffer();
  const { width: coverW, height: coverH } = await sharp(coverBuffer).metadata();
  const coverPos = gravityOffset("west", canvasW, canvasH, coverW, coverH, 100, 0);

  const { width: logoW, height: logoH } = await sharp(uploaderLogoPath).metadata();
  const logoPos = gravityOffset("southeast", canvasW, canvasH, logoW, logoH, 80, 80);

  const { audioArtist = "", audioTitle = "", audioCountryYear = "" } = overlayText;
  const textOverlays = await buildTextOverlays(canvasW, [
    { text: audioArtist, y: 80, fontFamily: FONT_BOLD },
    { text: audioTitle, y: 130, fontFamily: FONT_LIGHT },
    { text: audioCountryYear, y: 180, fontFamily: FONT_LIGHT },
  ]);

  await sharp(backgroundBlackPath)
    .composite([
      { input: coverBuffer, left: coverPos.left, top: coverPos.top },
      { input: uploaderLogoPath, left: logoPos.left, top: logoPos.top },
      ...textOverlays,
    ])
    .toFile(file);
}

async function generateTemplate2Cover(file) {
  // sharp doesn't support reading and writing the same path in one
  // pipeline (the output can be truncated before the input is fully
  // read), so resize into memory first, then overwrite the file.
  const buffer = await sharp(file)
    .resize(1920, 1080, { fit: "contain", background: "#000000", position: "center" })
    .toBuffer();
  fs.writeFileSync(file, buffer);
}

async function generateVideoCover(file, coverType, overlayText = {}) {
  try {
    if (coverType === "KX") {
      await generateKxCover(file);
    } else if (coverType === "1") {
      await generateTemplate1Cover(file, overlayText);
    } else if (coverType === "2") {
      await generateTemplate2Cover(file);
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
