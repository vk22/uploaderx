<template>
  <span
    class="inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
    :class="sizeClass"
    :style="color ? { color } : undefined"
  ></span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  size: { type: String, default: "md" }, // sm | md | lg
  color: { type: String, default: undefined },
});

const sizeClass = computed(() => ({
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
}[props.size] || "h-8 w-8"));
</script>
