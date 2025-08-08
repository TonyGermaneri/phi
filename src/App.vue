<template>
  <v-app>
    <div class="shader-canvas-container">
      <canvas id="canvas"></canvas>
    </div>
    <ControlPanel/>
  </v-app>
</template>

<script setup>
import ControlPanel from './components/ControlPanel.vue';
</script>
<style scoped>
.v-app {
  background: #000;
}
html, body {
    overscroll-behavior: none;
    height: 100%;
    overflow: hidden;
}

* {
    touch-action: none;
}
.shader-canvas-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
</style>
