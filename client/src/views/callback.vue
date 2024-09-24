<template>
<v-container>
  <v-row>
    <v-col>
      <div class="progress-wrap" v-if="showLogging">
        <v-progress-circular
          color="indigo-darken accent-4"
          indeterminate
          rounded
          height="6"
        ></v-progress-circular>

        <div class="progress-status">
          Logging in...
        </div>
      </div>
                
    </v-col>
  </v-row>    
</v-container>
</template>

<script>
    export default {
        data() {
          return {
            showLogging: false
          };
        },
      methods: {
      },
      mounted() {
        setTimeout(() => {
            this.showLogging = true
        }, 1000);
      }
    };
    </script>

<style scoped>

</style>
