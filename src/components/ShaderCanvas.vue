<template>
  <div class="shader-canvas-container">
    <canvas ref="canvas" id="canvas"></canvas>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
export default defineComponent({
  components: {},
  emits: [],
  data() {
    return {};
  },
  methods: {
    async resize() {
      const canvas = this.$refs.canvas;
      const pixelRatio = window.devicePixelRatio || 1;

      // Set the display size (CSS pixels) first
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';

      // Now get the actual displayed size
      const rect = canvas.getBoundingClientRect();

      // Set the actual canvas resolution (device pixels)
      canvas.width = rect.width * pixelRatio;
      canvas.height = rect.height * pixelRatio;

    },
  },
  async mounted() {
    window.addEventListener('resize', this.resize);
    this.resize();
  },

});
</script>

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
