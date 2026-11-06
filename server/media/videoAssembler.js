const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

function assembleVideo(coverFile, audioFile, outputFolder) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(outputFolder, "output.mp4");

    ffmpeg()
      .input(coverFile)
      .inputOptions(["-loop 1", "-framerate 1"])
      .input(audioFile)
      .outputOptions([
        "-vf scale=1280:-2",
        "-c:v libx264",
        "-preset ultrafast",
        "-tune stillimage",
        "-crf 30",
        "-pix_fmt yuv420p",
        "-c:a aac",
        "-b:a 320k",
        "-ar 44100",
        "-movflags +faststart",
        "-shortest",
      ])
      .output(outputPath)
      .on("start", (cmd) => console.log("FFmpeg started:", cmd))
      .on("progress", (progress) => {
        if (typeof progress.percent === "number") {
          console.log(`Progress: ${Math.min(100, progress.percent).toFixed(0)}%`);
        }
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err.message);
        reject(err);
      })
      .on("end", () => {
        console.log("FFmpeg finished!");
        resolve(outputPath);
      })
      .run();
  });
}

module.exports = { assembleVideo };
