<template>
    <div >
      <UploadNew2 v-if="$auth.$state.loggedIn"></UploadNew2>
      <Login v-else></Login>
    </div>
</template>

<script>

export default {
  //middleware: 'auth',
    components: {
    },
    data () {
      return {
        message: undefined
      }
    },
    sockets: {

    },
    methods: {

    },
    mounted() {

    }
}
</script>

<style>

</style>
