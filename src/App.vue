<template>
  <v-app>
    <ShaderCanvas/>
    <ControlPanel/>
  </v-app>
</template>

<script setup>
import ShaderCanvas from './components/ShaderCanvas.vue';
import ControlPanel from './components/ControlPanel.vue';

</script>

<style scoped>
.v-app {
  background: #000;
}

</style>
