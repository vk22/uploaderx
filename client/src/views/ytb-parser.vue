<template>
  <div class="youtube-parser-page">
    
    <!-- Loading -->
    <LoadingAndStage
      :uploadingState="uploadingState"
      :progressColor="progressColor"
    ></LoadingAndStage>
    
    <div class="youtube-parser" v-if="user">
      <v-container>
        <div class="block-title text-left">
          <h3>YouTube Parser</h3>
        </div>
        <!-- <div>
          {{ wantlist }}
        </div> -->
        <v-row>
          <v-col>
            <div class="discogs-field">
              <v-text-field
                v-model="playlistLink"
                variant="outlined"
                clearable
                label="Playlist Link"
                type="text"
                style="width:90%"
              >
              </v-text-field>
              <v-text-field
                v-model="separator"
                variant="outlined"
                label="Separator"
                type="text"
                style="width:10%; margin-left: 0.5rem;"
              >
              </v-text-field>
              <div class="discogs-link" @click="searchYtb()">Search</div>
            </div>
          </v-col>
        </v-row>

        <v-row class="search-result-list" v-show="searchYtbResult">
          <v-col v-for="(item, index) in searchYtbResult" :key="index" cols="4">
            <div class="search-result-item">
              <div class="cover-item" v-if="item.coverUri">
                <div class="cover-item__img">
                  <img :src="item.coverUri" alt="" />
                </div>
                <div class="cover-item__plus" v-if="!checkIfReleaseExistInWanlist(item.id)">
                  <v-icon @click="addToWantlist(item.id)">mdi-plus</v-icon>
                </div>
                <div class="cover-item__plus" v-else>
                  <v-icon @click="removeFromWantlist(item.id)">mdi-delete</v-icon>
                </div>
                <!-- <div class="cover-item__exist" v-else>In Wantlist</div> -->
              </div>

              <div class="row mb-3">
                <v-chip :color="item.releaseExist === 'release not exist' ? 'green' : 'red' " class="mr-1" size="small">
                 {{ item.releaseExist }}
                </v-chip>
                <v-chip v-if="item.labelsWarnings" :color="'red'" size="small">
                 dangerous label
                </v-chip>

              </div>
              <div class="row">
                <div class="label">Release ID:</div>
                <div class="data">
                  <a v-bind:href="item.link" target="_blank" class="link">{{
                    item.id
                  }}</a>
                </div>
              </div>
              <div class="row">
                <div class="label">Album:</div>
                <div class="data">{{ item.album }}</div>
              </div>
              <div class="row">
                <div class="label">Artist:</div>
                <div class="data">{{ item.artist }}</div>
              </div>
              <div class="row">
                <div class="label">Country:</div>
                <div class="data">{{ item.country }}</div>
              </div>
              <div class="row">
                <div class="label">Year:</div>
                <div class="data">{{ item.year }}</div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>    

<script setup>
// import { computed, ref } from "vue";
// import { useAuthStore } from "@/stores/auth";
// const authStore = useAuthStore();
// const authenticated = computed(() => authStore.authenticated);
// const user = computed(() => authStore.user);
// const token = computed(() => authStore.token);
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import { useMainStore } from "@/stores/main";
import { useAuthStore } from "@/stores/auth";
import LoadingAndStage from "../components/LoadingAndStage.vue";
const authStore = useAuthStore();
const mainStore = useMainStore();
const loggedIn = computed(() => authStore.authenticated);
const user = computed(() => authStore.user);
const uploadingState = computed(() => mainStore.getUploadingState);
const progressColor = computed(() => mainStore.getProgressColor);

const wantlist = ref([]);
const searchYtbResult = ref("");
const separator = ref('-');
const playlistLink = ref("");
const playlistID = computed(() => playlistID.value.split('=').pop());



const searchYtb = async () => {
  mainStore.setFileLoading(true);
  mainStore.setUploadingState("Parsing Youtube, Discogs, Revibed...");
  mainStore.setProgressColor("red");
 
  const { data, status } = await axios.get("/api/get-playlist-videos", {
    params: { userID: user.value.id, playlistID: playlistID.value, separator: separator.value },
  });
  console.log("searchYtb ", data);
  searchYtbResult.value = data.allItems;

  mainStore.setFileLoading(false);
};


const getWantlist = async (releaseID) => {
  const { data, status } = await axios.get(`/api/get-wantlist`, { 
    params: {  username: 'kushnir' },
  })
  console.log('getWantlist data ', data)
  wantlist.value = data.wants.map(item => item.basic_information.id);
}

const addToWantlist = async (releaseID) => {
  mainStore.setFileLoading(true);
  mainStore.setUploadingState("Adding release to wantlist...");
  mainStore.setProgressColor("green");

  const { data, status } = await axios.post(`/api/add-wantlist`,{ 
    releaseID: releaseID, 
    username: 'kushnir' 
  })
  console.log('data ', data)
  console.log('status ', status)
  // if (status === 200) {
  //     return data
  // }
  mainStore.setFileLoading(false);
  await getWantlist()
}

const removeFromWantlist = async (releaseID) => {
  mainStore.setFileLoading(true);
  mainStore.setUploadingState("Removing release from wantlist...");
  mainStore.setProgressColor("green");

  const { data, status } = await axios.post(`/api/remove-wantlist`,{ 
    releaseID: releaseID, 
    username: 'kushnir' 
  })
  console.log('data ', data)
  console.log('status ', status)
  // if (status === 200) {
  //     return data
  // }
  mainStore.setFileLoading(false);
  await getWantlist()
}

const checkIfReleaseExistInWanlist = (releaseID) => {
  console.log('checkIfReleaseExistInWanlist ', releaseID)
  return wantlist.value.includes(releaseID)
}



onMounted( async () => {
  await getWantlist()
})



</script>

<style lang="scss">
@import "../assets/scss/main.scss";

.youtube-parser-page {
  min-height: 70vh;
}

.youtube-parser {
  margin-top: 9rem;
  padding: 1rem 1rem;
  background: #fff;
  z-index: 99;
  border: 1px solid #e0e0e0;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.10196);
  /* left: 50%; */
  /* transform: translateX(-50%); */
  max-width: 100%;
  // width: 450px;
  // min-height: 80vh;
  border-radius: 8px;
  transition: $transition;

  .search-result-item {
    border: 1px solid #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    font-size: .85rem;

    .cover-item {
      position: relative;
      width: 150px;
      margin-bottom: 1rem;

      &__plus {
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
        img {
          // width: 150px;
          width: 100%;
        }
      }

      &__exist {
        position: absolute;
        top: 0;
        right: -70px;
        width: 60px;
        // height: 40px;
        // background: rgb(255 255 255);
        display: flex;
        justify-content: center;
        align-items: center;
        // border-radius: 6px;
        // border: 1px solid #a1a1a1;
        z-index: 9;
        opacity: 1;
        color: #999;
        font-size: .75rem;
        font-weight: 600;
      }
    }

    .row {
      margin-bottom: .25rem;
      display: flex;
    }
  }

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

  .col {
    padding: 7px 12px;
    display: flex;
  }

  .label {
    font-weight: 600;
    flex-basis: 30%;
  }

  .data {
    flex-basis: 70%;
  }
}
</style>