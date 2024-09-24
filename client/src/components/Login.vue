<template>
  <div class="index-page content content--canvas">
    <div class="hero-background">
      <video
        playsinline=""
        autoplay="autoplay"
        muted="muted"
        loop="loop"
        class="fullscreen"
      >
        <source src="/gradient.webm" type="video/webm" />
      </video>
    </div>
    <div class="main-hero-section">
      <div class="hero-content">
        <div class="hero-icons">
          <img src="/audio-b.svg" alt="" />
          <img src="/arrow.svg" alt="" />
          <img src="/youtube.svg" alt="" />
        </div>
        <h1 class="hero-title">Smart Music Uploader</h1>
        <h2 class="hero-subtitle">
          A tool to create a YouTube music channel<br />from your local files.
        </h2>
      </div>
      <!-- <div @click="login()" class="login-button google">
        <span class="login-ic"></span>
        <span class="login-text">Sign in with Google</span>
      </div> -->
      <LoginBtn></LoginBtn>
    </div>
    <v-container>
      <v-row class="features">
        <v-col v-for="(item, index) in features" :key="index">
          <div class="features__item text-center" :style="{'animation-delay': delay(index)}">
            <div class="icon">
              <img :src="item.icon" alt="" />
            </div>
            <h3>{{ item.title }}</h3>
            <p>
              {{ item.description }}
            </p>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <!-- <canvas id="canv"></canvas> -->
  </div>
</template>


<script setup>
  import LoginBtn from '../components/LoginBtn.vue'
  const features = [
        {
          icon: "audio.svg",
          title: "All audio file formats",
          description:
            "UploaderX works with all audio file formats, you don't need to prepare the file before uploading, just drop it in the upload area.",
        },
        {
          icon: "tags.svg",
          title: "ID3 Tags analyzer",
          description:
            "UploaderX analyzes the ID3 tags of the uploaded files and get all the necessary: artist name, song title, genres, cover, etc. You can then edit or add your own.",
        },
        {
          icon: "template.svg",
          title: "Custom design templates",
          description: "You can choose what your final video will look like.",
        },
        {
          icon: "upload.svg",
          title: "Fast upload and safety",
          description:
            "Fast upload and video on your channel! UploaderX has no access to your password, all authentication is done using the YouTube API. ",
        },
    ]
    const delay = (i) => {
      return 0.1 + i/10 + 's'
    }
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: calc(100vh - 13rem);
  position: relative;
  justify-content: flex-start;
  align-items: center;
  height: 100vh;
  justify-content: center;
}

@keyframes fadeDown {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(1);
  }

  50% {
    opacity: 0;
    transform: translateY(10px) scale(1);
  }

  100% {
    opacity: 1;
    transform: translateY(0px) scale(1);
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(1.15);
  }

  to {
    opacity: 1;
    transform: translateY(0px) scale(1);
  }
}

@keyframes fadeDown2 {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(1);
  }

  50% {
    opacity: 0;
    transform: translateY(10px) scale(1);
  }

  100% {
    opacity: 1;
    transform: translateY(0px) scale(1);
  }
}

@keyframes fadeDown3 {
  0% {
    opacity: 0;
    transform: translateY(0px) scale(1);
  }

  50% {
    opacity: 0;
    transform: translateY(10px) scale(1);
  }

  100% {
    opacity: 1;
    transform: translateY(0px) scale(1);
  }
}

.index-page {
  background: transparent;
  position: relative;
  /* top: 0; */
  /* left: 0; */
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: #111;
  flex-direction: column;
  margin-top: 10vh;

  .hero-background {
    display: flex;
    justify-content: center;
    left: 0;
    position: absolute;
    right: 0;
    top: 0rem;
    z-index: 1;
    height: 500px;
    animation: fadeDown3 5s ease-out;
    animation-fill-mode: forwards;

    video {
      opacity: 0.75;
      -webkit-clip-path: inset(2px 2px);
      clip-path: inset(2px 2px);
    }
  }

  .main-hero-section {
    position: relative;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    z-index: 999;
    animation: fadeDown 1.25s ease-out;
    animation-fill-mode: forwards;
    margin-bottom: 10vh;

    .hero-content {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;

      .hero-icons {
        display: flex;
        margin-bottom: 3rem;
        height: 62px;
        & > * {
          padding: 1rem;
        }
      }

      .hero-title {
        margin-bottom: 1rem;
        font-size: 3.75rem;
        text-align: center;
        line-height: 4.5rem;
        font-weight: 700;
      }

      .hero-subtitle {
        margin-bottom: 3rem;
        text-align: center;
        margin-bottom: 5rem;
      }
    }

    .login-button {
      align-items: center;
      background-color: #fff;
      border: 2px solid #e5e5e5;
      display: flex;
      height: 54px;
      justify-content: center;
      width: 210px;
      padding-right: 10px;
      cursor: pointer;
      box-shadow: 0px 1px 25px rgba(0, 0, 0, 0.1);
      // animation: fadeDown 2s cubic-bezier(0,4,1,4);

      &:hover {
        border: 2px solid #ccc;
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
        color: #757575;
        font-weight: 500;
      }
    }
  }
  .features {
    position: relative;
    z-index: 999;
    &__item {
      opacity: 0;
      animation: fadeDown2 1.5s ease-out;
      animation-fill-mode: forwards;
      .icon {
        margin-bottom: 1rem;
        color: #111;
      }
      h3 {
        margin-bottom: 0.5rem;
        color: #111;
      }
      p {
        font-size: 0.95rem;
        padding: 0 1rem;
      }
    }
  }
}
</style>
