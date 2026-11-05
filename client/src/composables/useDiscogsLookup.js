import { ref } from "vue";
import axios from "axios";
import { useMainStore } from "@/stores/main";
import notifyUploader from "../utils/uploaderAlerts";
import buildVideoTitle from "../utils/buildVideoTitle";
import buildVideoDescription from "../utils/buildVideoDescription";

function generateRandomNum() {
  return Math.floor(Math.random() * 1000000000);
}

// Owns Discogs search/lookup state and behavior. audioData/videoData and
// the cover-state refs are owned elsewhere (useAudioFile/useVideoUpload)
// but mutated here directly, same as formData — this composable is where
// a Discogs response gets merged into the rest of the upload form.
export default function useDiscogsLookup({
  user,
  audioData,
  videoData,
  releaseCoverNeed,
  releaseCoverExist,
  changeCover,
  formData,
}) {
  const mainStore = useMainStore();

  const discogsLinkTemp = ref(undefined);
  const discogsHelperWindowShow = ref(false);
  const fieldsFromDiscogs = ref([]);

  function toggleDiscogsHelperWindow() {
    discogsHelperWindowShow.value = !discogsHelperWindowShow.value;
  }

  function generateQuery(title, artist) {
    let result;
    if (title && artist) {
      result = title.concat(artist).join("+");
    }
    if (title && !artist) {
      result = title;
    }
    if (!title && artist) {
      result = artist;
    }
    return result;
  }

  async function getDiscogs(data, coverNeed) {
    const userID = user.value ? user.value.id : "test";
    return await axios.post("/api/getdiscogs", {
      trackData: data,
      user: userID,
      coverNeed,
    });
  }

  async function getDiscogsByReleaseID() {
    const userID = user.value ? user.value.id : "test";
    mainStore.setFileLoading(true);

    if (!discogsLinkTemp.value) {
      mainStore.setFileLoading(false);
      return;
    }

    const arr = discogsLinkTemp.value.split("/");
    const releaseIndex = arr.indexOf("release");
    if (releaseIndex < 0) {
      alert("Incorrect link");
      mainStore.setFileLoading(false);
      return;
    }

    const idIndex = releaseIndex + 1;
    const id = arr[idIndex].split("-")[0];
    const response = await axios.post("/api/getdiscogs2", {
      releaseID: id,
      user: userID,
    });

    afterDiscogsRequest(response, "allFields");
    setTimeout(() => {
      mainStore.setFileLoading(false);
    }, 1000);
  }

  // type === "allFields" overwrites audioData fields from the Discogs
  // release; otherwise only fields still empty on audioData get filled in.
  function applyDiscogsFields(release, cover, { overwrite }) {
    fieldsFromDiscogs.value = [];
    for (const [key, value] of Object.entries(audioData.value)) {
      if (overwrite ? release[key] : !value && release[key]) {
        audioData.value[key] = release[key];
        fieldsFromDiscogs.value.push(key);
      }
    }
    if (cover) {
      videoData.value.pictureURL = cover + "?version=" + generateRandomNum();
      if (videoData.value.pictureURL) {
        releaseCoverNeed.value = false;
        releaseCoverExist.value = true;
        changeCover.value = false;
      }
      if (overwrite) {
        formData?.remove("coverFile");
      }
    }
  }

  function afterDiscogsRequest(response, type) {
    if (response) {
      if (response.data.success) {
        audioData.value.discogsRelease = {
          link: response.data.data.release.link,
          id: response.data.data.release.discogs_release,
        };
        discogsLinkTemp.value = response.data.data.release.link;

        applyDiscogsFields(response.data.data.release, response.data.data.cover, {
          overwrite: type === "allFields",
        });

        const errors = response.data.data.errors
          ? response.data.data.errors.reduce((acc, item) => (acc += `${item.type}, `), "Errors: ")
          : "";

        const message = fieldsFromDiscogs.value.length
          ? `We analyzed your file and added data from Discogs: ${fieldsFromDiscogs.value.join(", ")}`
          : `We checked Discogs database. There's no new data.\n ${errors}`;

        notifyUploader({ active: true, variant: "success", title: "Tags helper:", message });
      } else {
        notifyUploader({
          active: true,
          variant: "warning",
          title: "Tags helper:",
          message: "Nothing found, mate! It seems, that your music is very rare.",
        });
      }
    } else {
      notifyUploader({
        active: true,
        variant: "error",
        title: "Tags helper:",
        message:
          "Your file does not contain the necessary data for the title and description of the video file. Try using Discogs Helper or fill in all the fields yourself.",
      });
    }

    videoData.value.title = buildVideoTitle(audioData.value);
    videoData.value.description = buildVideoDescription({
      album: audioData.value.album,
      link: audioData.value.discogsRelease.link,
    });
  }

  return {
    discogsLinkTemp,
    discogsHelperWindowShow,
    toggleDiscogsHelperWindow,
    fieldsFromDiscogs,
    generateQuery,
    getDiscogs,
    getDiscogsByReleaseID,
    afterDiscogsRequest,
  };
}
