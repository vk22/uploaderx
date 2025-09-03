<template>
  <!-- <div class="alert-background" v-show="alerts.length"> -->
  <TransitionGroup class="alerts-wrap" tag="div" appear name="slide-fade">
    <div
      class="alert-container"
      v-for="alert in alerts"
      :key="alert.id"
      :style="{
        backgroundColor: backgroundColor(alert.variant),
        borderColor: borderColor(alert.variant),
      }"
    >
      <div class="close-alert" @click="close(alert.id)">
        <CloseBtn :strokeWidth="3" :color="color"></CloseBtn>
      </div>
      <div class="alert-message">
        <div class="image">
          <span class="icon discogs-icon"></span>
        </div>
        <div class="message">
          <!-- <div><b>{{ alert.title }}</b></div> -->
          <div>{{ alert.message }}</div>
        </div>
      </div>
    </div>
  </TransitionGroup>
  <!-- </div> -->
</template>    

<script setup>
import { computed, ref } from "vue";
import CloseBtn from "../components/CloseBtn.vue";
import { useMainStore } from "@/stores/main";
const props = defineProps(["uploadingState", "progressColor"]);
const mainStore = useMainStore();
const alerts = computed(() => mainStore.getAlerts);
// const alert = computed(() => mainStore.getAlert);

const color = "#555";
const variations = {
  success: {
    border: "#82d48c",
    background: "#fff",
  },
  info: {
    border: "#b4cdef",
    background: "#fff",
  },
  warning: {
    border: "#1",
    background: "#fff",
  },
  error: {
    border: "#d84e4e",
    background: "#fff",
  },
};

const close = (id) => {
  mainStore.removeAlert({
    active: false,
    id: id,
  });
};
const backgroundColor = (variant) => {
  return variations[variant].background;
};
const borderColor = (variant) => {
  return variations[variant].border;
};
</script>

<style lang="scss">
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.alert-background {
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background: rgba($color: #000000, $alpha: 0.5);
  z-index: 999;
}

.alerts-wrap {
  position: fixed;
  width: 500px;
  left: 50%;
  transform: translateX(-50%);
  top: 1.75rem;
  display: flex;
  z-index: 9999;
  flex-direction: column;
}

.alert-container {
  background: #fef8ea;
  border: 1px solid #f6e1b5;
  color: #252525;
  position: relative;
  max-width: 500px;
  min-width: 500px;
  //transform: translate(-50%, -50%);
  margin: 0 auto; // Without this the box extends the width of the page
  padding: 1rem 3rem 1rem 0.5rem;
  box-shadow: 0px 1px 18px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  font-size: 1rem;
  margin-bottom: 20px;

  .close-alert {
    position: absolute;
    top: 4px;
    right: 10px;
    width: 12px;
    height: 12px;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.3s ease-out;
    svg {
      width: 100%;
      height: 100%;
    }

    &:hover {
      opacity: 1;
    }
  }

  .alert-message {
    display: flex;
    align-items: center;

    .image {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 45px;
      height: 45px;
      flex-basis: 55px;
      .icon {
        display: block;
        width: 35px;
        height: 35px;
      }
    }

    .message {
      flex-basis: 90%;
    }
  }
}
</style>