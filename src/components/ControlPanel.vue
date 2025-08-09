<template>
  <div v-show="drawer">
    <v-navigation-drawer permanent width="33%">
      <v-tabs v-model="tabs">
        <v-tab v-for="group in groups" :key="group">{{ group }}</v-tab>
      </v-tabs>
      <v-tabs-window v-model="tabs">
        <v-tabs-window-item v-for="group in groups" :key="group">
          <ParameterControl
            v-for="control in groupControls(group)"
            :key="control.title"
          />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-navigation-drawer>
  </div>
</template>


<script>
import ParameterControl from './ParameterControl.vue';
import presetDatabase from '../services/presetDatabase.js';
import Physarum from '../Physarum.js';
import ControlParameters from '../ControlParameters.js';

export default {
  name: 'ControlPanel',
  components: {
    ParameterControl
  },
  data() {
    return {
      tabs: null,
      isFullscreen: false,
      drawer: true,
      header: true,
      systemControls: ControlParameters.system,
      simControls: ControlParameters.controls,
      presetDatabase: null,
      simulation: null,
    };
  },
  computed: {
    groups() {
      return [...new Set(this.simControls.map(control => control.group))];
    },
    groupControls() {
      return (group) => {
        return this.simControls.filter(c => c.group == group);
      };
    }
  },
  methods: {
    toggleDrawer() {
      this.drawer = !this.drawer;
    },
    toggleFullscreen() {
      if (this.isFullscreen) {
        document.exitFullscreen();
      } else {
        document.body.requestFullscreen();
      }
      this.isFullscreen = !this.isFullscreen;
    },
    animate() {
      if (this.simulation.params.update) {
        this.simulation.draw();
      }
      requestAnimationFrame(this.animate);
    }
  },
  mounted() {
    // Initialize preset database
    presetDatabase.init().then(async () => {
      this.presetDatabase = presetDatabase;
      console.log('Preset database initialized');
    }).catch(error => {
      console.error('Failed to initialize preset database:', error);
    });

    this.simulation = new Physarum(document.getElementById('canvas'));

    const i = [0.000, 4.000, 0.300, 0.100, 51.32, 20.00, 0.410, 4.000, 0.000, 0.100, 6.000, 0.100, 0.000, 0.000, 0.400, 0.705, 1.000, 0.300, 0.250, 8.0, 0.200, 0.800, 0.700, 0.300, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00];
    this.simulation.addParameterSet(i);

    window.addEventListener("resize", this.simulation.resizeCanvas.bind(this.simulation));
    document.addEventListener("pointermove", this.simulation.mouseTouchMove.bind(this.simulation));
    document.addEventListener("mousemove", this.simulation.mouseTouchMove.bind(this.simulation));
    document.addEventListener("mousedown", this.simulation.mousedown.bind(this.simulation));
    document.addEventListener("mouseup", this.simulation.mouseup.bind(this.simulation));
    document.addEventListener("mouseleave", this.simulation.mouseup.bind(this.simulation));

    requestAnimationFrame(this.animate);

  },
  beforeUnmount() {

  }
};
</script>

<style scoped>
.control-panel-wrapper {
  position: relative;
  z-index: 2000;
}

.control-header {
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2002;
  transition: transform 0.3s ease-in-out;
  backdrop-filter: blur(8px);
}

.header-hidden {
  transform: translateY(-100%);
}

.rotate-icon {
  transform: rotate(45deg);
  transition: transform 0.3s ease;
}

.v-navigation-drawer {
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.15) !important;
}

.v-card {
  background: rgba(0, 0, 0, 0.25) !important;
  color:  rgba(1, 1, 1, 1) !important;
  backdrop-filter: blur(8px);
}

.v-tabs {
  background: transparent;
}


</style>
