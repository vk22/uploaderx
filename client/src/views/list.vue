<template>
  <div class="admin">
    <div class="admin-container">
      <div class="table-container" role="table" aria-label="Destinations">
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">
                  User
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
                v-for="(item, index) in items"
                :key="index"
              >
                <td>{{ item.userID }}</td>
                <td><a :href="`https://www.youtube.com/watch?v=${item.url}`" target="_blank">{{ item.url }}</a></td>
                <td>{{ item.date }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </div>
    </div>
    <!-- <Login v-else></Login> -->
  </div>
</template>

<script>

export default {
  name: "IndexPage",
  data() {
    return {
      items: null,
    };
  },
  methods: {
    async getVideos() {
      const response = await this.$axios.get(`/get-video-list/`);
      console.log("response ", response.data);
      this.items = response.data.items;
    },
    logout() {
      this.$cookies.remove('tokenLocal');
      window.location.reload(true)
    }
  },
  mounted() {
    this.getVideos();
  },
  created() {},
  computed: {
    user() {
      return this.$store.getters.getUser;
    },
  },
};
</script>

<style lang="scss">
@import "assets/scss/main.scss";

$table-header: #282828;
$table-header-border: #282828;
$table-border: #d9d9d9;
$row-bg: #f4f2f1;


.admin {
  position: relative;
  background: #ffffff;
}

.admin-container {
  position: relative;
  width: 1200px;
  margin: 0 auto;
  color: #111;
  padding-top: 5rem;
}

.logout{
  position: fixed;
  top: 2rem;
  right: 2rem;
  cursor: pointer;
  background: #ededed;
  border-radius: 2px;
  padding: .5rem 1rem;
  transition: all .15s ease-in-out;

  &:hover {
    background: #e6e6e6;
  }
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

.flag-icon {
  margin-right: 0.1em;
}

.flex-table {
  display: flex;
  flex-flow: row wrap;
  border-left: solid 1px $table-border;
  transition: 0.5s;
  &:first-of-type {
    border-top: solid 1px $table-header-border;
    border-left: solid 1px $table-header-border;
  }
  &:first-of-type .flex-row {
    background: $table-header;
    color: white;
    border-color: $table-header-border;
  }
  &.row:nth-child(odd) .flex-row {
    background: $row-bg;
  }
  &:hover {
    background: #F5F5F5;
    transition: 500ms;
  }
}

.flex-row {
  width: calc(100% / 4);
  text-align: center;
  padding: 0.5em 0.5em;
  border-right: solid 1px $table-border;
  border-bottom: solid 1px $table-border;
}

.rowspan {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: center;
}

.column {
  display: flex;
  flex-flow: column wrap;
  width: 75%;
  padding: 0;
  .flex-row {
    display: flex;
    flex-flow: row wrap;
    width: 100%;
    padding: 0;
    border: 0;
    border-bottom: solid 1px $table-border;
    &:hover {
      background: #F5F5F5;
      transition: 500ms;
    }
  }
}

.flex-cell {
  width: calc(100% / 3); //1px = border right
  text-align: center;
  padding: 0.5em 0.5em;
  border-right: solid 1px $table-border;
  //flex: 1 1 33.3%;
  &:last-child {
    // border-right: 0;
  }
}

@media all and (max-width: 767px) {
  .flex-row {
    width: calc(100% / 3); //1px = border right
    
   &.first {
     width: 100%;
   }
  }

  .column {
    width: 100%;
  }
}

@media all and (max-width: 430px) {
  
  .flex-table {
    .flex-row {
      border-bottom: 0;
    }
    .flex-row:last-of-type {
      border-bottom: solid 1px $table-border;
    }
  }
  
  .header {
    .flex-row {
      border-bottom: solid 1px;
    }
  }
  
  .flex-row {
    width: 100%; //1px = border right
    
   &.first {
     width: 100%;
     border-bottom: solid 1px $table-border;
   }
  }

  .column {
    width: 100%;
    .flex-row {
      border-bottom: solid 1px $table-border;
    }
  }

  .flex-cell {
    width: 100%; //1px = border right
  }
}
</style>
