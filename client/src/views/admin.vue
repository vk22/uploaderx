<template>
  <div class="admin-page">
    <v-row>
      <v-col>
        <div
          v-if="videos.length"
          class="table-container"
          role="table"
          aria-label="Destinations"
        >
          <v-table>
              <tbody>
                <tr v-for="(item, index) in videos" :key="index">
                  <td>
                    <a
                      :href="`https://www.youtube.com/watch?v=${item.url}`"
                      target="_blank"
                      >{{ item.url }}</a
                    >
                  </td>
                  <td>{{ new Date(item.date).toLocaleDateString("en-US") }}</td>
                </tr>
              </tbody>
          </v-table>
        </div>
      </v-col>
      <v-col> 
        <v-table>
              <tbody>
                <tr v-for="(item, index) in users" :key="index">
                  <td>
                    <img :src="item.picture" alt="" class="avatar">
                  </td>
                  <td>{{ item.username }}</td>
                </tr>
              </tbody>
          </v-table>
      </v-col>
    </v-row>
  </div>
</template>    

<script setup>
import axios from "axios";
import { computed, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
const authStore = useAuthStore();
const authenticated = computed(() => authStore.authenticated);
const user = computed(() => authStore.user);
const token = computed(() => authStore.token);

const getUsers = await axios.get("/api/users");
const users = getUsers.data.users;
console.log('users ', users[0])

const getVideos = await axios.get("/api/videos");
const videos = getVideos.data.videos;
</script>

<style lang="scss">
//@import '~/assets/scss/main.scss';

.admin-page {
  position: relative;
  width: 1200px;
  margin: 0 auto;
  color: #111;
  padding-top: 10rem;

  .center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    & > div {
      margin-bottom: 0.5rem;
    }
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 100px;
  }

  .table-container {
    // background: #fff;
    // display: block;
    // margin: 2em auto;
    // width: 100%;
    // border-radius: 2px;
    // overflow: hidden;
    // box-shadow: 1px 1px 30px #00000019;
  }
}
</style>