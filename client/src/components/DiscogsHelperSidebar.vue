<template>
  <div class="sidebar-right" :class="{ show }">
    <div class="sidebar-close">
      <v-icon left @click="$emit('close')">mdi-close</v-icon>
    </div>
    <v-container>
      <div class="block-title text-left">
        <h3>Discogs Helper</h3>
      </div>
      <v-row>
        <v-col>
          <div class="discogs-field">
            <v-text-field
              v-model="discogsLink"
              variant="outlined"
              clearable
              label="Link on Release Page"
              type="text"
            >
            </v-text-field>
            <div class="discogs-link" @click="$emit('search')">
              Search
            </div>
          </div>
        </v-col>
      </v-row>
      <div class="release-data" v-show="release.id">
        <v-row>
          <v-col>
            <div class="cover-item" v-if="coverUri">
              <div class="cover-item__img">
                <img :src="coverUri" alt="" />
              </div>
              <div class="cover-item__label">
                <v-icon @click="$emit('search')">mdi-plus</v-icon>
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="label">Release ID</div>
            <div class="data">
              <a
                v-bind:href="release.link"
                target="_blank"
                class="link"
                >{{ release.id }}</a
              >
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="label">Album</div>
            <div class="data">{{ album }}</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="label">Artist</div>
            <div class="data">{{ artist }}</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="label">Country</div>
            <div class="data">{{ country }}</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="label">Year</div>
            <div class="data">{{ year }}</div>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script setup>
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
