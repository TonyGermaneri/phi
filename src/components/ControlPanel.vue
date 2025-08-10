<template>
  <div v-show="drawer">
    <v-navigation-drawer permanent width="33%">
      <h2 class="mx-4">Physarum</h2>
      <v-tabs v-model="tabs">
        <v-tab v-for="tab in allTabs" :key="tab">{{ tab }}</v-tab>
      </v-tabs>
      <v-tabs-window v-model="tabs" class="mx-4">
        <!-- Presets tab -->
        <v-tabs-window-item key="Presets">
          <v-container>
            <v-row>
              <v-col cols="12">
                <h3 class="mb-4">Select Preset</h3>

                <!-- Save buttons -->
                <div class="mb-4">
                  <v-btn
                    color="primary"
                    size="small"
                    class="mr-2 mb-2"
                    @click="saveCurrentPreset"
                    :disabled="!canOverwriteCurrentPreset"
                  >
                    <v-icon left>mdi-content-save</v-icon>
                    Save
                  </v-btn>
                  <v-btn
                    color="secondary"
                    size="small"
                    class="mb-2"
                    @click="showSaveAsDialog = true"
                  >
                    <v-icon left>mdi-content-save-plus</v-icon>
                    Save As...
                  </v-btn>
                </div>

                <v-list>
                  <v-list-item
                    v-for="(preset, index) in availablePresets"
                    :key="preset.id || index"
                    :class="{ 'v-list-item--active': currentPresetIndex === index }"
                    @click="selectPreset(index)"
                  >
                    <v-list-item-title>{{ preset.title || `Preset ${index + 1}` }}</v-list-item-title>
                    <v-list-item-subtitle v-if="preset.description">{{ preset.description }}</v-list-item-subtitle>
                    <template v-slot:append v-if="!preset.isDefault">
                      <v-btn
                        icon
                        size="small"
                        @click.stop="deletePreset(preset.id)"
                        class="ml-2"
                      >
                        <v-icon size="small">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-container>

          <!-- Save As Dialog -->
          <v-dialog v-model="showSaveAsDialog" max-width="500px">
            <v-card>
              <v-card-title>Save Preset As...</v-card-title>
              <v-card-text>
                <v-text-field
                  v-model="newPresetTitle"
                  label="Preset Name"
                  required
                  autofocus
                  @keyup.enter="saveAsNewPreset"
                ></v-text-field>
                <v-textarea
                  v-model="newPresetDescription"
                  label="Description (optional)"
                  rows="3"
                ></v-textarea>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="cancelSaveAs">Cancel</v-btn>
                <v-btn
                  color="primary"
                  @click="saveAsNewPreset"
                  :disabled="!newPresetTitle.trim()"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-tabs-window-item>

        <!-- Simulation parameter tabs -->
        <v-tabs-window-item v-for="group in groups" :key="group">
          <ParameterControl
            v-for="control in groupControls(group)"
            :key="control.name"
            :model-value="getParameterValue(control)"
            :title="control.title"
            :description="control.description"
            :min="control.min"
            :max="control.max"
            :step="control.step"
            :input-type="control.inputType || 'slider'"
            @update:model-value="updateParameter(control, $event)"
          />
        </v-tabs-window-item>

        <!-- System controls tab -->
        <v-tabs-window-item key="System">
          <ParameterControl
            v-for="control in systemControls"
            :key="control.name"
            :model-value="getSystemParameterValue(control)"
            :title="control.title"
            :description="control.description"
            :min="control.min"
            :max="control.max"
            :step="control.step"
            :input-type="control.inputType || 'slider'"
            @update:model-value="updateSystemParameter(control, $event)"
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
      availablePresets: [],
      currentPresetIndex: 0,
      currentParameters: [],
      showSaveAsDialog: false,
      newPresetTitle: '',
      newPresetDescription: ''
    };
  },
  computed: {
    groups() {
      return [...new Set(this.simControls.map(control => control.group))];
    },
    allTabs() {
      return ['Presets', ...this.groups, 'System'];
    },
    groupControls() {
      return (group) => {
        return this.simControls.filter(c => c.group == group);
      };
    },
    canOverwriteCurrentPreset() {
      const currentPreset = this.availablePresets[this.currentPresetIndex];
      return currentPreset && !currentPreset.isDefault;
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
    },
    getParameterValue(control) {
      if (!this.currentParameters || control.index >= this.currentParameters.length) {
        return control.min || 0;
      }
      return this.currentParameters[control.index];
    },
    getSystemParameterValue(control) {
      if (!this.simulation || !this.simulation.params) {
        return control.min || 0;
      }
      return this.simulation.params[control.name] || control.min || 0;
    },
    updateParameter(control, value) {
      if (this.simulation && control.index !== undefined) {
        this.simulation.updateParameter(control.index, value);
        this.currentParameters[control.index] = value;
      }
    },
    updateSystemParameter(control, value) {
      if (this.simulation) {
        this.simulation.updateSystemParameter(control.name, value);
      }
    },
    selectPreset(index) {
      if (this.simulation && index >= 0 && index < this.simulation.parameterSets.length) {
        this.currentPresetIndex = index;
        this.simulation.setPreset(index);
        this.updateCurrentParameters();
      }
    },
    updateCurrentParameters() {
      if (this.simulation && this.simulation.getCurrentParameters) {
        this.currentParameters = this.simulation.getCurrentParameters();
      }
    },
    async loadAllPresets() {
      if (this.presetDatabase) {
        try {
          const presets = await this.presetDatabase.getAllPresets();
          this.availablePresets = presets;

          // Add all presets to simulation
          for (const preset of presets) {
            if (preset.parameters && Array.isArray(preset.parameters)) {
              this.simulation.addParameterSet(preset.parameters);
            }
          }

          // If no presets exist, add some default ones
          if (presets.length === 0) {
            await this.createDefaultPresets();
          }

          console.log(`Loaded ${presets.length} presets from database`);
        } catch (error) {
          console.error('Failed to load presets:', error);
        }
      }
    },
    async createDefaultPresets() {
      // Create some default presets if none exist
      const defaultPresets = [
        {
          title: "Default Pattern",
          description: "Basic physarum simulation pattern",
          parameters: [0.000, 4.000, 0.300, 0.100, 51.32, 20.00, 0.410, 4.000, 0.000, 0.100, 6.000, 0.100, 0.000, 0.000, 0.400, 0.705, 1.000, 0.300, 0.250, 8.0, 0.200, 0.800, 0.700, 0.300, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
        }
      ];

      try {
        for (const preset of defaultPresets) {
          await this.presetDatabase.saveUserPreset(preset.title, preset.description, preset.parameters);
          this.simulation.addParameterSet(preset.parameters);
        }

        // Reload presets after creating defaults
        await this.loadAllPresets();
      } catch (error) {
        console.error('Failed to create default presets:', error);
      }
    },
    async saveCurrentPreset() {
      const currentPreset = this.availablePresets[this.currentPresetIndex];
      if (!currentPreset || currentPreset.isDefault) {
        console.warn('Cannot overwrite default preset');
        return;
      }

      try {
        const currentParams = this.simulation.getCurrentParameters();
        await this.presetDatabase.updatePreset(
          currentPreset.id,
          currentPreset.title,
          currentPreset.description,
          currentParams
        );

        // Update the local preset data
        currentPreset.parameters = [...currentParams];
        currentPreset.modified = new Date().toISOString();

        // Update simulation parameter set
        this.simulation.parameterSets[this.currentPresetIndex] = new Float32Array(currentParams);

        console.log(`Saved preset: ${currentPreset.title}`);
      } catch (error) {
        console.error('Failed to save preset:', error);
      }
    },
    async saveAsNewPreset() {
      if (!this.newPresetTitle.trim()) {
        return;
      }

      try {
        const currentParams = this.simulation.getCurrentParameters();
        const newPreset = await this.presetDatabase.saveUserPreset(
          this.newPresetTitle.trim(),
          this.newPresetDescription.trim(),
          currentParams
        );

        // Add to local presets list
        this.availablePresets.push(newPreset);

        // Add to simulation parameter sets
        this.simulation.addParameterSet(currentParams);

        // Select the new preset
        this.currentPresetIndex = this.availablePresets.length - 1;
        this.simulation.setPreset(this.currentPresetIndex);

        this.cancelSaveAs();
        console.log(`Created new preset: ${newPreset.title}`);
      } catch (error) {
        console.error('Failed to create new preset:', error);
      }
    },
    cancelSaveAs() {
      this.showSaveAsDialog = false;
      this.newPresetTitle = '';
      this.newPresetDescription = '';
    },
    async deletePreset(presetId) {
      if (!confirm('Are you sure you want to delete this preset?')) {
        return;
      }

      try {
        await this.presetDatabase.deletePreset(presetId);

        // Find and remove from local list
        const index = this.availablePresets.findIndex(preset => preset.id === presetId);
        if (index !== -1) {
          this.availablePresets.splice(index, 1);

          // Remove from simulation parameter sets
          this.simulation.parameterSets.splice(index, 1);

          // Adjust current preset index if necessary
          if (this.currentPresetIndex >= index) {
            this.currentPresetIndex = Math.max(0, this.currentPresetIndex - 1);
          }

          // Update simulation to current preset
          if (this.availablePresets.length > 0) {
            this.simulation.setPreset(this.currentPresetIndex);
            this.updateCurrentParameters();
          }
        }

        console.log('Preset deleted successfully');
      } catch (error) {
        console.error('Failed to delete preset:', error);
      }
    }
  },
  watch: {
    // Watch for simulation parameter changes and update current parameters
    'simulation.params.currentParams': {
      handler(newParams) {
        if (newParams) {
          this.currentParameters = Array.from(newParams);
        }
      },
      deep: true
    }
  },
  async mounted() {

    // start simulation
    this.simulation = new Physarum(document.getElementById('canvas'));

    // Initialize preset database
    await presetDatabase.init()

    this.presetDatabase = presetDatabase;
    console.log('Preset database initialized');

    // Load all presets after database is ready
    await this.loadAllPresets();

    // Initialize current parameters array
    this.updateCurrentParameters();

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

.v-list-item {
  margin-bottom: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.v-list-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.v-list-item--active {
  background: rgba(98, 0, 238, 0.3) !important;
  border: 1px solid rgba(98, 0, 238, 0.5);
}

.v-btn {
  text-transform: none;
}

.v-dialog .v-card {
  background: rgba(30, 30, 30, 0.95) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.parameter-control {
  margin-bottom: 16px;
}

.switch-control {
  padding: 16px;
}
</style>
