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
        <div class="discogs-btn v-btn-small" @click="discogsHelperWindow">
          <span class="icon discogs-icon"></span>
          Discogs Helper
        </div>
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
      v-model:album="audioData.album"
      v-model:artist="audioData.artist"
      v-model:country="audioData.country"
      v-model:year="audioData.year"
      @close="discogsHelperWindow"
      @search="getDiscogsByReleaseID()"
    ></DiscogsHelperSidebar>

    <!-- Dropzone -->
    <div class="drop-zone-container" v-show="!audioFileIsAdded">
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
      <div>
        <!--- Cover Dropzone-->
        <div class="cover-wrap mb-4">
          <div class="cover-loading" v-if="coverLoading">
            <Spinner size="lg" :color="progressColor" />
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
        </div>
        <div class="mb-4 flex items-center justify-center">
          <Checkbox
            v-model="releaseCoverNeed"
            label="Change cover?"
            v-show="releaseCoverExist"
          ></Checkbox>
        </div>
        <!--- Video Form -->
        <div class="mb-4">
          <TextInput
            v-model="videoData.title"
            clearable
            label="Title"
            type="text"
            :error="inputHasError('title')"
          >
          </TextInput>
        </div>
        <div class="mb-4">
          <TextInput
            v-model="videoData.description"
            multiline
            clearable
            label="Description"
            :error="inputHasError('description')"
          >
          </TextInput>
        </div>

        <div class="mb-4">
          <TextInput
            v-model="videoData.tags"
            clearable
            label="Tags"
            type="text"
            :error="inputHasError('tags')"
          >
          </TextInput>
        </div>
        <VideoTemplatePicker :templates="uploadTemplates" v-model="uploadTemplate" :cover-url="videoData.pictureURL"></VideoTemplatePicker>
        <div class="mb-4 flex items-center justify-start">
          <div class="radio-block">
            <RadioGroup v-model="videoData.privacyStatus" :options="privacyList"></RadioGroup>
          </div>
        </div>

        <div>
          <div class="submit-group">
            <div
              v-if="uploadDisabled == 0 && !fileLoading"
              class="btn btn-upload full-w"
              v-on:click="startUpload"
            >
              Upload track
            </div>
          </div>
        </div>
      </div>
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
import Spinner from "../components/Spinner.vue";
import Checkbox from "../components/Checkbox.vue";
import RadioGroup from "../components/RadioGroup.vue";
import TextInput from "../components/TextInput.vue";
window.process = process;
window.Buffer = Buffer;
const mainStore = useMainStore();
const authStore = useAuthStore();
const authenticated = computed(() => authStore.authenticated);
const user = computed(() => authStore.user);
const uploadingState = computed(() => mainStore.getUploadingState);
const progressColor = computed(() => mainStore.getProgressColor);
const fileLoading = computed(() => mainStore.getFileLoading);

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
