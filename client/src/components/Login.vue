<template>
  <div class="index-page content content--canvas">
    <div class="main-hero-section">
      <div class="hero-decor" aria-hidden="true">
        <!-- <div class="file-badge file-badge--aiff">
          <img class="file-badge__icon" src="/landing/file-icon-1.svg" alt="" />
        </div>
        <div class="file-badge file-badge--flac">
          <img class="file-badge__icon" src="/landing/file-icon-2.svg" alt="" />
        </div>
        <div class="file-badge file-badge--wav">
          <img class="file-badge__icon" src="/landing/file-icon-3.svg" alt="" />
        </div>
        <div class="file-badge file-badge--mp3">
          <img class="file-badge__icon" src="/landing/file-icon-4.svg" alt="" />
        </div> -->

        <div class="hero-mock hero-mock--laptop">
          <img src="/landing/laptop.png" alt="" />
        </div>
        <div class="hero-mock hero-mock--phone">
          <img src="/landing/phone.png" alt="" />
        </div>
        <!-- <img class="hero-itunes" src="/landing/itunes.png" alt="" /> -->
      </div>

      <div class="hero-content">
        <div class="hero-icons">
          <img src="/audio-b.svg" alt="" />
          <img src="/arrow2.svg" alt="" style="height: 40px;"/>
          <img src="/youtube.svg" alt="" />
        </div>
        <h1 class="hero-title">Show the world your favourite music</h1>
        <h2 class="hero-subtitle">
          A tool to create a YouTube music channel<br />from your local files.
        </h2>
      </div>
      <LoginBtn></LoginBtn>
    </div>
    <div class="mx-auto max-w-[1200px] mt-20">
      <div class="features grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        <div v-for="(item, index) in features" :key="index">
          <div class="features__item text-center" :style="{'animation-delay': delay(index)}">
            <div class="icon">
              <img :src="item.icon" alt="" />
            </div>
            <h3>{{ item.title }}</h3>
            <p>
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
  import { ref } from 'vue'
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
  const canvasWrap = ref(null);
</script>

<style lang="scss" scoped>
@import "../assets/scss/main.scss";
.content {
  display: flex;
  flex-direction: column;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  min-height: 100vh;
  position: relative;
  justify-content: flex-start;
  align-items: center;
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

@keyframes floatY {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-14px);
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
  //background-image: linear-gradient(130deg, #cae8d3 10%, #ecdbdc 96%);
  position: relative;
  /* top: 0; */
  /* left: 0; */
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: #111;
  flex-direction: column;
  padding-top: 10vh;

  .hero-background {
    display: flex;
    justify-content: center;
    left: 0;
    position: absolute;
    right: 0;
    top: 0rem;
    z-index: 1;
    width: 100%;
    height: 100%;
    animation: fadeDown3 4s ease-out;
    animation-fill-mode: forwards;

    video {
      opacity: 0.75;
      -webkit-clip-path: inset(2px 2px);
      clip-path: inset(2px 2px);
    }
    canvas {
      width: 100%;
      height: 100%;
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
    width: 100%;
    padding: 6rem 2rem;
    overflow: hidden;

    .hero-decor {
      position: absolute;
      inset: 0;
      z-index: 0;
      display: none;

      @include for-desktop-up {
        display: block;
      }
    }

    .file-badge {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 45px;
      animation: floatY 3.5s ease-in-out infinite;

      &__icon {
        display: block;
        width: 100%;
      }

      &__tag {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: -19px;
        margin-left: -1px;
        padding: 2px 4px;
        border-radius: 1px;

        img {
          height: 10px;
        }
      }

      &--aiff {
        left: 14.98%;
        top: 19.68%;
        animation-duration: 6s;
        animation-delay: 2s;
      }
      &--flac {
        left: 78.75%;
        top: 16.3%;
        animation-duration: 6s;
        animation-delay: 2s;
      }
      &--wav {
        left: 25.99%;
        top: 77.88%;
        animation-duration: 5.2s;
        animation-delay: 2.2s;
      }
      &--mp3 {
        left: 72.96%;
        top: 71%;
        animation-duration: 5.2s;
        animation-delay: 2.2s;
      }
    }

    .hero-mock {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        display: block;
        max-width: none;
      }

      &--laptop {
        left: -8.55%;
        top: 57.04%;
        width: 28%;
        height: 32.03%;
        animation-duration: 1.4s;
        animation-delay: 0.2s;

        img {
          width: 360px;
          transform: rotate(-12.49deg);
        }
      }

      &--phone {
        left: 92.45%;
        top: 35.13%;
        width: 12.56%;
        height: 30.35%;
        animation-duration: 7.4s;
        animation-delay: 0.2s;

        img {
          width: 130px;
          transform: rotate(11.54deg);
        }
      }
    }

    .hero-itunes {
      position: absolute;
      left: 52.2%;
      top: 85.5%;
      width: 64px;
      height: 64px;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;

      .hero-icons {
        display: flex;
        margin-bottom: 3rem;
        height: 62px;
        align-items: center;
        & > * {
          padding: 1rem;
        }
      }

      .hero-title {
        max-width: 760px;
        margin-bottom: 2rem;
        text-align: center;
        font-family: "Dela Gothic One", $font-family-title, sans-serif;
        font-weight: 400;
        text-transform: uppercase;
        color: #1a1a1a;
        font-size: 2.75rem;
        line-height: 1.1;

        @include for-tablet-portrait-up {
          font-size: 3.25rem;
        }

        @include for-desktop-up {
          font-size: 3.75rem;
          line-height: 4rem;
        }
      }

      .hero-subtitle {
        max-width: 600px;
        text-align: center;
        margin-bottom: 2.5rem;
        font-family: $font-family, sans-serif;
        font-weight: 400;
        font-size: 1.1rem;
        line-height: 1.6;
        color: #1a1a1a;
      }
    }

    :deep(.login-button) {
      position: relative;
      z-index: 1;
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
        display: flex;
        justify-content: center;
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
