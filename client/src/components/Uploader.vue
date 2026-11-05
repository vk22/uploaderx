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
    <DiscogsHelperSidebar
      :show="discogsHelperWindowShow"
      v-model:discogs-link="discogsLinkTemp"
      :release="audioData.discogsRelease"
      :cover-uri="audioData.coverUri"
      :album="audioData.album"
      :artist="audioData.artist"
      :country="audioData.country"
      :year="audioData.year"
      @close="discogsHelperWindow"
      @search="getDiscogsByReleaseID()"
    ></DiscogsHelperSidebar>

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
          <VideoTemplatePicker :templates="uploadTemplates" v-model="uploadTemplate"></VideoTemplatePicker>
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
import { computed } from "vue";
import { useMainStore } from "@/stores/main";
import { useAuthStore } from "@/stores/auth";
import FileUploader from "../components/FileUploader.vue";
import DiscogsHelperSidebar from "../components/DiscogsHelperSidebar.vue";
import VideoTemplatePicker from "../components/VideoTemplatePicker.vue";
import LoadingAndStage from "../components/LoadingAndStage.vue";
import RemoveBtn from "../components/RemoveBtn.vue";
import * as process from "process";
import { Buffer } from "buffer";
import useUploadFormData from '../composables/useUploadFormData'
import useAudioFile from '../composables/useAudioFile'
import useDiscogsLookup from '../composables/useDiscogsLookup'
import useVideoUpload from '../composables/useVideoUpload'
import useAutoUpload from '../composables/useAutoUpload'
window.process = process;
window.Buffer = Buffer;
const mainStore = useMainStore();
const authStore = useAuthStore();
const authenticated = computed(() => authStore.authenticated);
const user = computed(() => authStore.user);
const uploadingState = computed(() => mainStore.getUploadingState);
const progressColor = computed(() => mainStore.getProgressColor);

const formDataController = useUploadFormData();
const {
  audioData,
  audioFileIsAdded,
  isValidAudioFile,
  parseAudioFile,
  extractCoverFromMetadata,
  removeAllFiles: removeAudioFile,
} = useAudioFile({ formData: formDataController });

const {
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
  privacyList,
  coverAdded,
  startUpload,
  resetVideoData,
} = useVideoUpload({
  user,
  audioData,
  formData: formDataController,
  onReset: () => removeAllFiles(),
});

const {
  discogsLinkTemp,
  discogsHelperWindowShow,
  toggleDiscogsHelperWindow: discogsHelperWindow,
  fieldsFromDiscogs,
  generateQuery,
  getDiscogs,
  getDiscogsByReleaseID: searchDiscogsByReleaseID,
  afterDiscogsRequest,
} = useDiscogsLookup({
  user,
  audioData,
  videoData,
  releaseCoverNeed,
  releaseCoverExist,
  changeCover,
  formData: formDataController,
});

const { autoUploadUser, startAutoUpload } = useAutoUpload({ authenticated, user });

async function fileAdded(file) {
  if (!isValidAudioFile(file)) {
    alert("Wrong file type");
    removeAllFiles();
    mainStore.setFileLoading(false);
    return;
  }

  mainStore.setFileLoading(true);
  mainStore.setUploadingState("Parsing file... Parsing Discogs...");

  const metadata = await parseAudioFile(file);
  if (metadata) {
    const { coverExists, coverDataUrl } = await extractCoverFromMetadata(metadata);
    releaseCoverExist.value = coverExists;
    releaseCoverNeed.value = !coverExists;
    videoData.value.pictureURL = coverDataUrl;

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
async function getDiscogsByReleaseID() {
  inputErrors.value = [];
  await searchDiscogsByReleaseID();
}
function removeAllFiles() {
  removeAudioFile();
  resetVideoData();
  discogsLinkTemp.value = undefined;
}
</script>

<style lang="scss">
@import "../assets/scss/uploader";
</style>
