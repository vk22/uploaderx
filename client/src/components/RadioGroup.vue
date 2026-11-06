<template>
  <div class="flex flex-wrap items-center gap-4">
    <label
      v-for="option in options"
      :key="option.value"
      class="inline-flex cursor-pointer select-none items-center gap-2"
    >
      <input
        type="radio"
        :value="option.value"
        v-model="model"
        class="h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-900"
      />
      <span class="text-sm text-gray-700">{{ option.name }}</span>
    </label>
  </div>
</template>

<script setup>
defineProps({
  options: { type: Array, default: () => [] },
});

const model = defineModel();
</script>
