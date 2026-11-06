<template>
  <div class="choose-template grid grid-cols-2 gap-3">
    <div class="col-span-2">
      <div class="block-subtitle">
        Choose video template
      </div>
    </div>
    <div v-for="(template, index) in templates" :key="index">
      <div
        class="choose-template__item"
        @click="$emit('update:modelValue', template.id)"
        :class="{ active: template.id === modelValue }"
      >
        <img :src="template.icon" alt="">
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  templates: { type: Array, default: () => [] },
  modelValue: { type: [String, Number], default: null },
});
defineEmits(["update:modelValue"]);
</script>
