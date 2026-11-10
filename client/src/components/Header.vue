<template>
  <header class="main-header">
    <div class="logo-wrap">
      <router-link to="/"><img src="/uploader-logo.svg" class="logo"/></router-link>
    </div>
    <Dropdown v-if="loggedIn">
      <template #trigger>
        <div class="avatar-wrap cursor-pointer">
          <img :src="user.picture" class="userpic h-full w-full rounded-full" />
        </div>
      </template>
      <template #default="{ close }">
        <router-link
          to="/profile"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          @click="close"
          >Profile</router-link
        >
        <router-link
          v-if="admins.includes(user.id)"
          to="/ytb-parser"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          @click="close"
          >Parser</router-link
        >
        <button
          type="button"
          class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          @click="userLogout($event); close()"
        >
          Logout
        </button>
      </template>
    </Dropdown>
  </header>
</template>

<script setup>
  import { computed } from "vue";
  import { useAuthStore } from "@/stores/auth";
  import Dropdown from "./Dropdown.vue";
  const authStore = useAuthStore();
  const loggedIn = computed(() => authStore.authenticated);
  const user = computed(() => authStore.user);
  const admins = ['102814452894667054158', '104745960371715319263', '105940082211804843973'];
  const userLogout = (event) => {
    event.preventDefault()
    authStore.logout()
  }
</script>


<style lang="scss">

//@import '~/assets/scss/main.scss';

.main-header {
    top: 0;
    z-index: 1;
    position: fixed;
    width: 100%;
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;

  .logo-wrap {
    line-height: .8;
  }

  a {
    color: #212121;
    text-decoration: none;
  }

  .avatar-wrap {
    position: relative;
    width: 36px;
    height: 36px;
    padding: 1px;
  }

  .logo {
    width: 210px;
  }
}
</style>