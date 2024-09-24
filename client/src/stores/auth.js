import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authenticated: false,
    loading: false,
    user: undefined,
    token: undefined
  }),
  actions: {
    async setUser({user, token}) {
      // console.log('setUser ', user)
      // console.log('setUser ', token)
      this.authenticated = true
      this.user = user
      // this.token = token
      
      //const { response } = await axios.post('/api/login', {user: user});

    },
    async logout() {
      // const token = useCookie('token'); // useCookie new hook in nuxt 3
      // this.authenticated = false; // set authenticated  state value to false
      // token.value = null; // clear the token cookie
      const { data } = await axios.post('/api/logout', this.user);
      console.log('data ', data)
      if (data.success) {
        this.authenticated = false
        this.user = undefined
      }
    },
    async checkUserTokens() {
      const response = await axios.get('/api/check-user-tokens', this.user);
      console.log('checkUserTokens ', response)
    }
    
  },
  persist: true
});
