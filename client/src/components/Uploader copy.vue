<template>
  <div class="upload-container" v-bind:class="{ show: isShow }">
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
                outlined
                clearable
                label="Link on Release Page"
                type="text"
              >
              </v-text-field>
              <div
                class="discogs-link"
                @click="getDiscogsByReleaseID()"
              >
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
                    <img :src="audioData.coverUri" alt="">
                  </div>
                  <div class="cover-item__label">
                    <v-icon  @click="getDiscogsByReleaseID()">mdi-plus</v-icon>
                    <!-- <span>Use this cover</span> -->
                  </div>

              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="label">Release ID</div>
              <div class="data">
                <a v-bind:href="audioData.discogsRelease.link" target="_blank" class="link">{{ audioData.discogsRelease.id }}</a>
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
    <!-- <div class="drop-zone-container" v-show="!audioFileIsAdded">
      <div class="block-title">
        <h3 @click="startAutoUpload()">Upload your audio file</h3>
      </div>
      <div class="audio-dropzone">
        <vue-dropzone
          v-show="!fileLoading"
          ref="audioDropzone"
          id="dropzone"
          :options="dropzoneOptions"
          v-on:vdropzone-drop="fileDrop"
          v-on:vdropzone-file-added="fileAdded"
          @vdropzone-complete="afterComplete"
        ></vue-dropzone>
      </div>
    </div> -->
    <!-- Dropzone -->

    <div class="form-container" v-show="audioFileIsAdded">
      <div class="block-title">
        <h3>Your video details</h3>
      </div>
      <v-row>
        <!-- Col R -->
        <v-col>
          <!--- Cover Dropzone-->
          <!-- <v-row>
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
                  <img v-bind:src="videoData.pictureURL" class="cover" />
                </div>
              </div>
              <div
                class="form-group cover-dropzone"
                v-bind:class="{
                  active: releaseCoverNeed && !coverLoading,
                  error: inputHasError('cover'),
                }"
              >
                <vue-dropzone
                  ref="coverDropzone"
                  id="dropzone2"
                  :options="dropzoneOptionsCover"
                  v-on:vdropzone-file-added="coverAdded"
                  @vdropzone-complete="afterComplete"
                ></vue-dropzone>
              </div>
            </v-col>
          </v-row> -->
          <v-row>
            <v-col class="d-flex justify-center align-center tools-block">
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
                outlined
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
                outlined
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
                outlined
                clearable
                label="Tags"
                type="text"
                :error="inputHasError('tags')"
              >
              </v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <v-select
                label="Template"
                :items="uploadTemplatesOptions"
                outlined
                clearable
                v-model="uploadTemplate"
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col
              class="d-flex justify-start align-center tools-block"
              cols="8"
            >
              <v-radio-group v-model="videoData.privacyStatus" row>
                <v-radio
                  v-for="(option, index) in privacyList"
                  :key="index"
                  :label="option.name"
                  :value="option.value"
                ></v-radio>
              </v-radio-group>
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
                  :disabled="uploadDisabled == 1 ? true : false"
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

<script>
import * as mm from "music-metadata-browser";
// import Dropzone from "nuxt-dropzone";
// import "nuxt-dropzone/dropzone.css";

