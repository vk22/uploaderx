
<template>
  <!-- <button @click="login">Login Using Google</button> -->
  <div @click="login()" class="login-button google">
    <span class="login-ic"></span>
    <span class="login-text">Sign in with Google</span>
  </div>
</template>

<script setup>
import { googleSdkLoaded } from "vue3-google-login";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
const authStore = useAuthStore();
const login = () => {
  googleSdkLoaded((google) => {
    google.accounts.oauth2.initCodeClient({
      client_id: '567094205545-j5ed0fqndfju3jnknb7ttn7q11vn5t7f.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/userinfo.profile email profile openid',
      callback: (response) => {
        console.log("Handle the response", response)
        sendCodeToBackend(response.code);
      }
    }).requestCode()
  })
};

async function sendCodeToBackend(code) {
  try {
    const { data } = await axios.post("/api/get-token", {
      code
    });
    console.log('response ', data);
    /// save to store
    authStore.setUser({user: data })
  } catch (error) {
    console.log('sendCodeToBackend ', error.message)
  }

}

</script>
<style lang="scss" scoped>

.login-button {
  align-items: center;
  background-color: #1a1919;
  border: 2px solid #1a1919;
  display: flex;
  height: 62px;
  justify-content: center;
  width: 210px;
  padding-right: 10px;
  cursor: pointer;
  box-shadow: 0px 1px 25px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  transition: all .25s ease-in-out;
  // animation: fadeDown 2s cubic-bezier(0,4,1,4);

  &:hover {
    // border: 2px solid #fff;
    transform: translateY(-2px);
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.25);
  }

  .login-ic {
    position: relative;
    width: 40px;
    height: 40px;
    background-repeat: no-repeat;
    background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIzOHB4IiBoZWlnaHQ9IjM4cHgiIHZpZXdCb3g9IjAgMCAzOCAzOCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4gICAgICAgIDx0aXRsZT5BcnRib2FyZDwvdGl0bGU+ICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPiAgICA8ZyBpZD0iQXJ0Ym9hcmQiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPiAgICAgICAgPGcgaWQ9ImJ0bl9nb29nbGVfZGFya19ub3JtYWxfaW9zIj4gICAgICAgICAgICA8ZyBpZD0iYnV0dG9uLWJnLWNvcHkiPiAgICAgICAgICAgICAgICA8cmVjdCBpZD0icGF0aC0zIiB4PSIwIiB5PSIwIiB3aWR0aD0iMzgiIGhlaWdodD0iMzgiIHJ4PSIxIj48L3JlY3Q+ICAgICAgICAgICAgPC9nPiAgICAgICAgICAgIDxnIGlkPSJsb2dvX2dvb2dsZWdfNDhkcCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAuMDAwMDAwLCAxMC4wMDAwMDApIj4gICAgICAgICAgICAgICAgPHBhdGggZD0iTTE3LjY0LDkuMjA0NTQ1NDUgQzE3LjY0LDguNTY2MzYzNjQgMTcuNTgyNzI3Myw3Ljk1MjcyNzI3IDE3LjQ3NjM2MzYsNy4zNjM2MzYzNiBMOSw3LjM2MzYzNjM2IEw5LDEwLjg0NSBMMTMuODQzNjM2NCwxMC44NDUgQzEzLjYzNSwxMS45NyAxMy4wMDA5MDkxLDEyLjkyMzE4MTggMTIuMDQ3NzI3MywxMy41NjEzNjM2IEwxMi4wNDc3MjczLDE1LjgxOTU0NTUgTDE0Ljk1NjM2MzYsMTUuODE5NTQ1NSBDMTYuNjU4MTgxOCwxNC4yNTI3MjczIDE3LjY0LDExLjk0NTQ1NDUgMTcuNjQsOS4yMDQ1NDU0NSBaIiBpZD0iU2hhcGUiIGZpbGw9IiM0Mjg1RjQiPjwvcGF0aD4gICAgICAgICAgICAgICAgPHBhdGggZD0iTTksMTggQzExLjQzLDE4IDEzLjQ2NzI3MjcsMTcuMTk0MDkwOSAxNC45NTYzNjM2LDE1LjgxOTU0NTUgTDEyLjA0NzcyNzMsMTMuNTYxMzYzNiBDMTEuMjQxODE4MiwxNC4xMDEzNjM2IDEwLjIxMDkwOTEsMTQuNDIwNDU0NSA5LDE0LjQyMDQ1NDUgQzYuNjU1OTA5MDksMTQuNDIwNDU0NSA0LjY3MTgxODE4LDEyLjgzNzI3MjcgMy45NjQwOTA5MSwxMC43MSBMMC45NTcyNzI3MjcsMTAuNzEgTDAuOTU3MjcyNzI3LDEzLjA0MTgxODIgQzIuNDM4MTgxODIsMTUuOTgzMTgxOCA1LjQ4MTgxODE4LDE4IDksMTggWiIgaWQ9IlNoYXBlIiBmaWxsPSIjMzRBODUzIj48L3BhdGg+ICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0zLjk2NDA5MDkxLDEwLjcxIEMzLjc4NDA5MDkxLDEwLjE3IDMuNjgxODE4MTgsOS41OTMxODE4MiAzLjY4MTgxODE4LDkgQzMuNjgxODE4MTgsOC40MDY4MTgxOCAzLjc4NDA5MDkxLDcuODMgMy45NjQwOTA5MSw3LjI5IEwzLjk2NDA5MDkxLDQuOTU4MTgxODIgTDAuOTU3MjcyNzI3LDQuOTU4MTgxODIgQzAuMzQ3NzI3MjczLDYuMTczMTgxODIgMCw3LjU0NzcyNzI3IDAsOSBDMCwxMC40NTIyNzI3IDAuMzQ3NzI3MjczLDExLjgyNjgxODIgMC45NTcyNzI3MjcsMTMuMDQxODE4MiBMMy45NjQwOTA5MSwxMC43MSBaIiBpZD0iU2hhcGUiIGZpbGw9IiNGQkJDMDUiPjwvcGF0aD4gICAgICAgICAgICAgICAgPHBhdGggZD0iTTksMy41Nzk1NDU0NSBDMTAuMzIxMzYzNiwzLjU3OTU0NTQ1IDExLjUwNzcyNzMsNC4wMzM2MzYzNiAxMi40NDA0NTQ1LDQuOTI1NDU0NTUgTDE1LjAyMTgxODIsMi4zNDQwOTA5MSBDMTMuNDYzMTgxOCwwLjg5MTgxODE4MiAxMS40MjU5MDkxLDAgOSwwIEM1LjQ4MTgxODE4LDAgMi40MzgxODE4MiwyLjAxNjgxODE4IDAuOTU3MjcyNzI3LDQuOTU4MTgxODIgTDMuOTY0MDkwOTEsNy4yOSBDNC42NzE4MTgxOCw1LjE2MjcyNzI3IDYuNjU1OTA5MDksMy41Nzk1NDU0NSA5LDMuNTc5NTQ1NDUgWiIgaWQ9IlNoYXBlIiBmaWxsPSIjRUE0MzM1Ij48L3BhdGg+ICAgICAgICAgICAgICAgIDxwb2x5Z29uIGlkPSJTaGFwZSIgcG9pbnRzPSIwIDAgMTggMCAxOCAxOCAwIDE4Ij48L3BvbHlnb24+ICAgICAgICAgICAgPC9nPiAgICAgICAgPC9nPiAgICA8L2c+PC9zdmc+);
    background-size: 100%;
    background-position: center center;
  }
  .login-text {
    color: #fff;
    font-weight: 500;
  }
}

</style>