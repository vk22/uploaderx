<template>
  <div class="upload-container">
    <!-- Loading -->
    <LoadingAndStage
      :uploadingState="uploadingState"
      :progressColor="progressColor"
    ></LoadingAndStage>

    <!-- Top Tools -->
    <div class="top-tools" v-show="audioFileIsAdded">
      <div class="left">
        <div class="label">File uploaded:</div>
        <div>{{ audioData.filename }}</div>
      </div>
      <div class="right">
        <!-- <div @click="testAlert()">TestAlert</div> -->
        <div class="discogs-btn v-btn-small" @click="discogsHelperWindow">
          <span class="icon discogs-icon"></span>
          Discogs Helper
        </div>
        <!-- <v-icon class="ml-4" @click="removeAllFiles">mdi-delete</v-icon> -->
        <div class="remove-track" @click="removeAllFiles">
          <RemoveBtn></RemoveBtn>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="sidebar-right" :class="{ show: discogsHelperWindowShow }">
      <div class="sidebar-close">
        <v-icon left @click="discogsHelperWindow">mdi-close</v-icon>
      </div>
      <v-container>
        <div class="block-title text-left">
          <h3>Discogs Helper</h3>
        </div>
        <v-row>
          <v-col>
            <div class="discogs-field">
              <v-text-field
                v-model="discogsLinkTemp"
                variant="outlined"
                clearable
                label="Link on Release Page"
                type="text"
              >
              </v-text-field>
              <div class="discogs-link" @click="getDiscogsByReleaseID()">
                Search
              </div>
              <!-- <div class="discogs-link" v-if="audioData.discogsRelease.id">
                <a
                  v-bind:href="audioData.discogsRelease.link"
                  target="_blank"
                  class="link"
                  >Open</a
                >
              </div> -->
            </div>
          </v-col>
        </v-row>
        <div class="release-data" v-show="audioData.discogsRelease.id">
          <v-row>
            <v-col>
              <div class="cover-item" v-if="audioData.coverUri">
                <div class="cover-item__img">
                  <img :src="audioData.coverUri" alt="" />
                </div>
                <div class="cover-item__label">
                  <v-icon @click="getDiscogsByReleaseID()">mdi-plus</v-icon>
                  <!-- <span>Use this cover</span> -->
                </div>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="label">Release ID</div>
              <div class="data">
                <a
                  v-bind:href="audioData.discogsRelease.link"
                  target="_blank"
                  class="link"
                  >{{ audioData.discogsRelease.id }}</a
                >
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="label">Album</div>
              <div class="data">{{ audioData.album }}</div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="label">Artist</div>
              <div class="data">{{ audioData.artist }}</div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="label">Country</div>
              <div class="data">{{ audioData.country }}</div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="label">Year</div>
              <div class="data">{{ audioData.year }}</div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <!-- <div class="btn mt-3" @click="getDiscogsByReleaseID()">Get This</div> -->
            </v-col>
          </v-row>
        </div>
      </v-container>
    </div>

    <!-- Dropzone -->
    <div class="drop-zone-container" v-show="!audioFileIsAdded">
      <!-- <div class="block-title">
        <h3>Upload your audio file</h3>
      </div> -->
      <div v-if="user">
        <div v-if="user.id === autoUploadUser" class="btn mb-3" @click="startAutoUpload()">Start AutoUpload</div>
      </div> 
      
      <div class="audio-dropzone">
        <FileUploader
          @files-dropped2="fileAdded"
          :type="'audio'"
          ref="uploaderRef"
        ></FileUploader>
      </div>
    </div>
    <!-- Dropzone -->

    <div class="form-container" v-show="audioFileIsAdded">
      <div class="block-title">
        <h3>Video details</h3>
      </div>
      <v-row>
        <!-- Col R -->
        <v-col>
          <!--- Cover Dropzone-->
          <v-row>
            <v-col class="cover-wrap">
              <div class="cover-loading" v-if="coverLoading">
                <v-progress-circular
                  :color="progressColor"
                  indeterminate
                  rounded
                  height="6"
                ></v-progress-circular>
              </div>
              <div
                class="form-group cover-container"
                v-if="!releaseCoverNeed && !coverLoading"
              >
                <div class="cover-preview">
                  <img :src="videoData.pictureURL" class="cover" />
                </div>
              </div>
              <div
                class="form-group cover-dropzone"
                v-bind:class="{
                  active: releaseCoverNeed && !coverLoading,
                  error: inputHasError('cover'),
                }"
              >
                <FileUploader
                  @files-dropped2="coverAdded"
                  :type="'cover'"
                  ref="uploaderRef"
                ></FileUploader>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="d-flex justify-center align-center">
              <v-checkbox
                v-model="releaseCoverNeed"
                :label="`Change cover?`"
                v-show="releaseCoverExist"
              ></v-checkbox>
            </v-col>
          </v-row>
          <!--- Video Form -->
          <v-row>
            <v-col>
              <v-text-field
                v-model="videoData.title"
                variant="outlined"
                clearable
                label="Title"
                type="text"
                :error="inputHasError('title')"
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-textarea
                v-model="videoData.description"
                variant="outlined"
                clearable
                label="Description"
                type="text"
                :error="inputHasError('description')"
              >
              </v-textarea>
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <v-text-field
                v-model="videoData.tags"
                variant="outlined"
                clearable
                label="Tags"
                type="text"
                :error="inputHasError('tags')"
              >
              </v-text-field>
            </v-col>
          </v-row>