export default {
  // middleware: ['auth'],
  name: "UploaderComp",
  components: {
    // vueDropzone: Dropzone,
  },
  data() {
    return {
      autoUploadUser: '109411733370124122052',
      // user: undefined,
      kxURL: "https://kollektivx.com/",
      description:
        "KollektivX music community - offers tools to archive rare records and other sought after sounds before they vanish. Created and being run by music enthusiasts it aims to preserve and revitalize less known music that wasn't issued digitally.",
      socketMessage: "",
      isShow: false,
      formDataAudio: null,
      formDataCover: null,
      formDataAll: null,
      videoData: {
        title: undefined,
        description: undefined,
        tags: undefined,
        privacyStatus: "public",
        isForChildren: false,
        pictureFormat: undefined,
        pictureURL: undefined,
      },
      privacyList: [
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
        },
      ],
      audioData: {
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
      },
      privacyStatus: false,
      uploadTemplate: undefined,
      uploadTemplateOptions: ["CoverCenter", "KX", "CoverLeft"],
      hasError: false,
      audioFileIsAdded: false,
      histrackExist: false,
      uploadPercentage: 0,
      uploadingStateOnChange: false,
      newOrders: "",
      releaseCoverExist: false,
      releaseCoverNeed: false,
      dropzoneOptions: {
        autoProcessQueue: false,
        url: "localhost",
        maxFilesize: 50,
        uploadMultiple: false,
        maxFiles: 1,
        timeout: 180000,
        dictDefaultMessage: "Choose your audio or drag&drop",
        acceptedFiles: "audio/aiff, audio/flac, audio/wav, audio/aif",
        addRemoveLinks: true,
        accept: function (file, done) {
          // console.log('accept: '+file);
          if (file.type !== "audio/aiff" || file.type !== "audio/flac") {
            done("Error! Files of this type are not accepted");
          } else {
            done();
          }
        },
        init: function () {
          this.on("maxfilesreached", function (file) {
            // console.log('maxfilesreached: '+file);
            this.removeAllFiles();
            // this.addFile(file);
          });
        },
      },
      dropzoneOptionsCover: {
        autoProcessQueue: false,
        url: "localhost",
        maxFilesize: 50,
        uploadMultiple: false,
        maxFiles: 1,
        timeout: 180000,
        dictDefaultMessage: "Choose image or drag&drop",
        acceptedFiles: "image/*",
        addRemoveLinks: true,
        accept: function (file, done) {
          // console.log('accept: '+file);
          if (file.type != "image/*") {
            done("Error! Files of this type are not accepted");
          } else {
            done();
          }
        },
        init: function () {
          this.on("maxfilesreached", function (file) {
            // console.log('maxfilesreached: '+file);
            this.removeAllFiles();
            // this.addFile(file);
          });
        },
      },
      coverLoading: false,
      uploadDisabled: 1,
      isOpen: false,
      filesAdded: [],
      filesAddedCount: 0,
      changeCover: false,
      discogsLinkTemp: undefined,
      //discogsReleaseIDTemp: undefined,
      inputErrors: [],
      releaseCoverIsUploaded: false,
      fieldsFromDiscogs: [],
      cover_version: 1,
      discogsHelperWindowShow: false,
      iconColor: "#000",
    };
  },
  beforeRouteLeave(to, from, next) {
    //this.checkIfOrderEmpty()
    clearInterval(this.t);
    next();
  },
  methods: {
    async getMyVideos() {
      const data = {
        access_token: this.token.access_token, 
        expiry_date: this.token.expiry_date, 
        refresh_token: this.token.refresh_token, 
        token_type: this.token.token_type
      }
      await this.$axios.$post("/videos-last", {data: data});
    },
    async startAutoUpload() {
        let data
        if (this.$auth.loggedIn) {
          if (this.$auth.user.sub === this.autoUploadUser) {
              data = {
              userID: this.user.id,
              uploadTemplate: 'CoverCenter',
              privacyStatus: 'public',
              access_token: this.token.access_token, 
              expiry_date: this.token.expiry_date, 
              refresh_token: this.token.refresh_token, 
              token_type: this.token.token_type
            }
          }
          await this.$axios.$post("/start-auto-upload", {data: data});

        } else {
          data = {
            userID: 'test',
            uploadTemplate: 'KX',
            privacyStatus: 'public',
            access_token: '', 
            expiry_date: '', 
            refresh_token: '', 
            token_type: '', 
          }
        }
        
      // } else {
      //   console.log('not permitted')
      // }

    },
    checkIfFileValid(file) {
      if (
        file.type !== "audio/mpeg" &&
        file.type !== "audio/aiff" &&
        file.type !== "audio/aif" &&
        file.type !== "audio/flac" &&
        file.type !== "audio/wav" &&
        file.type !== "audio/x-aiff" &&
        file.type !== "audio/x-wav"
      ) {
        alert("Wrong file type");
        this.removeAllFiles();
        return false;
      } else {
        return true;
      }
    },
    fileDrop() {
      this.$store.commit("setFileLoading", true);
      this.$store.commit(
        "setUploadingState",
        "Parsing file... Parsing Discogs..."
      );
      //console.log("fileDrop", this.fileLoading);
    },
    async fileAdded(file) {
      if (!this.checkIfFileValid(file)) {
        this.$store.commit("setFileLoading", false);
        return;
      }

      //// Filename
      this.audioData.filename = file.name.replace(/['"#]+/g, "");

      //// Create FormData Object
      this.formDataAll = new FormData();
      this.formDataAll.append("audioFile", file);

      const metadata = await mm.parseBlob(file);

      this.audioData.title = metadata.common.title
        ? metadata.common.title
        : undefined;
      this.audioData.artist = metadata.common.artist
        ? metadata.common.artist
        : undefined;
      this.audioData.album = metadata.common.album
        ? metadata.common.album
        : undefined;
      this.audioData.country = metadata.common.country
        ? metadata.common.country
        : undefined;
      this.audioData.year = metadata.common.year
        ? metadata.common.year
        : undefined;
      // this.audioData.lossless = metadata.format.lossless;
      // this.audioData.duration = this.secondsToMinutes(metadata.format.duration);
      // this.audioData.bitrate = this.bitrateConvert(metadata.format.bitrate);
      // this.audioData.size = +(file.size/1000000).toFixed(1);
      this.audioFileIsAdded = true;

      //// Get Cover From File
      this.releaseCoverExist = await this.getCoverFromFile(metadata);
      console.log('this.releaseCoverExist ', this.releaseCoverExist)

      /// Get Discogs
      if (metadata) {
        const title = this.audioData.title
          ? this.audioData.title.split(" ")
          : undefined;
        const artist = this.audioData.artist
          ? this.audioData.artist.split(" ")
          : undefined;
        const album = this.audioData.album
          ? this.audioData.album.split(" ")
          : undefined;
        const query = this.generateQuery(title, artist);
        const coverNeed = !this.releaseCoverExist 
        const firstResponseToDiscogs = query
          ? await this.getDiscogs( { album, artist, title }, coverNeed )
          : undefined;
        this.afterDiscogsRequest(firstResponseToDiscogs);
      }

      this.uploadDisabled = 0;
      this.$store.commit("setFileLoading", false);
      this.$store.commit("setUploadingState", undefined);
    },
    async getDiscogs(data, сoverNeed) {
      const userID = this.$auth.loggedIn ? this.user.id : "test";
      return await this.$axios.$post("/getdiscogs", { data: data, user: userID, сoverNeed: сoverNeed });
    },
    async getDiscogsByReleaseID() {
      this.inputErrors = [];
      this.$store.commit("setFileLoading", true);
      const userID = this.$auth.loggedIn ? this.user.id : "test";

      if (this.discogsLinkTemp) {
        const arr = this.discogsLinkTemp.split("/");
        const releaseIndex = arr.indexOf("release");
        if (releaseIndex < 0) {
          console.log("Incorrect link");
          alert("Incorrect link")
        } else {
          const idIndex = releaseIndex + 1;
          const id = arr[idIndex].split("-")[0];
          const response = await this.$axios.$post("/getdiscogs2", {
            releaseID: id,
            user: userID,
          });
          // console.log("response ", response);

          this.afterDiscogsRequest(response, "allFields");
          setTimeout(() => {
            this.$store.commit("setFileLoading", false);
          }, 1000);
        }
      }
    },
    afterDiscogsRequest(response, type) {
      console.log("response ", response);
      if (response) {
        if (response.success) {
          this.audioData.discogsRelease = {
            link: response.data.release.link,
            id: response.data.release.discogs_release,
          };
          this.discogsLinkTemp = response.data.release.link;
          if (type === "allFields") {
            this.setAllField(response.data.release, response.data.cover);
          } else {
            this.setEmptyField(response.data.release, response.data.cover);
          }

          const errors = response.data.errors
            ? response.data.errors.reduce(
                (acc, item) => (acc += `${item.type}, `),
                "Errors: "
              )
            : "";

          const message = this.fieldsFromDiscogs.length
            ? `We analyzed your file and added data from Discogs: ${this.fieldsFromDiscogs.join(
                ", "
              )}`
            : `We checked Discogs database. There's no new data.\n ${errors}`;

          this.uploaderHelper({
            active: true,
            variant: "success",
            title: "Tags helper:",
            message: message,
          });
        } else {
          this.uploaderHelper({
            active: true,
            variant: "warning",
            title: "Tags helper:",
            message:
              "Nothing found, mate! It seems, that your music is very rare.",
          });
        }
      } else {
        this.uploaderHelper({
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
        this.audioData.artist,
        this.audioData.title,
        this.audioData.country,
        this.audioData.year
      );
      if (
        this.audioData.artist &&
        this.audioData.title &&
        this.audioData.country &&
        this.audioData.year
      ) {
        this.videoData.title = `${this.audioData.artist} - ${this.audioData.title} (${this.audioData.country}, ${this.audioData.year})`;
      } else if (
        this.audioData.artist &&
        this.audioData.title &&
        this.audioData.country &&
        !this.audioData.year
      ) {
        this.videoData.title = `${this.audioData.artist} - ${this.audioData.title} (${this.audioData.country})`;
      } else if (
        this.audioData.artist &&
        this.audioData.title &&
        !this.audioData.country &&
        this.audioData.year
      ) {
        this.videoData.title = `${this.audioData.artist} - ${this.audioData.title} (${this.audioData.year})`;
      } else if (
        this.audioData.artist &&
        this.audioData.title &&
        !this.audioData.country &&
        !this.audioData.year
      ) {
        this.videoData.title = `${this.audioData.artist} - ${this.audioData.title}`;
      } else if (
        this.audioData.artist &&
        !this.audioData.title &&
        !this.audioData.country &&
        !this.audioData.year
      ) {
        this.videoData.title = `${this.audioData.artist}`;
      } else if (
        !this.audioData.artist &&
        this.audioData.title &&
        !this.audioData.country &&
        !this.audioData.year
      ) {
        this.videoData.title = `${this.audioData.title}`;
      } else if (
        this.audioData.artist &&
        !this.audioData.title &&
        this.audioData.country &&
        this.audioData.year
      ) {
        this.videoData.title = `${this.audioData.artist} - XXXXXXXXX (${this.audioData.country}, ${this.audioData.year})`;
      } else {
        this.videoData.title = ``;
      }

      if (
        this.audioData.album &&
        this.audioData.discogsRelease.link
      ) {
        this.videoData.description = `Album: ${this.audioData.album}\n${this.audioData.discogsRelease.link}`;
      } else if (
        this.audioData.album &&
        !this.audioData.discogsRelease.link
      ) {
        this.videoData.description = `Album: ${this.audioData.album}`;
      } else {
        this.videoData.description = ``;
      }

      //this.checkInputsOnErrors()
    },
    setEmptyField(data, cover) {
      console.log('setEmptyField ', data)
      this.fieldsFromDiscogs = [];
      for (const [key, value] of Object.entries(this.audioData)) {
        //console.log(`setTrackField ${key}: ${value}`);
        if (!value && data[key]) {
          this.audioData[key] = data[key];
          this.fieldsFromDiscogs.push(key);
        }
      }
      if (cover) {
        this.cover_version = this.cover_version + 1;
        this.videoData.pictureURL = cover + "?version=" + this.cover_version;
        if (this.videoData.pictureURL) {
          this.releaseCoverNeed = false;
          this.releaseCoverExist = true;
          this.changeCover = false;
        }
      }

    },
    setAllField(release, cover) {
      console.log("setAllField ", release, cover);
      this.fieldsFromDiscogs = [];
      for (const [key, value] of Object.entries(this.audioData)) {
        //console.log(`setTrackField ${key}: ${value}`);
        if (release[key]) {
          this.audioData[key] = release[key];
          this.fieldsFromDiscogs.push(key);
        }
      }
      if (cover) {
        this.cover_version = this.cover_version + 1;
        this.videoData.pictureURL = cover + "?version=" + this.cover_version;
        if (this.videoData.pictureURL) {
          this.releaseCoverNeed = false;
          this.releaseCoverExist = true;
          this.changeCover = false;
        }
        this.formDataAll.delete("coverFile");
      }
    },
    getCoverFromFile(metadata) {
      return new Promise((resolve, reject) => {
        if (metadata.common.title !== undefined) {
          this.audioData.covername = metadata.common.title.replace(/['"# ]+/g, "");
        }
        if (metadata.common.picture !== undefined) {

          if (metadata.common.picture[0].format !== "") {
            this.audioData.picture = {
              format: metadata.common.picture[0].format,
              data: metadata.common.picture[0].data,
            };
            const url =
              "data: " +
              this.videoData.pictureFormat +
              ";base64," +
              this.audioData.picture.data.toString("base64");
            let self = this;
            this.generateFileFromURL(
              url,
              this.user.id + ".jpg",
              "image/jpg",
              self
            ).then(function (file) {
              /// Cover FormData
              self.formDataAll.append("coverFile", file);
            });
            this.videoData.pictureURL = url;
            resolve(true);
          } else {
            this.audioData.picture = {
              format: "",
              data: "",
            };
            this.releaseCoverNeed = true;
            resolve(false);
          }
        } else {
          this.videoData.pictureURL = undefined;
          this.videoData.pictureFormat = undefined;
          this.releaseCoverNeed = true;

          resolve(false);
        }
      })
    },
    generateFileFromURL(url, filename, mimeType) {
      return fetch(url)
        .then(function (res) {
          return res.arrayBuffer();
        })
        .then(function (buf) {
          return new File([buf], filename, { type: mimeType });
        });
    },
    async coverAdded(file) {
      this.coverLoading = true;
      this.releaseCoverNeed = false;
      //console.log("coverAdded ", JSON.stringify(file));
      //console.log("file.type: " + file.type);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        this.videoData.pictureURL = reader.result;
        this.$refs.coverDropzone.removeAllFiles();

        setTimeout(() => {
          this.releaseCoverExist = true;
          this.coverLoading = false;
          this.changeCover = false;
        }, 1000);
      };

      // const formDataCover = new FormData();
      // formDataCover.append("filename", file);

      this.formDataAll.delete("coverFile");
      this.formDataAll.append("coverFile", file);

      //console.log('formDataCover ', formDataCover)
      // this.formDataCover = formDataCover;
    },
    // async checkUser() {
    //   //console.log ('checkUser ', this.$auth.user)
    //   var username = this.$auth.user.name;
    //   var sub = this.$auth.user.sub;
    //   var picture = this.$auth.user.picture;
    //   var email = this.$auth.user.email;
    //   //console.log('this.$auth.$state ', username)
    //   const response = await this.$axios.$post("/checkuser", {
    //     sub: sub,
    //     username: username,
    //     picture: picture,
    //     email: email,
    //   });
    //   //console.log("response ", response.user.picture);
    //   if (response.user) {
    //     this.user = response.user;
    //   } else {
    //     //console.log("smth wrong this user");
    //   }

    //   //this.show = true
    // },
    async updateUser() {
      //console.log ('checkUser ', this.$auth.user)
      this.user.uploads = [
        this.audioData.title,
        this.audioData.artist,
        this.audioData.discogsRelease.link,
      ];
      const response = await this.$axios.$put("/update-user-uploads", {
        user: this.user,
      });
      //console.log("response ", response.msg);
      //this.response = response.msg
    },
    checkInputsOnErrors() {
      this.inputErrors = [];
      if (!this.videoData.title || this.videoData.title === "") {
        this.inputErrors.push("title");
      }
      // if (!this.videoData.artist || this.videoData.artist === "") {
      //   this.inputErrors.push('artist')
      // }
      if (!this.videoData.pictureURL || this.videoData.pictureURL === undefined) {
        this.inputErrors.push("cover");
      }
    },
    startUpload() {
      //console.log('startUpload ', this.releaseCoverIsUploaded)

      this.checkInputsOnErrors();
      if (this.inputErrors.length) return;

      this.$store.commit("setFileLoading", true);
      this.$store.commit("setUploadingState", "Uploading file...");
      this.$store.commit("setProgressColor", "red");

      this.uploadeFiles();
    },
    async uploadeFiles() {
      // const artist = this.audioData.artist != undefined ? this.audioData.artist : "";
      // const trackTitle = this.audioData.title != undefined ? this.audioData.title : "";
      // const country = this.audioData.country != undefined ? this.audioData.country : "";
      // const year = this.audioData.year != undefined ? ", " + this.audioData.year : "";
      // const title = artist + " - " + trackTitle + " (" + country + year + ")";
      // const description = (this.uploadTemplate == "KX") ? this.kxURL + "\n\n" + this.description : "Album: " + this.audioData.album + "\n" + this.audioData.discogsRelease.link;

      const title = this.videoData.title;
      const description = this.videoData.description;
      const tags = this.videoData.tags;
      const cover = this.videoData.pictureURL;
      const privacyStatus = this.videoData.privacyStatus;

      if (!this.inputErrors.length) {
        this.scrollToTop(500);
        //this.audioFileIsAdded = false;
        const userID = this.$auth.loggedIn ? this.user.id : "test";
        this.formDataAll.append("user", userID);
        this.formDataAll.append("title", title);
        this.formDataAll.append("description", description);
        this.formDataAll.append("tags", tags);
        this.formDataAll.append("privacyStatus", privacyStatus);
        this.formDataAll.append("uploadTemplate", this.uploadTemplate);
        /// `${this.audioData.artist} - ${this.audioData.title} (${this.audioData.country}, ${this.audioData.year})`
        if (this.audioData.title) {
          this.formDataAll.append("audioTitle", this.audioData.title);
        }
        if (this.audioData.title) {
          this.formDataAll.append("audioArtist", this.audioData.artist);
        }
        if (this.audioData.country && this.audioData.year) {
          this.formDataAll.append("audioCountryYear", `(${this.audioData.country}, ${this.audioData.year})`);
        }
        if (this.audioData.country && !this.audioData.year) {
          this.formDataAll.append("audioCountryYear", `(${this.audioData.country})`);
        }
        if (!this.audioData.country && this.audioData.year) {
          this.formDataAll.append("audioCountryYear", `(${this.audioData.year})`);
        }

        if (this.$auth.loggedIn) {
          //console.log("this.token ", this.token);
          this.formDataAll.append("access_token", this.token.access_token);
          this.formDataAll.append("expiry_date", this.token.expiry_date);
          this.formDataAll.append("refresh_token", this.token.refresh_token);
          // this.formDataAudio.append('scope', this.token.scope)
          this.formDataAll.append("token_type", this.token.token_type);
        }

        if (this.releaseCoverIsUploaded) {
          this.formDataAll.append("releaseCoverIsUploaded", cover);
        }

        const response = await this.$axios.$post(
          "/upload-file/",
          this.formDataAll,
          { params: { user: userID } }
        );
        if (response.success === true) {
          this.$store.commit("setFileLoading", false);
          //this.finalLink = "https://www.youtube.com/watch?v=" + response.url;
          //this.updateUser();
          this.removeAllFiles();
        } else if (response.success === false) {
          //console.log("response: " + response.message);
        }
      }
    },
    scrollToTop(scrollDuration) {
      var scrollStep = -window.scrollY / (scrollDuration / 15),
        scrollInterval = setInterval(function () {
          if (window.scrollY != 0) {
            window.scrollBy(0, scrollStep);
          } else clearInterval(scrollInterval);
        }, 15);
    },
    clearForma() {},
    removeAllFiles() {
      // console.log('removeAllFiles!');
      this.$refs.audioDropzone.removeAllFiles();
      this.audioData = {
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
      (this.videoData = {
        title: undefined,
        description: undefined,
        privacyStatus: "public",
        isForChildren: false,
      }),
        (this.audioFileIsAdded = false);
      this.fileInDropzone = 0;
      this.acceptDisabled = 0;
      this.uploadDisabled = 1;
      this.filesAdded = [];
      this.filesAddedCount = 0;
      this.discogsLinkTemp = undefined;
    },
    afterComplete(file) {
      this.filesAdded.push(file);
      //this.filesAddedCount = this.filesAdded.length
    },

    generateQuery(title, artist) {
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
    },

    inputHasError(field) {
      return this.inputErrors.includes(field);
    },
    secondsToMinutes(time) {
      return Math.floor(time / 60) + ":" + Math.floor(time % 60);
    },
    bitrateConvert(bits) {
      return Math.floor(bits / 1000);
    },
    testAlert() {
      const message = `There was plenty of data on your file, but we got something from Discogs`;
      this.uploaderHelper({
        active: true,
        variant: "success",
        title: "Tags helper:",
        message: message,
      });
    },
    uploaderHelper(data) {
      data.id = new Date().getTime();
      setTimeout(() => {
        this.$store.commit("addAlert", data);
      }, 500);
      if (data.active) {
        //console.log('data ', data.message.length)
        setTimeout(() => {
          this.$store.commit("removeAlert", {
            id: data.id,
          });
        }, data.message.length * 85);
      }
    },
    discogsHelperWindow() {
      this.discogsHelperWindowShow = !this.discogsHelperWindowShow;
    },
  },
  mounted() {

    setTimeout(
      function () {
        // console.log('isShow')
        this.isShow = true;
      }.bind(this),
      400
    );
  },
  computed: {
    user() {
      return this.$store.getters.getUser;
    },
    fileLoading() {
      return this.$store.getters.getFileLoading;
    },
    finalLink() {
      return this.$store.getters.getFinalLink;
    },
    progressColor() {
      return this.$store.getters.getProgressColor;
    },
    uploadingState() {
      return this.$store.getters.getUploadingState;
    },
    state() {
      return JSON.stringify(this.$auth.$state, undefined, 2);
    },
    token() {
      //console.log('this.$auth.strategy.token.get() ', this.$auth.strategy.token.get())
      var accessToken = this.$auth.getToken("google").substring(7);
      var refreshToken = this.$auth.getRefreshToken("google");
      //var expiration = localStorage.getItem("auth._token_expiration.google")
      // this.expired = localStorage.getItem("auth._token_expiration.google")
      // this.expiredFormated = new Date(+this.expired).toLocaleString()
      var token = {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "Bearer",
        //"expiry_date": this.expired
      };
      return token;
    },
    uploadTemplatesOptions() {
      let data
      if (this.user) {
        if (this.user.id === this.autoUploadUser) {
          data = ["CoverCenter", "CoverLeft", "KX"]
          this.uploadTemplate = "CoverCenter"
        } else {
          data = ["CoverCenter", "CoverLeft"]
          this.uploadTemplate = "CoverCenter"
        }
      } else {
        data = ["CoverCenter", "CoverLeft", "KX"]
        this.uploadTemplate = "CoverCenter"
      }

      return data
    }
  },
  created() {
    //this.$axios.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken')
    //window.addEventListener('beforeunload', this.checkIfOrderEmpty)
  },
  watch: {
    filesAddedCount: function (val) {
      //console.log("filesAddedCount val: " + val);
      if (val > 1) {
        setTimeout(
          function () {
            alert("Only one file can upload");
            this.removeAllFiles();
          }.bind(this),
          800
        );
      }
    },
  },
};
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
      font-size: 1.75rem;
      font-weight: 300;
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

.tools-block {
  height: 60px;
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
  padding: relative;
  width: 100%;

  .dropzone {
    padding: 6vh;
  }
}

.cover-dropzone {
  display: none;

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
}

.cover-preview {
  width: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0rem;
  border-radius: 6px;
  border: 1px solid #a1a1a1;
  padding: 10px;

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

.top-tools {
  border: 1px solid #e0e0e0;
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
        background: rgba(0, 0, 0, 0.1);
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
  box-shadow: 0 0 20px rgba(0,0,0,0.10196);
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
    padding: .5rem 0;
    border-radius: 6px;
    margin: 1rem 0 0;

    .cover-item {
      position: relative;
      width: 150px;
      margin-bottom: .5rem;

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
</style>
