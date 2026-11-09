<template>
  <div class="sidebar-right bg-[#f8f8f8]" :class="{ show }">
    <div class="sidebar-close">
      <i class="mdi mdi-close cursor-pointer" @click="$emit('close')"></i>
    </div>
    <div>
      <div class="block-title text-left">
        <h3>Discogs Helper</h3>
      </div>
      <div class="mb-4">
        <div class="discogs-field flex items-end">
          <TextInput v-model="discogsLink" label="Link on Release Page" clearable />
          <div class="discogs-link" @click="$emit('search')">
            Search
          </div>
        </div>
      </div>
      <div class="release-data">
        <div class="mb-4">
          <div class="cover-item" v-if="coverUri">
            <div class="cover-item__img">
              <img :src="coverUri" alt="" />
            </div>
            <div class="cover-item__label">
              <i class="mdi mdi-plus cursor-pointer" @click="$emit('search')"></i>
            </div>
          </div>
        </div>
        <div class="mb-4">
          <TextInput v-model="title" label="Track" />
        </div>
        <div class="mb-4">
          <TextInput v-model="artist" label="Artist" />
        </div>
        <div class="mb-4">
          <TextInput v-model="album" label="Album" />
        </div>
        <div class="mb-4">
          <TextInput v-model="country" label="Country" />
        </div>
        <div class="mb-4">
          <TextInput v-model="year" label="Year" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TextInput from "./TextInput.vue";

defineProps({
  show: { type: Boolean, default: false },
  release: { type: Object, default: () => ({ id: null, link: null }) },
  coverUri: { type: String, default: undefined },
});

const discogsLink = defineModel("discogsLink");
const album = defineModel("album");
const title = defineModel("title");
const artist = defineModel("artist");
const country = defineModel("country");
const year = defineModel("year");

defineEmits(["close", "search"]);
</script>
