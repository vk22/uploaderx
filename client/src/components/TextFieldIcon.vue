<template>
    <!-- <v-text-field
    :label="label"
    filled
    rounded
    dense
    v-model="vModel"
    :append-icon="'mdi-map-marker'"
    ></v-text-field> -->
        <v-text-field
      v-model="vModel"
      outlined
      clearable
      :label="label"
      type="text"
    >
    </v-text-field>  
</template>    

<script>
export default {
  props: ['vModel', 'label'],
  methods: {},
};
</script>

<style lang="scss">


</style>