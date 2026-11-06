<template>
  <div class="w-full">
    <label v-if="label" class="mb-1 block text-sm font-medium text-gray-700">{{ label }}</label>
    <div class="relative">
      <textarea
        v-if="multiline"
        v-model="model"
        :placeholder="placeholder"
        :rows="rows"
        class="w-full resize-y rounded-lg border bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-gray-900"
        :class="error ? 'border-red-500' : 'border-gray-300'"
      ></textarea>
      <input
        v-else
        :type="type"
        v-model="model"
        :placeholder="placeholder"
        class="w-full rounded-lg border bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-gray-900"
        :class="[error ? 'border-red-500' : 'border-gray-300', clearable && model ? 'pr-9' : '']"
      />
      <!-- <button
        v-if="clearable && model"
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
        @click="model = ''"
      >
        ✕
      </button> -->
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, default: undefined },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: undefined },
  multiline: { type: Boolean, default: false },
  rows: { type: Number, default: 4 },
  error: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
});

const model = defineModel();
</script>
