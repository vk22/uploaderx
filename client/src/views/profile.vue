<template>
  <div class="user-page" v-if="user">
    <v-row>
      <v-col>
        <div>
          <b>Username:</b> {{ user.username }}
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
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
    <div class="table-container" role="table" aria-label="Destinations">
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

<script>
export default {
    methods: {

    },
    computed: {
      loggedIn() {
        return this.$auth.loggedIn
      },
      user() {
        return this.$store.getters.getUser;
      }
    },
};
</script>

<style lang="scss">

//@import '~/assets/scss/main.scss';

.user-page {
  position: relative;
  width: 1200px;
  margin: 0 auto;
  color: #111;
  padding-top: 10rem;

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