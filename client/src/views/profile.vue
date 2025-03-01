<template>
  <div class="user-page" v-if="user">
    <v-row>
      <v-col class="center">
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
      </v-col>
    </v-row>
    <v-row v-if="user.uploads">
      <v-col>
        <div>
          <b>Uploads Today:</b> {{ user.uploads.length }}
        </div>
      </v-col>
    </v-row>
    <div v-if="user.uploads" class="table-container" role="table" aria-label="Destinations">
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">
                  Title
                </th>
                <th class="text-left">
                  URL
                </th>
                <th class="text-left">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in user.uploads"
                :key="index"
              >
                <td>{{ item.title }}</td>
                <td><a :href="`https://www.youtube.com/watch?v=${item.url}`" target="_blank">{{ item.url }}</a></td>
                <td>{{ new Date(item.date) }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </div>
  </div>
</template>    

<script setup>
import { computed, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
const authStore = useAuthStore();
const authenticated = computed(() => authStore.authenticated);
const user = computed(() => authStore.user);
const token = computed(() => authStore.token);
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