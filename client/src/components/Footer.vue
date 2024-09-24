<template>
  <div class="footer">
    <div class="nav">
      <router-link to="/about">About</router-link> 
      <router-link to="/terms">Terms of Service</router-link> 
      <router-link to="/privacy">Privacy Policy</router-link> 
    </div>
    <div class="logos">
      <img src="/developed-by-youtube.png" alt="">
    </div>
  </div>
</template>    

<script>
export default {
    methods: {
      userLogout(event) {
        event.preventDefault()
        this.$auth.logout()
      }
    },
    computed: {
      loggedIn() {
        return this.$auth.loggedIn
      },
      user() {
        return this.$auth.user
      }
    },
};
</script>

<style lang="scss">

//@import '~/assets/scss/main.scss';

.footer {
    position: relative;
    width: 100%;
    padding: 2rem;
    display: flex;
    align-items: center;
    margin-top: 4rem;
    justify-content: space-between;
    

    .nav {
      display: flex;
      a {
        font-size: .8rem;
        color: #111;
        margin: .25rem;
      }
    }

    .logos {
      img {
        width: 175px;
      }
    }
}



</style>