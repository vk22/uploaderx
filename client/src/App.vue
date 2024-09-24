

<template>
  <v-app>
    <Alert />
    <Header />
    <div id="app-container">
      <v-container>
        <RouterView />
      <Footer />
      </v-container>
    </div>
  </v-app>  
  
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
