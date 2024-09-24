<template>
  <div>
    <div class="progress-wrap" v-if="fileLoading">
      <v-progress-circular
        v-if="fileLoading"
        :color="progressColor"
        indeterminate
        rounded
        height="6"
      ></v-progress-circular>

      <div class="progress-status" v-if="fileLoading">
        {{ uploadingState }}
      </div>
    </div>
    <div class="final-screen" v-if="finalLink.link != undefined">

      <div class="close-screen" @click="clearFinalLink()">
        <CloseBtn :strokeWidth="1" :color="color"></CloseBtn>
      </div>

      <div class="final-link">
        <div
          v-if="finalLink.error"
          class="final-link__link error-request"
          v-html="finalLink.link"
        ></div>
        <a
          v-else
          :href="finalLink.link"
          target="_blank"
          class="final-link__link"
          >{{ finalLink.link }}</a
        >
      </div>
    </div>
  </div>
</template>    

<script setup>
import { computed, ref } from "vue";
import CloseBtn from "../components/CloseBtn.vue";
import { useMainStore } from "@/stores/main";
const props = defineProps(['uploadingState', 'progressColor']);
const mainStore = useMainStore();
const finalLink = computed(() => mainStore.getFinalLink);
const fileLoading = computed(() => mainStore.getFileLoading);
const clearFinalLink = () => {
  mainStore.clearFinalLink(true);
}

</script>

<script>
export default {
  props: ['uploadingState', 'progressColor'],
  data() {
    return {
      color: '#000000'
    }
  },
  methods: {
    clearFinalLink() {
      this.$store.commit("clearFinalLink", true);
    }
  },
  computed: {
    finalLink() {
      return this.$store.getters.getFinalLink;
    },
    fileLoading() {
      return this.$store.getters.getFileLoading
    },
  }
};
</script>

<style lang="scss">

.progress-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: hsla(0, 0%, 100%, 0.85);
  height: 100%;
  z-index: 998;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .spinners {
    margin-bottom: 40px;
  }

  .spinners svg {
    width: 40px;
    height: 40px;
  }

  .progress-status {
    font-size: 1.25rem;
    margin-top: 1rem;
    color: #212121;
    opacity: 1;
    transform: translateY(0px);
    transition: all 0.45s ease-in;

    &.onchange {
      transform: translateY(10px);
      opacity: 0;
    }
  }

  .progress {
    border-radius: 20px;
    height: 25px;
  }
}

.final-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: #fff;
  height: 100%;
  z-index: 9998;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .close-screen {
    position: absolute;
    right: 2rem;
    top: 2rem;  
    z-index: 999;
    width: 50px;
    cursor: pointer;
  }

  .final-link {
    display: flex;
    justify-content: center;
    padding: 0 5%;

    &__link {
      font-size: 40px;
      // border-bottom: 2px solid #2E7D32;
      color: #333 !important;
      // text-decoration: none;
      // justify-content: center;
      // align-items: center;
      text-align: center;
      // padding: 0 10%;

      &.error-request {
        background: none;
        color: red !important;
        border-bottom: none;
        text-align: center;

        a {
          color: red !important;

          &:hover {
            text-decoration: none;
            color: red !important;
          }
        }
      }

      &:hover {
        text-decoration: none;
        border-bottom: none;
      }
    }
  }

}


</style>