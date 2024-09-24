<template>
<div>
    <!-- <label for="">{{ label }}</label>
    <v-text-field
    single-line
    solo
    v-model="vModel"
    ></v-text-field> -->

    <v-text-field
      v-model="modelData"
      outlined
      clearable
      :label="label"
      type="text"
    >
    </v-text-field>      
    
</div>    
</template>    

<script>
export default {
  props: ['vModel', 'label'],
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

label {
    display: block;
    // text-transform: uppercase;
    font-weight: 500;
    letter-spacing: .5px;
    margin-bottom: 2px;
    font-size: .85rem;
}


.v-text-field.v-text-field--solo:not(.v-text-field--solo-flat)>.v-input__control>.v-input__slot {
    box-shadow: none!important;
    border: 1px solid #999;
}

</style>