<!-- 
          <v-row>
            <v-col>
              <v-select
                label="Template"
                :items="uploadTemplatesOptions"
                variant="outlined"
                clearable
                v-model="uploadTemplate"
              ></v-select>
            </v-col>
          </v-row> -->

          <v-row class="choose-template">
            <v-col cols="12">
              <div class="block-subtitle">
                Choose video template
              </div>
            </v-col>
            <v-col cols="6" v-for="(template, index) in uploadTemplates" :key="index">
              <div class="choose-template__item" @click="chooseTemplate(template.id)" :class="{'active': template.id === uploadTemplate}">
                <img :src="template.icon" alt="">
                <!-- <p>{{ template.title }}</p> -->
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col
              class="d-flex justify-start align-center"
              cols="12"
            >
            <div class="radio-block">
              <v-radio-group inline v-model="videoData.privacyStatus">
                <v-radio
                  v-for="(option, index) in privacyList"
                  :key="index"
                  :label="option.name"
                  :value="option.value"
                ></v-radio>
              </v-radio-group>
            </div>

            </v-col>
            <!-- <v-col class="d-flex justify-end align-center" cols="4">
                      <v-checkbox v-model="videoData.isForChildren" :label="`Made For Kids (?)`"></v-checkbox>
                    </v-col> -->
          </v-row>

          <v-row>
            <v-col>
              <div class="submit-group">
                <div
                  v-if="uploadDisabled == 0 && !fileLoading"
                  class="btn btn-upload full-w"
                  v-on:click="startUpload"
                >
                  Upload track
                </div>
              </div>
            </v-col>
          </v-row>
        </v-col>
        <!-- Col R -->
      </v-row>
    </div>
  </div>
</template>


<script setup>
import axios from "axios";
import * as mm from "music-metadata-browser";
import { computed, ref } from "vue";
import { useMainStore } from "@/stores/main";
import { useAuthStore } from "@/stores/auth";
import FileUploader from "../components/FileUploader.vue";
import LoadingAndStage from "../components/LoadingAndStage.vue";
import RemoveBtn from "../components/RemoveBtn.vue";
import * as process from "process";
import { Buffer } from "buffer";
import checkIfFileValid from '../services/checkIfFileValid'
window.process = process;
window.Buffer = Buffer;
const mainStore = useMainStore();
const authStore = useAuthStore();
const authenticated = computed(() => authStore.authenticated);
const user = computed(() => authStore.user);
const token = computed(() => authStore.token);
const uploadingState = computed(() => mainStore.getUploadingState);
const progressColor = computed(() => mainStore.getProgressColor);

const audioData = ref({
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
});
const videoData = ref({
  title: undefined,
  description: undefined,
  tags: undefined,
  privacyStatus: "public",
  isForChildren: false,
  pictureFormat: undefined,
  pictureURL: undefined,
});

