<template>
  <div ref="rootRef" class="relative">
    <div @click="open = !open">
      <slot name="trigger"></slot>
    </div>
    <div
      v-if="open"
      class="absolute right-0 top-full z-50 mt-2 min-w-[160px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
    >
      <slot :close="() => (open = false)"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const open = ref(false);
const rootRef = ref(null);

function handleClickOutside(event) {
  if (rootRef.value && !rootRef.value.contains(event.target)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onUnmounted(() => document.removeEventListener("click", handleClickOutside));
</script>
