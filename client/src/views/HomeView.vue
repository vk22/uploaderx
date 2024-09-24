<template>
  <main>
    <Uploader v-if="authenticated"></Uploader>
    <Login v-else></Login>
  </main>
</template>

<script setup>
  import { computed } from "vue";
  import { useAuthStore } from "@/stores/auth";
  const authStore = useAuthStore();
  const authenticated = computed(() => authStore.authenticated);

  import Uploader from '../components/Uploader.vue'
  import Login from '../components/Login.vue'

</script>
