import { defineStore } from 'pinia'
import { socket } from "@/socket";
import { useAuthStore } from "@/stores/auth";


export const useMainStore = defineStore('main', {
    state: () => ({
        user: {
            id: 1,
            username: 'Test'
        },
        fileLoading: false,
        uploadingState: undefined,
        progressColor: 'black',
        finalLink: {
            link: undefined,
            error: false
        },
        alert: {
            active: false,
            variant: undefined,
            title: undefined,
            message: undefined,
            timeout: undefined
        },
        alertStack: []
    }),
    actions: {
        bindEvents() {
            // // sync the list of items upon connection
            // socket.on("connect", () => {
            //     socket.emit("fileUploaded", (res) => {
            //         // this.items = res.data;
            //         console.log('fileUploaded ', res.data)
            //     });
            // });

            // // update the store when an item was created
            // socket.on("item:created", (item) => {
            //     this.items.push(item);
            // });


            socket.on("fileUploaded", (data) => {
                const authStore = useAuthStore();
                if (data.userId === authStore.user.id) {
                    console.log('fileUploaded: ', data)
                    this.uploadingState = 'File Uploaded. Converting video...'
                    this.progressColor = 'purple'
                }
            });
            socket.on("videoFileReady", (data) => {
                const authStore = useAuthStore();
                if(data.userId === authStore.user.id) {
                    // console.log('videoFileReady: ', data)
                    this.uploadingState = 'Pushing video to Youtube...'
                    this.progressColor = 'green darken-3'
                  }
            });
            socket.on("pushToYoutube", (data) => {
                const authStore = useAuthStore();
                if(data.userId === authStore.user.id) {
                    // console.log('pushToYoutube: ', data)
                    this.fileLoading = false;
                    if (data.success) {
                        this.finalLink.link = "https://www.youtube.com/watch?v="+data.url;
                    } else {
                        this.finalLink.link = data.message.response.data.error.message
                        this.finalLink.error = true
                    }
                }
            });
        },
        setUploadingState(data) {
            this.uploadingState = data
        },
        setFileLoading(data) {
            this.fileLoading = data
        },

        setUploadingState(data) {
            this.uploadingState = data
        },

        setProgressColor(data) {
            this.progressColor = data
        },

        clearFinalLink() {
            this.finalLink = {
                link: undefined,
                error: false
            }
        },
        setAlert(data) {
            this.alert = data
        },
        addAlert(data) {
            this.alertStack.push(data)
        },
        removeAlert(data) {
            this.alertStack = this.alertStack.filter(el => el.id !== data.id)
        }
    },
    getters: {
        getFileLoading(state) {
            return state.fileLoading
        },
        getUploadingState(state) {
            return state.uploadingState
        },
        getProgressColor(state) {
            return state.progressColor
        },
        getFinalLink(state) {
            return state.finalLink
        },
        getAlert(state) {
            return state.alert
        },
        getAlerts(state) {
            return state.alertStack
        },
        getUser(state) {
            return {
                id: state.user.id,
                picture: state.user.picture,
                plan: state.user.plan,
                uploads: state.user.uploads,
                username: state.user.username,
            }
        }
    }
})