const inputErrors = ref([]);
const inputHasError = (field) => {
  return inputErrors.value.includes(field);
};

const uploadDisabled = ref(1);
const releaseCoverExist = ref(false);
const audioFileIsAdded = ref(false);
const releaseCoverNeed = ref(false);
const changeCover = ref(false);
const coverLoading = ref(false);
const formDataAll = new FormData();
const fieldsFromDiscogs = ref([]);
const discogsLinkTemp = ref(undefined);

const autoUploadUser = ref("102814452894667054158");
// const uploadTemplatesOptions = computed(() => {
//   let data;
//   if (user) {
//     if (user.value.id === autoUploadUser.value) {
//       data = ["CoverCenter", "CoverLeft", "KX"];
//       uploadTemplate.value = "CoverLeft";
//     } else {
//       data = ["CoverCenter", "CoverLeft"];
//       uploadTemplate.value = "CoverLeft";
//     }
//   } else {
//     data = ["CoverCenter", "CoverLeft", "KX"];
//     uploadTemplate.value = "CoverLeft";
//   }
//   return data;
// });

const uploadTemplates = ref([
  {
    id: 1,
    icon: 'video-template-1.png',
    title: 'Cover Left'
  },
  {
    id: 2,
    icon: 'video-template-2.png',
    title: 'Cover Center'
  }
])

const uploadTemplate = ref(1);
const chooseTemplate = (id) => {
  uploadTemplate.value = id
}

const privacyList = [
    {
      name: "Public",
      value: "public",
    },
    {
      name: "Private",
      value: "private",
    },
    {
      name: "Unlisted",
      value: "unlisted",
    }
]

