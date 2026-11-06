<template>
<div class="mx-auto max-w-[1200px]">
  <div class="progress-wrap" v-if="showLogging">
    <Spinner size="lg" color="#3730a3" />

    <div class="progress-status">
      Logging in...
    </div>
  </div>
</div>
</template>

<script>
    import Spinner from "../components/Spinner.vue";
    export default {
        components: { Spinner },
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
