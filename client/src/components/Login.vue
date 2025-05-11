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
        <h1 class="hero-title">Smart<br>Music Uploader</h1>
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
@import "../assets/scss/main.scss";
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
    animation: fadeDown3 4s ease-out;
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
    animation: fadeDown 2s ease-out;
    animation-fill-mode: forwards;
    margin-bottom: 10vh;
    padding: 0 10rem;

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
        margin-bottom: 3rem;
        font-size: 7rem;
        text-align: center;
        line-height: 7.5rem;
        font-weight: 800;
        color: #0d0d0d;

        @include for-phone-only {
          font-size: 5.5rem;
          line-height: 5.5rem;
        }

        @include for-tablet-portrait-up {
          font-size: 5.5rem;
          line-height: 5.75rem;
        }

      }

      .hero-subtitle {
        margin-bottom: 3rem;
        text-align: center;
        margin-bottom: 3.5rem;
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
