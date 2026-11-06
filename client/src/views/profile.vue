<template>
  <div>
  <div class="user-page" v-if="user">
    <div class="center">
      <div>
        <img :src="user.picture" alt="" class="avatar">
      </div>
      <div>
        <h3>{{ user.name }}</h3>
      </div>
      <div>
          {{ user.id }}
      </div>
      <div>
      <b>Plan:</b> {{ user.plan }}
      </div>
    </div>

    <div v-if="user.uploads">
      <div>
        <b>Uploads Today:</b> {{ user.uploads.length }}
      </div>
    </div>
    <div v-if="user.uploads" class="table-container" role="table" aria-label="Destinations">
        <table class="w-full">
            <thead>
              <tr>
                <th class="p-2 text-left">
                  Title
                </th>
                <th class="p-2 text-left">
                  URL
                </th>
                <th class="p-2 text-left">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in user.uploads"
                :key="index"
              >
                <td class="p-2">{{ item.title }}</td>
                <td class="p-2"><a :href="`https://www.youtube.com/watch?v=${item.url}`" target="_blank">{{ item.url }}</a></td>
                <td class="p-2">{{ new Date(item.date) }}</td>
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
  const loggedIn = computed(() => authStore.authenticated);
  const user = computed(() => authStore.user);

</script>

<style lang="scss">

//@import '~/assets/scss/main.scss';

.user-page {
  position: relative;
  width: 1200px;
  margin: 0 auto;
  color: #111;
  padding-top: 10rem;
  height: 80vh;

  .center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    & > div {
      margin-bottom: .5rem;
    }
  }

  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 100px;
  }

  .table-container {
    background: #fff;
    display: block;
    margin: 2em auto;
    width: 100%;
    border-radius: 2px;
    overflow: hidden;
    box-shadow: 1px 1px 30px #00000019;
  }

}

</style>