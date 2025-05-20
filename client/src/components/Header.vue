<template>
      <header class="main-header">
      <div class="logo-wrap">
        <router-link to="/"><img src="/uploader-logo-b.png" class="logo"/></router-link>
      </div>   
      <v-spacer></v-spacer>
        <v-menu v-if="loggedIn">
          <template v-slot:activator="{ props }">
            <div class="avatar-wrap"
              v-bind="props">
                <img :src="user.picture" class="userpic" rounded="circle"/>
            </div>
          </template>
          <v-list>
            <v-list-item to="/profile">Profile</v-list-item>
            <v-list-item to="/ytb-parser">Parser</v-list-item>
            <v-list-item @click="userLogout">Logout</v-list-item>
          </v-list>
        </v-menu>

    
    </header>
</template>   

<script setup>
  import { computed } from "vue";
  import { useAuthStore } from "@/stores/auth";
  const authStore = useAuthStore();
  const loggedIn = computed(() => authStore.authenticated);
  const user = computed(() => authStore.user);
  console.log('user ', user)

  const userLogout = (event) => {
    event.preventDefault()
    authStore.logout()
  }

</script>


<style lang="scss">

//@import '~/assets/scss/main.scss';

.main-header {
    z-index: 1;
    position: fixed;
    width: 100%;
    padding: 2rem;
    display: flex;
    align-items: center;

  .logo-wrap {
    line-height: .8;
  }
  
  a {
    color: #212121;
    text-decoration: none;

  }
  .v-toolbar__title {
    font-size: 1rem;
    font-weight: 600;
  }

  .username {
    margin-right: 10px;
    cursor: pointer;
    color: #fff;
  }

  .avatar-wrap {
    position: relative;
    width: 36px;
    height: 36px;
    padding: 1px;
    // background-image: url('./assets/img/avatar-wrap.svg');
    // background-repeat: no-repeat;
    // background-position: 50%;
    // background-size: 100%;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }

  .v-avatar {
    width: 30px;

    img{
      //border: 2px solid #ff9800!important;
    }
  }

// .border-gradient {
//   border: 10px solid;
//   border-image-slice: 1;
//   border-width: 2px;
// }
// .border-gradient-purple {
//   border-image-source: linear-gradient(to left, #743ad5, #d53a9d);
// }

  
  .logo {
    width: 170px;
  }
}

// .navbar {
//     padding: 0.5rem 1.5rem;
//     box-shadow: none;
//     border-bottom: 1px solid #dadada;
// }

// .navbar-nav {
//   align-items: center;
//   position: relative;
// }

// .username {
//   margin-right: 10px;
//   cursor: pointer;
// }

// .userpic {
//   cursor: pointer;
// }

// .slide-fade-enter-active {
//   transition: all .3s ease;
// }
// .slide-fade-leave-active {
//   transition: all .2s ease;
// }
// .slide-fade-enter { 
//   transform: translateY(5px);
//   opacity: 0;
// }
// .slide-fade-leave-to {
//   transform: translateY(5px);
//   opacity: 0; 
// }

// .dropdown-profile-menu {
//   background: #ffffff;
//   position: absolute;
//   right: -13px;
//   top: 45px;
//   padding: 5px 10px;
//   border-radius: 0;
// }

// .dropdown-profile-menu:before {
//   content: "";
//   display: block;
//   position: absolute;
//   top: -11px;
//   right: 20px;
//   vertical-align: middle;
//   content: "";
//   border-left: 8px solid transparent;
//   border-right: 8px solid transparent;
//   border-bottom: 10px solid rgba(57, 70, 78, 0.15);
//   border-style: none double solid;
//   width: 0;
//   height: 0;
// }

// .dropdown-profile-menu:after {
//   content: "";
//   display: block;
//   position: absolute;
//   top: -10px;
//   right: 20px;
//   vertical-align: middle;
//   content: "";
//   border-left: 8px solid transparent;
//   border-right: 8px solid transparent;
//   border-bottom: 10px solid #fff;
//   border-style: none double solid;
//   width: 0;
//   height: 0;
// }  

// .dropdown-profile-menu .list-group {
//   text-align: left;
//   padding: 10px 0;
// }

// .dropdown-profile-menu .list-group .list-group-item{
//   border: none;
//   padding: 0.25rem 1.25rem;
// }

// .dropdown-profile-menu .list-group .list-group-item a, .dropdown-profile-menu .list-group .list-group-item span { 
//   font-size: 15px;
//   color: #333;
//   cursor: pointer;
// }

// .dropdown-profile-menu .list-group .list-group-item span:hover {
//   background: #ebebeb;
// }



</style>