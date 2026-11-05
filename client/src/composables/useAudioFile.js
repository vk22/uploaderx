import { ref } from "vue";
import * as mm from "music-metadata-browser";
import checkIfFileValid from "../services/checkIfFileValid";

function createEmptyAudioData() {
  return {
    coverUri: undefined,
    picture: {
      format: undefined,
      data: undefined,
    },
    title: undefined,
    description: undefined,
    artist: undefined,
    album: undefined,
    country: undefined,
    year: undefined,
    lossless: undefined,
    duration: undefined,
    bitrate: undefined,
    discogsRelease: {
      id: null,
      link: null,
    },
    filename: undefined,
    filesize: undefined,
  };
}

function generateFileFromURL(url, filename, mimeType) {
  return fetch(url)
    .then((res) => res.arrayBuffer())
    .then((buf) => new File([buf], filename, { type: mimeType }));
}

// Owns the parsed-audio-file state (audioData/audioFileIsAdded) and the
// ID3 parsing/cover-extraction logic. Takes the shared upload FormData
// (see useUploadFormData) so the audioFile/coverFile parts can be
// appended directly where they're produced.
export default function useAudioFile({ formData } = {}) {
  const audioData = ref(createEmptyAudioData());
  const audioFileIsAdded = ref(false);

  function isValidAudioFile(file) {
    return checkIfFileValid(file, "audio");
  }

  async function parseAudioFile(file) {
    audioData.value.filename = file.name;
    const metadata = await mm.parseBlob(file);
    if (!metadata) {
      return null;
    }

    formData?.append("audioFile", file);

    audioData.value.title = metadata.common.title ? metadata.common.title : undefined;
    audioData.value.artist = metadata.common.artist ? metadata.common.artist : undefined;
    audioData.value.album = metadata.common.album ? metadata.common.album : undefined;
    audioData.value.country = metadata.common.country ? metadata.common.country : undefined;
    audioData.value.year = metadata.common.year ? metadata.common.year : undefined;

    audioFileIsAdded.value = true;

    return metadata;
  }

  // Resolves { coverExists, coverDataUrl } from an ID3-embedded picture, if any.
  function extractCoverFromMetadata(metadata) {
    return new Promise((resolve) => {
      if (metadata.common.title !== undefined) {
        audioData.value.covername = metadata.common.title.replace(/['"# ]+/g, "");
      }

      const picture = metadata.common.picture && metadata.common.picture[0];
      if (picture && picture.format !== "") {
        audioData.value.picture = {
          format: picture.format,
          data: picture.data,
        };
        const dataUrl = `data:${picture.format};base64,${picture.data.toString("base64")}`;
        generateFileFromURL(dataUrl, "cover.jpg", "image/jpg").then((file) => {
          formData?.append("coverFile", file);
        });
        resolve({ coverExists: true, coverDataUrl: dataUrl });
      } else {
        if (picture) {
          audioData.value.picture = { format: "", data: "" };
        }
        resolve({ coverExists: false, coverDataUrl: undefined });
      }
    });
  }

  function removeAllFiles() {
    audioData.value = createEmptyAudioData();
    audioFileIsAdded.value = false;
    formData?.reset();
  }

  return {
    audioData,
    audioFileIsAdded,
    isValidAudioFile,
    parseAudioFile,
    extractCoverFromMetadata,
    removeAllFiles,
  };
}
