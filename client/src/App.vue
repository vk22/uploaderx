

<template>
  <div>
    <Alert />
    <Header />
    <div id="app-container">
      <div class="mx-auto max-w-[1200px]">
        <RouterView />
        <Footer />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useMainStore } from "@/stores/main";
  import { useConnectionStore } from "@/stores/connection";
  import { socket } from "@/socket";
  import Header from './components/Header.vue'
  import Footer from './components/Footer.vue'
  import Alert from './components/Alert.vue'

  const mainStore = useMainStore();
  const connectionStore = useConnectionStore();

  socket.off();

  mainStore.bindEvents();
  connectionStore.bindEvents();

</script>

<style scoped>

</style>
