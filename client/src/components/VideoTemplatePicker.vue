<template>
  <v-row class="choose-template">
    <v-col cols="12">
      <div class="block-subtitle">
        Choose video template
      </div>
    </v-col>
    <v-col cols="6" v-for="(template, index) in templates" :key="index">
      <div
        class="choose-template__item"
        @click="$emit('update:modelValue', template.id)"
        :class="{ active: template.id === modelValue }"
      >
        <img :src="template.icon" alt="">
      </div>
    </v-col>
  </v-row>
</template>

<script setup>
defineProps({
  templates: { type: Array, default: () => [] },
  modelValue: { type: [String, Number], default: null },
});
defineEmits(["update:modelValue"]);
</script>
