<template>
  <UploadNew2></UploadNew2>
</template>

<script>

export default {
    components: {

    },
    data () {
      return {
        message: undefined
      }
    },
    sockets: {
        connect: function () {
            console.log('socket connected')
        },
        customEmit: function (data) {
            console.log('this method was fired by the socket server. eg: io.emit("customEmit", data)')
        }
    },
    methods: {
        clickButton: function (data) {
            // $socket is socket.io-client instance
            this.$socket.emit('createMessage', {id: 10, msg: 'hi!'})
            
            // this.sockets.subscribe('SOCKET_newMessage', (data) => {
            //     this.message = data.message;
            // });
        }
    },
    mounted() {
      this.$socket.on('newMessage', data => {
                console.log('listen fired')
                console.log(data);

            });
    }
}
</script>

<style>

</style>
