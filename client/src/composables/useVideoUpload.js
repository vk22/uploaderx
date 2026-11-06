import { ref } from "vue";
import axios from "axios";
import { useMainStore } from "@/stores/main";
import checkIfFileValid from "../services/checkIfFileValid";
import notifyUploader from "../utils/uploaderAlerts";
import scrollToTop from "../utils/scrollToTop";

function createEmptyVideoData() {
  return {
    title: undefined,
    description: undefined,
    tags: undefined,
    privacyStatus: "public",
    isForChildren: false,
    pictureFormat: undefined,
    pictureURL: undefined,
  };
}

// Owns the video-details form (videoData), the cover-upload state, and
// the submit flow. audioData is read from useAudioFile; onReset is called
// after a successful upload or an invalid cover file, and is expected to
// also clear the audio/Discogs state owned by the sibling composables.
export default function useVideoUpload({ user, audioData, formData, onReset }) {
  const mainStore = useMainStore();

  const videoData = ref(createEmptyVideoData());
  const inputErrors = ref([]);
  const uploadDisabled = ref(1);
  const releaseCoverExist = ref(false);
  const releaseCoverNeed = ref(false);
  const changeCover = ref(false);
  const coverLoading = ref(false);

  const uploadTemplates = ref([
    { id: 1, title: "Cover Left" },
    { id: 2, title: "Cover Center" },
  ]);
  const uploadTemplate = ref(1);

  const privacyList = [
    { name: "Public", value: "public" },
    { name: "Private", value: "private" },
    { name: "Unlisted", value: "unlisted" },
  ];

  function inputHasError(field) {
    return inputErrors.value.includes(field);
  }

  function chooseTemplate(id) {
    uploadTemplate.value = id;
  }

  function resetVideoData() {
    videoData.value = createEmptyVideoData();
    uploadDisabled.value = 1;
  }

  async function coverAdded(file) {
    if (!checkIfFileValid(file, "cover")) {
      alert("Wrong file type");
      onReset?.();
      mainStore.setFileLoading(false);
      return;
    }
    coverLoading.value = true;
    releaseCoverNeed.value = false;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      videoData.value.pictureURL = reader.result;
      setTimeout(() => {
        releaseCoverExist.value = true;
        coverLoading.value = false;
        changeCover.value = false;
      }, 1000);
    };
    formData?.remove("coverFile");
    formData?.append("coverFile", file);
  }

  function checkInputsOnErrors() {
    inputErrors.value = [];
    if (!videoData.value.title || videoData.value.title === "") {
      inputErrors.value.push("Title");
    }
    if (!videoData.value.pictureURL || videoData.value.pictureURL === undefined) {
      inputErrors.value.push("Cover");
    }
    if (!audioData.value.discogsRelease.id) {
      inputErrors.value.push("Link on Discogs Release Page");
    }
  }

  async function startUpload() {
    checkInputsOnErrors();
    if (inputErrors.value.length) {
      notifyUploader({
        active: true,
        variant: "error",
        title: "Tags helper:",
        message: `You must fill in these fields: ${inputErrors.value.join(", ")}`,
      });
      return;
    }

    mainStore.setFileLoading(true);
    mainStore.setUploadingState("Uploading file...");
    mainStore.setProgressColor("red");

    await uploadeFiles();
  }

  async function uploadeFiles() {
    const title = videoData.value.title;
    const description = videoData.value.description;
    const tags = videoData.value.tags;
    const privacyStatus = videoData.value.privacyStatus;
    const releaseID = audioData.value ? audioData.value.discogsRelease.id : null;

    if (inputErrors.value.length) {
      return;
    }

    scrollToTop(500);
    const userID = user.value ? user.value.id : "test";
    formData?.append("userID", userID);
    formData?.append("releaseID", releaseID);
    formData?.append("title", title);
    formData?.append("description", description);
    formData?.append("tags", tags);
    formData?.append("privacyStatus", privacyStatus);
    formData?.append("uploadTemplate", uploadTemplate.value);
    if (audioData.value.title) {
      formData?.append("audioTitle", audioData.value.title);
    }
    if (audioData.value.title) {
      formData?.append("audioArtist", audioData.value.artist);
    }
    if (audioData.value.country && audioData.value.year) {
      formData?.append("audioCountryYear", `(${audioData.value.country}, ${audioData.value.year})`);
    }
    if (audioData.value.country && !audioData.value.year) {
      formData?.append("audioCountryYear", `(${audioData.value.country})`);
    }
    if (!audioData.value.country && audioData.value.year) {
      formData?.append("audioCountryYear", `(${audioData.value.year})`);
    }

    const response = await axios.post("/api/upload-file/", formData?.get(), {
      params: { user: userID },
    });

    mainStore.setFileLoading(false);
    if (response.data.success) {
      onReset?.();
    } else {
      notifyUploader({
        active: true,
        variant: "error",
        title: "Tags helper:",
        message: response.data.message || "Upload failed.",
      });
    }
  }

  return {
    videoData,
    inputErrors,
    inputHasError,
    uploadDisabled,
    releaseCoverExist,
    releaseCoverNeed,
    changeCover,
    coverLoading,
    uploadTemplates,
    uploadTemplate,
    chooseTemplate,
    privacyList,
    coverAdded,
    checkInputsOnErrors,
    startUpload,
    uploadeFiles,
    resetVideoData,
  };
}
