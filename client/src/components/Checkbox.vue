<template>
  <label class="inline-flex cursor-pointer select-none items-center gap-2">
    <input
      type="checkbox"
      v-model="model"
      class="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
    />
    <span class="text-sm text-gray-700">{{ label }}</span>
  </label>
</template>

<script setup>
defineProps({
  label: { type: String, default: undefined },
});

const model = defineModel({ type: Boolean, default: false });
</script>
