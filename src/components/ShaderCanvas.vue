<template>
  <div class="shader-canvas-container">
    <canvas ref="canvas" id="canvas"></canvas>
  </div>
</template>

<style scoped>
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
