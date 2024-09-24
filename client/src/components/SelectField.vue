<template>
    <v-select
    :label="label"
    :items="items"
    outlined
    clearable
    v-model="modelData"
    ></v-select>
</template>    

<script>
export default {
  props: ['vModel', 'label', 'items'],
  methods: {},
  computed: {
    modelData: {
        get(){
          return this.vModel
        },
        set(newName){
          return newName
        } 
    }
  }
};
</script>

<style lang="scss">



</style>