<template>
  <div class="sidebar-right" :class="{ show }">
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
      <div class="release-data" v-show="release.id">
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
          <div class="label">Release ID</div>
          <div class="data">
            <a
              v-bind:href="release.link"
              target="_blank"
              class="link"
              >{{ release.id }}</a
            >
          </div>
        </div>
        <div class="mb-4">
          <div class="label">Album</div>
          <div class="data">{{ album }}</div>
        </div>
        <div class="mb-4">
          <div class="label">Artist</div>
          <div class="data">{{ artist }}</div>
        </div>
        <div class="mb-4">
          <div class="label">Country</div>
          <div class="data">{{ country }}</div>
        </div>
        <div class="mb-4">
          <div class="label">Year</div>
          <div class="data">{{ year }}</div>
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
  album: { type: String, default: undefined },
  artist: { type: String, default: undefined },
  country: { type: String, default: undefined },
  year: { type: [String, Number], default: undefined },
});

const discogsLink = defineModel("discogsLink");

defineEmits(["close", "search"]);
</script>
