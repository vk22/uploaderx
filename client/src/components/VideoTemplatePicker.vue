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
        <!-- Cover Left: cover on the left third, text-placeholder lines on a black background -->
        <div
          v-if="template.id === 1"
          class="flex aspect-video w-full items-start overflow-hidden rounded-lg bg-black p-3"
        >
          <div class="h-full w-[50%] shrink-0 overflow-hidden bg-white">
            <img v-if="coverUrl" :src="coverUrl" alt="" class="h-full w-full object-cover" />
          </div>
          <div class="flex flex-1 flex-col gap-1.5 pl-10 pt-1 items-end">
            <span class="h-1 w-full rounded bg-white/70"></span>
            <span class="h-1 w-2/3 rounded bg-white/70"></span>
            <span class="h-1 w-1/2 rounded bg-white/50"></span>
          </div>
        </div>
        <!-- Cover Center: cover centered, pillarboxed on a grey background -->
        <div
          v-else-if="template.id === 2"
          class="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-black"
        >
          <div class="h-full w-[55%] overflow-hidden bg-white">
            <img v-if="coverUrl" :src="coverUrl" alt="" class="h-full w-full object-cover" />
          </div>
        </div>
        <div v-else class="aspect-video w-full rounded-lg bg-gray-200"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  templates: { type: Array, default: () => [] },
  modelValue: { type: [String, Number], default: null },
  coverUrl: { type: String, default: undefined },
});
defineEmits(["update:modelValue"]);
</script>
