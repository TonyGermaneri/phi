<template>
  <div v-if="!drawer" class="control-icons">
    <v-icon @click="toggleDrawer" :class="drawerIconClass">mdi-cog</v-icon>
    <v-icon @click="randomizeAllParameters" :class="[drawerIconClass, 'randomize-icon']" title="Randomize all parameters">mdi-dice-multiple</v-icon>
  </div>
  <v-navigation-drawer v-if="drawer" class="w-33">
    <v-icon class="float-right mr-2 mt-2" @click="toggleDrawer">mdi-chevron-double-left</v-icon>
    <h4 class="mx-4 mt-2">Physarum -
      <span v-if="currentPreset">{{ currentPreset.title }}</span>
    </h4>
    <div v-if="currentPreset" class="ml-4 text-caption text-medium-emphasis d-inline-block">
      {{ currentPreset.description }}
    </div>

    <v-tabs v-model="tabs">
      <v-tab v-for="tab in allTabs" :key="tab">{{ tab }}</v-tab>
    </v-tabs>
    <v-tabs-window v-model="tabs" class="mx-4">
      <!-- Presets tab -->
      <v-tabs-window-item key="Presets">
        <div class="mt-4">
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
            <template v-slot:prepend>
              <div class="d-flex flex-column mr-2 preset-order-controls">
                <v-tooltip text="Move up" location="left">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      size="x-small"
                      variant="text"
                      @click.stop="movePresetUp(preset.id, index)"
                      :disabled="index === 0"
                      class="mb-1"
                    >
                      <v-icon size="small">mdi-chevron-up</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="Move down" location="left">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      size="x-small"
                      variant="text"
                      @click.stop="movePresetDown(preset.id, index)"
                      :disabled="index === availablePresets.length - 1"
                    >
                      <v-icon size="small">mdi-chevron-down</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </template>

            <!-- Editable title -->
            <v-list-item-title class="preset-title-container">
              <v-text-field
                v-if="editingPresetId === preset.id && editingField === 'title'"
                v-model="editingValue"
                density="compact"
                hide-details
                autofocus
                @blur="saveEdit(preset)"
                @keyup.enter="saveEdit(preset)"
                @keyup.escape="cancelEdit()"
                class="preset-edit-field"
              ></v-text-field>
              <span
                v-else
                @click.stop="startEdit(preset, 'title')"
                class="preset-editable-text"
                title="Click to edit title"
              >
                {{ preset.title  }}
              </span>
            </v-list-item-title>

            <!-- Editable description -->
            <v-list-item-subtitle v-if="preset.description || (editingPresetId === preset.id && editingField === 'description')" class="preset-description-container">
              <v-text-field
                v-if="editingPresetId === preset.id && editingField === 'description'"
                v-model="editingValue"
                density="compact"
                hide-details
                rows="2"
                autofocus
                @blur="saveEdit(preset)"
                @keyup.ctrl.enter="saveEdit(preset)"
                @keyup.escape="cancelEdit()"
                class="preset-edit-field"
              ></v-text-field>
              <span
                v-else
                @click.stop="startEdit(preset, 'description')"
                class="preset-editable-text"
                :title="preset.isDefault ? 'Default presets cannot be edited' : 'Click to edit description'"
              >
                {{ preset.description }}
                <v-icon v-if="!preset.isDefault" size="small" class="edit-icon">mdi-pencil</v-icon>
              </span>
            </v-list-item-subtitle>

            <!-- Add description option for presets without one -->
            <v-list-item-subtitle v-else-if="!preset.isDefault">
              <span
                @click.stop="startEdit(preset, 'description')"
                class="preset-add-description"
                title="Click to add description"
              >
                <v-icon size="small" class="mr-1">mdi-plus</v-icon>
                Add description...
              </span>
            </v-list-item-subtitle>

            <template v-slot:append v-if="!preset.isDefault">
              <v-btn
                icon
                size="small"
                @click.stop="duplicatePreset(preset)"
                class="ml-2"
              >
                <v-icon size="small">mdi-content-copy</v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                @click.stop="showDeleteConfirmation(preset)"
                class="ml-2"
              >
                <v-icon size="small">mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-list-item>
        </v-list>

        <!-- Save As Dialog -->
        <v-dialog v-model="showSaveAsDialog" max-width="500px" class="save-as">
          <v-card class="save-as">
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

        <!-- Delete Confirmation Dialog -->
        <v-dialog v-model="showDeleteDialog" max-width="400px"  class="delete-dialog">
          <v-card class="delete-dialog">
            <v-card-title class="text-h6">Delete Preset</v-card-title>
            <v-card-text>
              Are you sure you want to delete the preset "{{ presetToDelete?.title }}"?
              <br><br>
              This action cannot be undone.
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="cancelDelete">Cancel</v-btn>
              <v-btn
                color="error"
                @click="confirmDelete"
              >
                Delete
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
    </v-tabs-window>
  </v-navigation-drawer>
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
      drawerIconClass: 'drawer-icon drawer-icon-hidden',
      tabs: null,
      isFullscreen: false,
      drawer: false,
      systemControls: ControlParameters.system,
      simControls: ControlParameters.controls,
      presetDatabase: null,
      simulation: null,
      availablePresets: [],
      currentPresetIndex: 0,
      currentParameters: [],
      showSaveAsDialog: false,
      newPresetTitle: '',
      newPresetDescription: '',
      showDeleteDialog: false,
      presetToDelete: null,
      editingPresetId: null,
      editingField: null,
      editingValue: ''
    };
  },
  computed: {
    currentPreset() {
      return this.availablePresets[this.currentPresetIndex];
    },
    groups() {
      return [...new Set(this.simControls.map(control => control.group))];
    },
    allTabs() {
      return ['presets', ...this.groups];
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
    randomizeAllParameters() {
      if (!this.simulation || !this.simControls) {
        return;
      }

      // Generate random values for all parameters
      const randomParameters = [];
      for (const control of this.simControls) {
        let randomValue;
        if (control.inputType === 'switch') {
          randomValue = Math.random() < 0.5;
        } else {
          const min = control.min || 0;
          const max = control.max || 100;
          randomValue = Math.random() * (max - min) + min;
          if (control.step) {
            randomValue = Math.round(randomValue / control.step) * control.step;
          }
        }
        randomParameters[control.index] = randomValue;
      }
      // Apply random parameters to simulation
      for (let i = 0; i < randomParameters.length; i++) {
        if (randomParameters[i] !== undefined) {
          this.simulation.updateParameter(i, randomParameters[i]);
          this.currentParameters[i] = randomParameters[i];
        }
      }
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
    showDeleteConfirmation(preset) {
      this.presetToDelete = preset;
      this.showDeleteDialog = true;
    },
    cancelDelete() {
      this.showDeleteDialog = false;
      this.presetToDelete = null;
    },
    async confirmDelete() {
      if (this.presetToDelete) {
        await this.deletePreset(this.presetToDelete.id);
        this.cancelDelete();
      }
    },
    async deletePreset(presetId) {
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
    },
    async duplicatePreset(preset) {
      try {
        // Create a copy with a new title
        const duplicatedTitle = `${preset.title} (Copy)`;
        const duplicatedDescription = preset.description || '';

        const newPreset = await this.presetDatabase.saveUserPreset(
          duplicatedTitle,
          duplicatedDescription,
          preset.parameters
        );

        // Add to local presets list
        this.availablePresets.push(newPreset);

        // Add to simulation parameter sets
        this.simulation.addParameterSet(preset.parameters);

        console.log(`Duplicated preset: ${duplicatedTitle}`);
      } catch (error) {
        console.error('Failed to duplicate preset:', error);
      }
    },
    async movePresetUp(presetId, currentIndex) {
      if (currentIndex <= 0) return;

      try {
        await this.presetDatabase.movePresetUp(presetId);

        // Update local array order
        const preset = this.availablePresets[currentIndex];
        this.availablePresets.splice(currentIndex, 1);
        this.availablePresets.splice(currentIndex - 1, 0, preset);

        // Update simulation parameter sets order
        const parameterSet = this.simulation.parameterSets[currentIndex];
        this.simulation.parameterSets.splice(currentIndex, 1);
        this.simulation.parameterSets.splice(currentIndex - 1, 0, parameterSet);

        // Update current preset index if necessary
        if (this.currentPresetIndex === currentIndex) {
          this.currentPresetIndex = currentIndex - 1;
        } else if (this.currentPresetIndex === currentIndex - 1) {
          this.currentPresetIndex = currentIndex;
        }

        console.log('Preset moved up successfully');
      } catch (error) {
        console.error('Failed to move preset up:', error);
      }
    },
    async movePresetDown(presetId, currentIndex) {
      if (currentIndex >= this.availablePresets.length - 1) return;

      try {
        await this.presetDatabase.movePresetDown(presetId);

        // Update local array order
        const preset = this.availablePresets[currentIndex];
        this.availablePresets.splice(currentIndex, 1);
        this.availablePresets.splice(currentIndex + 1, 0, preset);

        // Update simulation parameter sets order
        const parameterSet = this.simulation.parameterSets[currentIndex];
        this.simulation.parameterSets.splice(currentIndex, 1);
        this.simulation.parameterSets.splice(currentIndex + 1, 0, parameterSet);

        // Update current preset index if necessary
        if (this.currentPresetIndex === currentIndex) {
          this.currentPresetIndex = currentIndex + 1;
        } else if (this.currentPresetIndex === currentIndex + 1) {
          this.currentPresetIndex = currentIndex;
        }

        console.log('Preset moved down successfully');
      } catch (error) {
        console.error('Failed to move preset down:', error);
      }
    },
    startEdit(preset, field) {
      this.editingPresetId = preset.id;
      this.editingField = field;
      this.editingValue = preset[field] || '';
    },
    async saveEdit(preset) {
      if (!this.editingPresetId || !this.editingField) {
        return;
      }
      const newValue = this.editingValue.trim();
      // Don't save if value hasn't changed
      if (newValue === (preset[this.editingField] || '')) {
        this.cancelEdit();
        return;
      }
      // Don't allow empty titles
      if (this.editingField === 'title' && !newValue) {
        this.cancelEdit();
        return;
      }
      try {
        // Update in database
        await this.presetDatabase.updatePreset(
          preset.id,
          this.editingField === 'title' ? newValue : preset.title,
          this.editingField === 'description' ? newValue : preset.description,
          preset.parameters
        );

        // Update local preset data
        preset[this.editingField] = newValue;
        preset.modified = new Date().toISOString();

        console.log(`Updated preset ${this.editingField}: ${preset.title}`);
      } catch (error) {
        console.error(`Failed to update preset ${this.editingField}:`, error);
      }

      this.cancelEdit();
    },
    cancelEdit() {
      this.editingPresetId = null;
      this.editingField = null;
      this.editingValue = '';
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
    },
    // Cancel editing when clicking on a different preset
    currentPresetIndex() {
      this.cancelEdit();
    }
  },
  async mounted() {

    // start simulation
    this.simulation = new Physarum(document.getElementById('canvas'));

    // Initialize preset database
    await presetDatabase.init()

    this.presetDatabase = presetDatabase;

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

    this.drawerIconClass = 'drawer-icon';
    setTimeout(() => {
      this.drawerIconClass = 'drawer-icon drawer-icon-hidden';
    }, 3000);

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
.delete-dialog div, .save-as div {
  color: #ccc !important;
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
  position: relative;
}

.v-list-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.v-list-item:hover .preset-order-controls {
  opacity: 1;
}

.preset-order-controls {
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.preset-order-controls .v-btn {
  min-width: 24px !important;
  width: 24px;
  height: 20px;
}

.preset-order-controls .v-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.preset-editable-text {
  cursor: pointer;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.preset-editable-text:hover {
  background: rgba(255, 255, 255, 0.1);
}

.preset-editable-text .edit-icon {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.preset-editable-text:hover .edit-icon {
  opacity: 0.7;
}

.preset-add-description {
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  display: inline-flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.preset-add-description:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
}

.preset-edit-field {
  margin: -4px 0;
}

.preset-title-container,
.preset-description-container {
  width: 100%;
}

.preset-title-container .preset-edit-field,
.preset-description-container .preset-edit-field {
  width: 100%;
}

.v-list-item--active {
  background: rgba(98, 0, 238, 0.3) !important;
  border: 1px solid rgba(98, 0, 238, 0.5);
}

.v-btn {
  text-transform: none;
}

.parameter-control {
  margin-bottom: 16px;
}

.switch-control {
  padding: 16px;
}
.drawer-icon-hidden {
  opacity: 0;
}
.control-icons {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.drawer-icon {
  transition: all 1s;
  cursor: pointer;
}
.drawer-icon:hover {
  opacity: 1;
  transition: all 1s;
}
.randomize-icon {
  font-size: 1.2em;
}
.randomize-icon:hover {
  color: #ff6b35 !important;
  transform: rotate(15deg);
}
</style>