const discogsHelperWindowShow = ref(false);
function discogsHelperWindow() {
  discogsHelperWindowShow.value = !discogsHelperWindowShow.value;
}
async function fileAdded(file) {
  console.log("fileAdded ", file);
  ///
  
  if (!checkIfFileValid(file, 'audio')) {
    alert("Wrong file type");
    removeAllFiles();
    mainStore.setFileLoading(false);
    return;
  }

  mainStore.setFileLoading(true);
  mainStore.setUploadingState("Parsing file... Parsing Discogs...");

  audioData.value.filename = file.name;
  const metadata = await mm.parseBlob(file);
  if (metadata) {
    formDataAll.append("audioFile", file);

    audioData.value.title = metadata.common.title
      ? metadata.common.title
      : undefined;
    audioData.value.artist = metadata.common.artist
      ? metadata.common.artist
      : undefined;
    audioData.value.album = metadata.common.album
      ? metadata.common.album
      : undefined;
    audioData.value.country = metadata.common.country
      ? metadata.common.country
      : undefined;
    audioData.value.year = metadata.common.year
      ? metadata.common.year
      : undefined;

    audioFileIsAdded.value = true;

    //// Get Cover From File
    releaseCoverExist.value = await getCoverFromFile(metadata);
    console.log("audioData ", audioData.value);

    const title = audioData.value.title
      ? audioData.value.title.split(" ")
      : undefined;
    const artist = audioData.value.artist
      ? audioData.value.artist.split(" ")
      : undefined;
    const album = audioData.value.album
      ? audioData.value.album.split(" ")
      : undefined;
    const query = generateQuery(title, artist);
    const coverNeed = !releaseCoverExist.value;
    const firstResponseToDiscogs = query
      ? await getDiscogs({ album, artist, title }, coverNeed)
      : undefined;
      console.log('firstResponseToDiscogs ', firstResponseToDiscogs)
    afterDiscogsRequest(firstResponseToDiscogs);

    uploadDisabled.value = 0;
    mainStore.setFileLoading(false);
    mainStore.setUploadingState(undefined);
  }
}
async function coverAdded(file) {
    if (!checkIfFileValid(file, 'cover')) {
      alert("Wrong file type");
      removeAllFiles();
      mainStore.setFileLoading(false);
      return;
    }
    coverLoading.value = true;
    releaseCoverNeed.value = false;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      videoData.value.pictureURL = reader.result;
      // this.$refs.coverDropzone.removeAllFiles();
      setTimeout(() => {
        releaseCoverExist.value = true;
        coverLoading.value = false;
        changeCover.value = false;
      }, 1000);
    };
    formDataAll.delete("coverFile");
    formDataAll.append("coverFile", file);
}
function getCoverFromFile(metadata) {
  return new Promise((resolve, reject) => {
    if (metadata.common.title !== undefined) {
      audioData.value.covername = metadata.common.title.replace(/['"# ]+/g, "");
    }
    if (metadata.common.picture !== undefined) {
      if (metadata.common.picture[0].format !== "") {
        audioData.value.picture = {
          format: metadata.common.picture[0].format,
          data: metadata.common.picture[0].data,
        };
        const url =
          "data: " +
          videoData.value.pictureFormat +
          ";base64," +
          audioData.value.picture.data.toString("base64");
        let self = this;
        generateFileFromURL(url, user.id + ".jpg", "image/jpg").then(function (
          file
        ) {
          /// Cover FormData
          formDataAll.append("coverFile", file);
        });
        videoData.value.pictureURL = url;
        resolve(true);
      } else {
        audioData.value.picture = {
          format: "",
          data: "",
        };
        releaseCoverNeed.value = true;
        resolve(false);
      }
    } else {
      videoData.value.pictureURL = undefined;
      videoData.value.pictureFormat = undefined;
      releaseCoverNeed.value = true;

      resolve(false);
    }
  });
}
function generateFileFromURL(url, filename, mimeType) {
  return fetch(url)
    .then(function (res) {
      return res.arrayBuffer();
    })
    .then(function (buf) {
      return new File([buf], filename, { type: mimeType });
    });
}
async function getDiscogs(data, сoverNeed) {
  const userID = user.value ? user.value.id : "test";
  console.log('data ', data)
  return await axios.post("/api/getdiscogs", {
    trackData: data,
    user: userID,
    сoverNeed: сoverNeed,
  });
}
async function getDiscogsByReleaseID() {
    inputErrors.value = [];
    mainStore.setFileLoading(true);
    const userID = user.value ? user.value.id : "test";

    if (discogsLinkTemp.value) {
      const arr = discogsLinkTemp.value.split("/");
      const releaseIndex = arr.indexOf("release");
      if (releaseIndex < 0) {
        console.log("Incorrect link");
        alert("Incorrect link")
      } else {
        const idIndex = releaseIndex + 1;
        const id = arr[idIndex].split("-")[0];
        const response = await axios.post("/api/getdiscogs2", {
          releaseID: id,
          user: userID,
        });
        // console.log("response ", response);

        afterDiscogsRequest(response, "allFields");
        setTimeout(() => {
          mainStore.setFileLoading(false);
        }, 1000);
      }
    }
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
function afterDiscogsRequest(response, type) {
  console.log("response ", response);
  if (response) {
    if (response.data.success) {
      audioData.value.discogsRelease = {
        link: response.data.data.release.link,
        id: response.data.data.release.discogs_release,
      };
      discogsLinkTemp.value = response.data.data.release.link;
      if (type === "allFields") {
        setAllField(response.data.data.release, response.data.data.cover);
      } else {
        setEmptyField(response.data.data.release, response.data.data.cover);
      }

      const errors = response.data.data.errors
        ? response.data.data.errors.reduce(
            (acc, item) => (acc += `${item.type}, `),
            "Errors: "
          )
        : "";

      const message = fieldsFromDiscogs.value.length
        ? `We analyzed your file and added data from Discogs: ${fieldsFromDiscogs.value.join(
            ", "
          )}`
        : `We checked Discogs database. There's no new data.\n ${errors}`;

      uploaderHelper({
        active: true,
        variant: "success",
        title: "Tags helper:",
        message: message,
      });
    } else {
      uploaderHelper({
        active: true,
        variant: "warning",
        title: "Tags helper:",
        message: "Nothing found, mate! It seems, that your music is very rare.",
      });
    }
  } else {
    uploaderHelper({
      active: true,
      variant: "error",
      title: "Tags helper:",
      message:
        "Your file does not contain the necessary data for the title and description of the video file. Try using Discogs Helper or fill in all the fields yourself.",
    });
  }

  /// VIDEO DATA CREATE
  console.log(
    "VIDEO DATA CREATE ",
    audioData.value.artist,
    audioData.value.title,
    audioData.value.country,
    audioData.value.year
  );
  if (
    audioData.value.artist &&
    audioData.value.title &&
    audioData.value.country &&
    audioData.value.year
  ) {
    videoData.value.title = `${audioData.value.artist} - ${audioData.value.title} (${audioData.value.country}, ${audioData.value.year})`;
  } else if (
    audioData.value.artist &&
    audioData.value.title &&
    audioData.value.country &&
    !audioData.value.year
  ) {
    videoData.value.title = `${audioData.value.artist} - ${audioData.value.title} (${audioData.value.country})`;
  } else if (
    audioData.value.artist &&
    audioData.value.title &&
    !audioData.value.country &&
    audioData.value.year
  ) {
    videoData.value.title = `${audioData.value.artist} - ${audioData.value.title} (${audioData.value.year})`;
  } else if (
    audioData.value.artist &&
    audioData.value.title &&
    !audioData.value.country &&
    !audioData.value.year
  ) {
    videoData.value.title = `${audioData.value.artist} - ${audioData.value.title}`;
  } else if (
    audioData.value.artist &&
    !audioData.value.title &&
    !audioData.value.country &&
    !audioData.value.year
  ) {
    videoData.value.title = `${audioData.value.artist}`;
  } else if (
    !audioData.value.artist &&
    audioData.value.title &&
    !audioData.value.country &&
    !audioData.value.year
  ) {
    videoData.value.title = `${audioData.value.title}`;
  } else if (
    audioData.value.artist &&
    !audioData.value.title &&
    audioData.value.country &&
    audioData.value.year
  ) {
    videoData.value.title = `${audioData.value.artist} - XXXXXXXXX (${audioData.value.country}, ${audioData.value.year})`;
  } else {
    videoData.value.title = ``;
  }

  if (audioData.value.album && audioData.value.discogsRelease.link) {
    videoData.value.description = `Album: ${audioData.value.album}\n${audioData.value.discogsRelease.link}`;
  } else if (audioData.value.album && !audioData.value.discogsRelease.link) {
    videoData.value.description = `Album: ${audioData.value.album}`;
  } else {
    videoData.value.description = ``;
  }

  //this.checkInputsOnErrors()
}
function uploaderHelper(data) {
  data.id = new Date().getTime();
  setTimeout(() => {
    mainStore.addAlert(data);
  }, 500);

  if (data.active) {
    //console.log('data ', data.message.length)
    setTimeout(() => {
      mainStore.removeAlert({
        id: data.id,
      });
    }, data.message.length * 120);
  }
}
function generateRandomNum() {
  return Math.floor(Math.random() * 1000000000);
}
function setEmptyField(data, cover) {
  console.log("setEmptyField ", data);
  fieldsFromDiscogs.value = [];
  for (const [key, value] of Object.entries(audioData.value)) {
    //console.log(`setTrackField ${key}: ${value}`);
    if (!value && data[key]) {
      audioData.value[key] = data[key];
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
  }
}
function setAllField(release, cover) {
  console.log("setAllField ", release, cover);
  fieldsFromDiscogs.value = [];
  for (const [key, value] of Object.entries(audioData.value)) {
    //console.log(`setTrackField ${key}: ${value}`);
    if (release[key]) {
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
    formDataAll.delete("coverFile");
  }
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
  //console.log('startUpload ', this.releaseCoverIsUploaded)

  checkInputsOnErrors();
  if (inputErrors.value.length) {
    uploaderHelper({
      active: true,
      variant: "error",
      title: "Tags helper:",
      message: `You must fill in these fields: ${inputErrors.value.join(', ')}`,
    });
    return;
  };

  mainStore.setFileLoading(true);
  mainStore.setUploadingState("Uploading file...");
  mainStore.setProgressColor("red");

  await uploadeFiles();
}
async function uploadeFiles() {
  const title = videoData.value.title;
  const description = videoData.value.description;
  const tags = videoData.value.tags;
  const cover = videoData.value.pictureURL;
  const privacyStatus = videoData.value.privacyStatus;
  const releaseID = audioData.value ? audioData.value.discogsRelease.id : null

  if (!inputErrors.value.length) {
    scrollToTop(500);
    //this.audioFileIsAdded = false;
    const userID = user.value ? user.value.id : "test";
    formDataAll.append("userID", userID);
    formDataAll.append("releaseID", releaseID);
    formDataAll.append("title", title);
    formDataAll.append("description", description);
    formDataAll.append("tags", tags);
    formDataAll.append("privacyStatus", privacyStatus);
    formDataAll.append("uploadTemplate", uploadTemplate.value);
    /// `${audioData.value.artist} - ${audioData.value.title} (${audioData.value.country}, ${audioData.value.year})`
    if (audioData.value.title) {
      formDataAll.append("audioTitle", audioData.value.title);
    }
    if (audioData.value.title) {
      formDataAll.append("audioArtist", audioData.value.artist);
    }
    if (audioData.value.country && audioData.value.year) {
      formDataAll.append(
        "audioCountryYear",
        `(${audioData.value.country}, ${audioData.value.year})`
      );
    }
    if (audioData.value.country && !audioData.value.year) {
      formDataAll.append("audioCountryYear", `(${audioData.value.country})`);
    }
    if (!audioData.value.country && audioData.value.year) {
      formDataAll.append("audioCountryYear", `(${audioData.value.year})`);
    }

    // if (authenticated) {
    //   //console.log("token.value ", token.value);
    //   formDataAll.append("access_token", token.value.access_token);
    //   formDataAll.append("expiry_date", token.value.expiry_date);
    //   formDataAll.append("refresh_token", token.value.refresh_token);
    //   // this.formDataAudio.append('scope', token.value.scope)
    //   formDataAll.append("token_type", token.value.token_type);
    // }

    // if (releaseCoverIsUploaded.value) {
    //   formDataAll.append("releaseCoverIsUploaded", cover);
    // }

    const response = await axios.post("/api/upload-file/", formDataAll, {
      params: { user: userID },
    });
    if (response.success === true) {
      mainStore.setFileLoading(false);
      //this.finalLink = "https://www.youtube.com/watch?v=" + response.url;
      //this.updateUser();
      removeAllFiles();
    } else if (response.success === false) {
      //console.log("response: " + response.message);
    }
  }
}
function scrollToTop(scrollDuration) {
  var scrollStep = -window.scrollY / (scrollDuration / 15),
    scrollInterval = setInterval(function () {
      if (window.scrollY != 0) {
        window.scrollBy(0, scrollStep);
      } else clearInterval(scrollInterval);
    }, 15);
}
function removeAllFiles() {
  // console.log('removeAllFiles!');
  // this.$refs.audioDropzone.removeAllFiles();
  audioData.value = {
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
  videoData.value = {
    title: undefined,
    description: undefined,
    privacyStatus: "public",
    isForChildren: false,
  }
  audioFileIsAdded.value = false;
  acceptDisabled.value = 0;
  uploadDisabled.value = 1;
  filesAdded.value = [];
  filesAddedCount.value = 0;
  discogsLinkTemp.value = undefined;
}
async function startAutoUpload() {
        let data
        if (authenticated) {
          if (user.value.id === autoUploadUser.value) {
              data = {
                userID: user.value.id,
                uploadTemplate: '2',
                privacyStatus: 'unlisted'
              }
          }
          await axios.post("/api/start-auto-upload", { data: data });

        } 
        
}
async function getFileMetadata(filePath) {
  const response = await axios.post(`/api/get-metadata`, {
    filePath: filePath,
  });
  console.log("getFileMetadata response ", response);
}
</script>

<style lang="scss">
@import "../assets/scss/main.scss";

.upload-container {
  position: relative;
  width: 100%;
  padding-top: 4rem;
  height: 100%;
  min-height: calc(100vh - 190px);
  z-index: 9;

  .block-title {
    width: 100%;
    text-align: center;
    margin-bottom: 2rem;

    h3 {
      font-size: 1.5rem;
      font-weight: 300;
      // color: #7a7a7a;
    }
  }

  .block-subtitle {
    width: 100%;
    text-align: center;
    margin-top: 1rem;

    h3 {
      font-size: 1.5rem;
      font-weight: 300;
      color: #7a7a7a;
    }
  }
}

.form-container {
  width: 500px;
  margin: 0 auto;

  .col {
    padding: 10px 12px;
  }
}

.drop-zone-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-top: 15vh;
}

// dropzone

.dropzone {
  font-family: $font-family, Tahoma, Arial, sans-serif;
  position: relative;
  width: 100%;
  border: 3px dashed #dadada !important;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;

  &:hover {
    background: #fff !important;
  }

  .dz-message {
    position: relative;
    // top: 50%;
    // transform: translateY(-70%);
    padding: 100px 0 35px;
    margin: 2rem 0;
    font-size: 1.5rem;
    font-weight: 500;
    letter-spacing: 0px;
    color: #333;

    &:before {
      position: absolute;
      content: "";
      background-image: url("~assets/img/drag-drop.svg");
      background-size: 100%;
      width: 50px;
      height: 60px;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }
    &:after {
      position: absolute;
      content: "aiff, flac, wav, m4a, mp3, wma";
      width: 100%;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      color: #999;
      font-size: 1rem;
      font-weight: 400;
      text-transform: uppercase;
    }
  }

  .dz-preview {
    position: relative;
    display: block !important;
    margin: 0 auto !important;
    min-height: 100px;
    text-align: center;
  }

  .dz-progress,
  .dz-error-message,
  .dz-success-mark,
  .dz-error-mark {
    display: none !important;
  }

  .dz-preview {
    .dz-progress {
      display: none !important;
    }

    &.dz-file-preview .dz-details {
      opacity: 1;
      background: #ffffff;
      color: #000;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-content: center;
      justify-content: center;
    }

    .dz-details .dz-filename {
      order: -1;
      margin-bottom: 20px;

      span {
        font-size: 20px;
      }
    }
  }

  .dz-details,
  .dz-progress,
  .dz-processing,
  .dz-error-message,
  .dz-image,
  .dz-error-mark {
    display: none !important;
  }
}

.audio-dropzone {
  position: relative;
  width: 100%;
  height: 45vh;

  .dropzone {
    padding: 6vh;
  }
}

.cover-dropzone {
  display: none;
  height: 100%;

  &.active {
    display: block;
    // margin-bottom: 2rem;
  }

  &.error {
    border-color: #c83333;
  }

  .dz-message {
    padding: 54px 0 24px;
    font-size: 1.1rem;
    margin: 3.75rem 0;

    &:before {
      width: 24px;
      height: 30px;
    }
    &:after {
      font-size: 0.85rem;
      content: "jpg, png";
    }
  }
}

// dropzone

.cover-wrap {
  position: relative;
  display: block;
  width: 100%;
  height: 270px;
  overflow: hidden;

  .cover-loading {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 9;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.cover-container {
  display: flex;
  justify-content: center;
  width: 100%;
  align-items: center;
  height: 100%;
}

.cover-preview {
  width: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0rem;
  border-radius: 6px;
  border: 2px solid #ffffff;
  // padding: 10px;

  .cover {
    display: block;
    padding: 0;
    background-color: transparent;
    border: none;
    border-radius: 0.25rem;
    width: 100%;
    max-width: 100%;
    height: auto;
    text-align: center;
    //margin: 0 auto;
  }
}

.notfound .form-control {
  color: #c83333;
}

.choose-template {
  &__item {
    display: flex;
    border: 1px solid transparent;
    border-radius: .75rem;
    padding: .5rem;
    cursor: pointer;
    opacity: .5;
    transition: $transition;

    &.active {
      border: 1px solid #989898;
      opacity: 1;
    }

    img {
      width: 100%;
      border-radius: .5rem;
    }
  }
}

.radio-block {
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  width: 100%;
  padding: 0 5rem;

  .v-selection-control-group--inline {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}
.top-tools {
  border: 1px solid #c2c2c2;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  margin-bottom: 2rem;

  .left {
    display: flex;
    color: #333;

    .label {
      font-weight: 600;
      margin-right: 6px;
      color: #111;
    }
  }
  .right {
    display: flex;
    justify-content: flex-end;
    align-items: center;

    & > * {
      margin-left: 1rem;
    }

    .discogs-btn {
      display: flex;
      align-items: center;
      background: rgba(0, 0, 0, 0);
      padding: 0.35rem 0.45rem;
      border-radius: 8px;
      cursor: pointer;
      transition: $transition;

      .icon {
        display: block;
        width: 20px;
        height: 20px;
        margin-right: 4px;
      }
      &:hover {
        background: rgb(243, 243, 243);
      }
    }

    .remove-track {
      display: flex;
      opacity: 0.5;
      cursor: pointer;
      transition: $transition;

      &:hover {
        opacity: 1;
      }
    }
  }
}

.upload-container {
  .final-action-block-wrap {
    position: fixed;
    bottom: 0px;
    left: 0;
    background: transparent;
    width: 100%;
    transition: all 0.25s;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 -0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
    z-index: 999;

    .idmit-group {
      padding: 15px 0px;
      margin-bottom: 0px;
      position: relative;
      bottom: 0;
      display: flex;
      justify-content: center;
    }
  }
}

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}

.spinner-border {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  vertical-align: text-bottom;
  border: 0.25em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  -webkit-animation: spinner-border 0.75s linear infinite;
  animation: spinner-border 0.75s linear infinite;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.2em;
}

.discogs-field {
  display: flex;
  position: relative;
  width: 100%;

  .v-input {
    // width: calc(100% - 90px);
  }
}

.discogs-link {
  // position: absolute;
  // right: 0;
  // top: 0;
  width: 80px;
  height: 56px;
  display: flex;
  align-items: center;
  background: #fff;
  justify-content: center;
  border: 1px solid #999;
  padding: 8px 26px;
  border-radius: 4px;
  margin-left: 0.5rem;
  cursor: pointer;

  &:hover {
    border: 1px solid rgb(80, 80, 80);
  }

  a {
    text-decoration: none;
    font-size: 14px;
    font-weight: 400;
    color: #000;
  }
}

.discogs-field {
  position: relative;
  //width: calc(100% - 85px);
}

//////

.row + .row {
  margin-top: 4px !important;
}

.sidebar-right {
  padding: 1rem 1rem;
  position: fixed;
  background: #fff;
  top: 170px;
  z-index: 99;
  border: 1px solid #e0e0e0;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.10196);
  /* left: 50%; */
  /* transform: translateX(-50%); */
  max-width: 700px;
  width: 450px;
  /* height: 100vh; */
  right: -450px;
  border-radius: 8px;
  transition: $transition;

  .block-title {
    margin-bottom: 2rem;
    h3 {
      font-size: 1.25rem;
      color: #111;
      font-weight: 400;
    }
  }

  .sidebar-close {
    position: absolute;
    top: 1.75rem;
    right: 1rem;
  }

  &.show {
    transform: translateX(-446px);
  }

  .release-data {
    //border: 1px solid #e0e0e0;
    padding: 0.5rem 0;
    border-radius: 6px;
    margin: 1rem 0 0;

    .cover-item {
      position: relative;
      width: 150px;
      margin-bottom: 0.5rem;

      &__label {
        position: absolute;
        top: 0;
        right: -50px;
        width: 40px;
        height: 40px;
        background: rgb(255 255 255);
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 6px;
        border: 1px solid #a1a1a1;
        z-index: 9;
        opacity: 1;
        color: #999;
        transition: $transition;

        &:hover {
          color: #111;
          border: 1px solid rgb(80, 80, 80);
          opacity: 1;
        }
      }

      &__img {
        width: 100%;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0rem;
        border-radius: 6px;
        border: 1px solid #a1a1a1;
        padding: 10px;
        img {
          // width: 150px;
          width: 100%;
        }
      }
    }
  }

  .col {
    padding: 7px 12px;
    display: flex;
  }

  .label {
    font-weight: 600;
    width: 100px;
    flex-basis: 30%;
  }

  .data {
    flex-basis: 70%;
  }
}

.form-group.has-error {
  label {
    color: #dc3545 !important;
  }

  input {
    border: 1px solid #dc3545 !important;
  }
}

.v-input__details {
  display: none!important;
}

</style>
