<template>
  <div class="admin-page">
    <div class="grid grid-cols-2 gap-6">
      <div>
        <div
          v-if="videos.length"
          class="table-container"
          role="table"
          aria-label="Destinations"
        >
          <table class="w-full">
              <tbody>
                <tr v-for="(item, index) in videos" :key="index">
                  <td class="p-2">
                    <a
                      :href="`https://www.youtube.com/watch?v=${item.url}`"
                      target="_blank"
                      >{{ item.url }}</a
                    >
                  </td>
                  <td class="p-2">{{ new Date(item.date).toLocaleDateString("en-US") }}</td>
                </tr>
              </tbody>
          </table>
        </div>
      </div>
      <div>
        <table class="w-full">
              <tbody>
                <tr v-for="(item, index) in users" :key="index">
                  <td class="p-2">
                    <img :src="item.picture" alt="" class="avatar">
                  </td>
                  <td class="p-2">{{ item.username }}</td>
                </tr>
              </tbody>
          </table>
      </div>
    </div>
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