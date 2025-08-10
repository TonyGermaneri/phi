<template>
  <div v-if="!drawer" :class="['control-icons', drawerIconClass]">
    <v-icon @click="toggleDrawer" class="cog-icon">mdi-cog</v-icon>
    <v-icon @click="randomizeAllParameters" class="randomize-icon" title="Randomize all parameters - (Shortcut: r)">mdi-dice-multiple</v-icon>
    <v-icon @click="showHelpDialog = !showHelpDialog" class="help-icon" title="Help - (Shortcut: ?)">mdi-help-box-outline</v-icon>
  </div>

  <!-- Snackbar for keyboard action feedback -->
  <v-snackbar
    v-model="showSnackbar"
    :timeout="2000"
    location="bottom"
    class="keyboard-feedback"
  >
    {{ snackbarMessage }}
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="showSnackbar = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>

  <!-- Help Dialog -->
  <v-dialog v-model="showHelpDialog" max-width="600px" class="help-dialog">
    <v-card class="help-dialog" style="background: transparent;">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-3">mdi-help-box-outline</v-icon>
        Keyboard Shortcuts
      </v-card-title>
      <v-card-text>
        <v-list class="help-shortcuts">
          <v-list-item
            v-for="shortcut in keyboardShortcuts"
            :key="shortcut.key"
          >
            <template v-slot:prepend>
              <v-chip
                size="small"
                variant="outlined"
                :class="{'shortcut-key': true, 'pl-4': shortcut.key.length == 1}">{{ shortcut.key }}</v-chip>
            </template>
            <v-list-item-title>{{ shortcut.description }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="showAboutDialog = true; showHelpDialog = false">About</v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="showHelpDialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- About Dialog -->
  <v-dialog v-model="showAboutDialog" max-width="700px" class="about-dialog">
    <v-card class="about-dialog" style="background: transparent;">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-3">mdi-information-outline</v-icon>
        About Physarum
      </v-card-title>
      <v-card-text>
        <div class="about-content">
          <p class="mb-4">
            <a href="https://tonygermaneri.github.io/phi/" target="_blank" rel="noopener">
              https://tonygermaneri.github.io/phi/
            </a>
          </p>

          <v-divider class="my-4"></v-divider>

          <h3 class="text-h5 mb-3">Attributions</h3>

          <div class="mb-4">
            <p class="mb-2">
              <a href="https://uwe-repository.worktribe.com/output/980579/characteristics-of-pattern-formation-and-evolution-in-approximations-of-physarum-transport-networks"
                 target="_blank"
                 rel="noopener">
                Based on research by Jeff Jones
              </a>
            </p>
          </div>

          <div class="mb-4">
            <p class="mb-2">Parts of the code contained herein are based on:</p>
            <p class="mb-2">
              <a href="https://www.sagejenson.com/36points" target="_blank" rel="noopener">
                36 Points
              </a> (2019-2022) By Sage Jenson
            </p>
            <p class="text-caption mb-2">
              Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License
            </p>
            <p>
              <a href="https://creativecommons.org/licenses/by-nc-sa/3.0/legalcode"
                 target="_blank"
                 rel="noopener">
                Full license
              </a>
            </p>
          </div>

          <v-divider class="my-4"></v-divider>

          <div class="mb-4">
            <h4 class="text-h6 mb-2">Features</h4>
            <ul class="pl-4">
              <li>HLSA simulation</li>
              <li>Heavily Modified Physarum Algorithm</li>
              <li>JS Proxy Interface</li>
              <li>Vue 3 Framework Wrapper</li>
              <li>Interactive Vuetify MD Control Panel</li>
            </ul>
          </div>

          <v-divider class="my-4"></v-divider>

          <div class="text-center">
            <p class="mb-2">&copy; 2025 by Tony Germaneri</p>
            <p class="text-caption mb-2">
              Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License
            </p>
            <p>
              <a href="https://creativecommons.org/licenses/by-nc-sa/3.0/legalcode"
                 target="_blank"
                 rel="noopener">
                Full license
              </a>
            </p>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="showHelpDialog = true; showAboutDialog = false">Back to Help</v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="showAboutDialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-navigation-drawer v-if="isMobileDevice || drawer" :class="{'w-33': !isMobileDevice}" :location="isMobileDevice ? 'bottom' : 'left'">
    <div v-if="!isMobileDevice">
      <v-icon class="float-right mr-2 mt-2" @click="toggleDrawer">mdi-chevron-double-left</v-icon>
      <h4 class="mx-4 mt-2">Physarum -
        <span v-if="currentPreset">{{ currentPreset.title }}</span>
      </h4>
      <div v-if="currentPreset" class="ml-4 text-caption text-medium-emphasis d-inline-block">
        {{ currentPreset.description }}
      </div>
      <v-spacer></v-spacer>
      <v-icon @click="showHelpDialog = !showHelpDialog" :class="['help-icon', 'float-right', 'mr-3']" title="Help - (Shortcut: ?)">mdi-help-box-outline</v-icon>
      <v-icon @click="randomizeAllParameters" :class="['randomize-icon', 'float-right', 'mr-3']" title="Randomize all parameters - (Shortcut: r)">mdi-dice-multiple</v-icon>
      <v-spacer></v-spacer>
    </div>
    <v-tabs v-model="tabs">
      <v-tab v-for="tab in allTabs" :key="tab">{{ tab }}</v-tab>
    </v-tabs>
    <v-tabs-window v-model="tabs" class="mx-4">
      <!-- Presets tab -->
      <v-tabs-window-item key="presets">
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
            class="mr-2 mb-2"
            @click="showSaveAsDialog = true"
          >
            <v-icon left>mdi-content-save-plus</v-icon>
            Save As...
          </v-btn>
          <v-btn
            color="info"
            size="small"
            class="mb-2"
            @click="triggerFileUpload"
          >
            <v-icon left>mdi-upload</v-icon>
            Import
          </v-btn>
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            style="display: none"
            @change="handleFileUpload"
          />
        </div>

        <v-list>
          <v-list-item
            v-for="(preset, index) in availablePresets"
            :key="preset.id || index"
            :class="{ 'v-list-item--active': currentPresetIndex === index }"
            @click="selectPreset(index)"
          >
            <!-- Desktop Layout -->
            <div v-if="!isMobileDevice" class="desktop-preset-layout">
              <div class="d-flex">
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

                <div class="flex-grow-1">
                  <!-- Editable title -->
                  <div class="preset-title-container">
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
                      class="preset-editable-text preset-title"
                      title="Click to edit title"
                    >
                      {{ preset.title  }}
                    </span>
                  </div>

                  <!-- Editable description -->
                  <div v-if="preset.description || (editingPresetId === preset.id && editingField === 'description')" class="preset-description-container">
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
                      class="preset-editable-text preset-subtitle"
                      :title="preset.isDefault ? 'Default presets cannot be edited' : 'Click to edit description'"
                    >
                      {{ preset.description }}
                      <v-icon v-if="!preset.isDefault" size="small" class="edit-icon">mdi-pencil</v-icon>
                    </span>
                  </div>

                  <!-- Add description option for presets without one -->
                  <div v-else-if="!preset.isDefault" class="preset-description-container">
                    <span
                      @click.stop="startEdit(preset, 'description')"
                      class="preset-add-description"
                      title="Click to add description"
                    >
                      <v-icon size="small" class="mr-1">mdi-plus</v-icon>
                      Add description...
                    </span>
                  </div>
                </div>

                <div class="desktop-action-buttons">
                  <v-btn
                    icon
                    size="small"
                    @click.stop="downloadPreset(preset)"
                    class="ml-2"
                    title="Download preset"
                  >
                    <v-icon size="small">mdi-download</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    @click.stop="duplicatePreset(preset)"
                    class="ml-2"
                    title="Duplicate preset"
                  >
                    <v-icon size="small">mdi-content-copy</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="!preset.isDefault"
                    icon
                    size="small"
                    @click.stop="showDeleteConfirmation(preset)"
                    class="ml-2"
                    title="Delete preset"
                  >
                    <v-icon size="small">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>

            <!-- Mobile Layout -->
            <div v-else class="mobile-preset-item" @click.stop>
              <div class="mobile-preset-header" @click="selectPreset(index)">
                <div class="mobile-preset-info">
                  <div class="mobile-preset-title">{{ preset.title }}</div>
                  <div v-if="preset.description" class="mobile-preset-description">{{ preset.description }}</div>
                </div>
                <v-btn
                  icon
                  size="small"
                  @click.stop="toggleMobileActions(preset.id)"
                  class="mobile-actions-toggle"
                >
                  <v-icon>{{ showMobileActions === preset.id ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </v-btn>
              </div>

              <!-- Mobile Actions Panel -->
              <v-expand-transition>
                <div v-if="showMobileActions === preset.id" class="mobile-actions-panel">
                  <div class="mobile-action-row">
                    <v-btn
                      variant="text"
                      size="small"
                      @click.stop="movePresetUp(preset.id, index)"
                      :disabled="index === 0"
                      class="mobile-action-btn"
                    >
                      <v-icon left size="small">mdi-chevron-up</v-icon>
                      Move Up
                    </v-btn>
                    <v-btn
                      variant="text"
                      size="small"
                      @click.stop="movePresetDown(preset.id, index)"
                      :disabled="index === availablePresets.length - 1"
                      class="mobile-action-btn"
                    >
                      <v-icon left size="small">mdi-chevron-down</v-icon>
                      Move Down
                    </v-btn>
                  </div>
                  <div class="mobile-action-row">
                    <v-btn
                      variant="text"
                      size="small"
                      @click.stop="downloadPreset(preset)"
                      class="mobile-action-btn"
                    >
                      <v-icon left size="small">mdi-download</v-icon>
                      Download
                    </v-btn>
                    <v-btn
                      variant="text"
                      size="small"
                      @click.stop="duplicatePreset(preset)"
                      class="mobile-action-btn"
                    >
                      <v-icon left size="small">mdi-content-copy</v-icon>
                      Duplicate
                    </v-btn>
                  </div>
                  <div v-if="!preset.isDefault" class="mobile-action-row">
                    <v-btn
                      variant="text"
                      size="small"
                      @click.stop="startEdit(preset, 'title')"
                      class="mobile-action-btn"
                    >
                      <v-icon left size="small">mdi-pencil</v-icon>
                      Edit Title
                    </v-btn>
                    <v-btn
                      variant="text"
                      size="small"
                      @click.stop="showDeleteConfirmation(preset)"
                      class="mobile-action-btn"
                      color="error"
                    >
                      <v-icon left size="small">mdi-delete</v-icon>
                      Delete
                    </v-btn>
                  </div>
                </div>
              </v-expand-transition>
            </div>
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

        <!-- Import Conflict Resolution Dialog -->
        <v-dialog v-model="showImportConflictDialog" max-width="500px" class="import-conflict-dialog">
          <v-card class="import-conflict-dialog">
            <v-card-title class="text-h6">Import Conflict</v-card-title>
            <v-card-text>
              <p>A preset with the same ID already exists:</p>
              <div class="conflict-preset-info mt-3 mb-3 pa-3" style="background: rgba(255, 255, 255, 0.1); border-radius: 8px;">
                <div><strong>Existing:</strong> {{ conflictData?.existingPreset?.title }}</div>
                <div class="text-caption">Version: {{ conflictData?.existingPreset?.version || 1 }}</div>
                <div class="text-caption">Modified: {{ formatDate(conflictData?.existingPreset?.modified) }}</div>
              </div>
              <div class="conflict-preset-info mb-3 pa-3" style="background: rgba(255, 255, 255, 0.1); border-radius: 8px;">
                <div><strong>Importing:</strong> {{ conflictData?.importData?.title }}</div>
                <div class="text-caption">Version: {{ conflictData?.importData?.version || 1 }}</div>
                <div class="text-caption">Export Date: {{ formatDate(conflictData?.importData?.exportedAt) }}</div>
              </div>
              <p>How would you like to proceed?</p>
            </v-card-text>
            <v-card-actions class="flex-column align-stretch">
              <v-btn
                color="warning"
                @click="resolveImportConflict('overwrite')"
                class="mb-2"
                block
              >
                <v-icon left>mdi-content-save-edit</v-icon>
                Overwrite Existing (Version {{ (conflictData?.existingPreset?.version || 1) + 1 }})
              </v-btn>
              <v-btn
                color="primary"
                @click="resolveImportConflict('import_new')"
                class="mb-2"
                block
              >
                <v-icon left>mdi-content-copy</v-icon>
                Import as New Preset
              </v-btn>
              <v-btn
                @click="cancelImportConflict"
                block
              >
                <v-icon left>mdi-cancel</v-icon>
                Cancel Import
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

  <!-- Drag and Drop Overlay -->
  <div v-if="isDragOver" class="drag-overlay">
    <div class="drag-overlay-content">
      <v-icon size="64" class="mb-4">mdi-file-import</v-icon>
      <h2>Drop JSON Preset File Here</h2>
      <p>Release to import the preset</p>
    </div>
  </div>
</template>


<script>
import ParameterControl from './ParameterControl.vue';
import presetDatabase from '../services/presetDatabase.js';
import Physarum from '../Physarum.js';
import ControlParameters from '../ControlParameters.js';
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
      drawer: isMobile,
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
      editingValue: '',
      // Import/Export related data
      showImportConflictDialog: false,
      conflictData: null,
      importingFile: null,
      // Drag and drop state
      isDragOver: false,
      dragCounter: 0,
      // Keyboard shortcuts related data
      showHelpDialog: false,
      showAboutDialog: false,
      showSnackbar: false,
      snackbarMessage: '',
      originalPresetParameters: {}, // Store original parameters for revert functionality
      isPaused: false,
      isMobileDevice: isMobile,
      showMobileActions: null, // Track which preset's mobile actions are expanded
      keyboardShortcuts: [
        { key: 'H', description: 'Toggle Controls Panel' },
        { key: '[', description: 'Previous Preset' },
        { key: ']', description: 'Next Preset' },
        { key: 'P', description: 'Pause/Resume Simulation' },
        { key: '.', description: 'Step Forward (when paused)' },
        { key: 'R', description: 'Randomize All Parameters' },
        { key: 'SPACE', description: 'Toggle Fullscreen' },
        { key: 'S', description: 'Save Current Preset' },
        { key: 'L', description: 'Revert to Saved Preset' },
        { key: '? or /', description: 'Show This Help' }
      ]
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
    toggleMobileActions(presetId) {
      this.showMobileActions = this.showMobileActions === presetId ? null : presetId;
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
    // Keyboard shortcut methods
    handleKeydown(event) {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) {
        return;
      }
      const key = event.key.toLowerCase();

      switch (key) {
        case 'h':
          if (event.shiftKey || event.metaKey || event.ctrlKey) {
            this.showHelpDialog = !this.showHelpDialog;
          } else {
            this.toggleDrawer();
          }
          event.preventDefault();
          break;
        case '?':
        case '/':
          this.showHelpDialog = !this.showHelpDialog;
          event.preventDefault();
          break;
        case '[':
          this.previousPreset();
          event.preventDefault();
          break;
        case ']':
          this.nextPreset();
          event.preventDefault();
          break;
        case 'p':
          this.togglePause();
          event.preventDefault();
          break;
        case '.':
          this.stepForward();
          event.preventDefault();
          break;
        case 'r':
          if (event.shiftKey || event.metaKey || event.ctrlKey) {
            return;
          }
          this.randomizeAllParameters();
          this.showMessage('Parameters randomized');
          break;
        case ' ':
          this.toggleFullscreen();
          event.preventDefault();
          break;
        case 's':
          this.saveCurrentPresetKeyboard();
          event.preventDefault();
          break;
        case 'l':
          this.revertToSavedPreset();
          event.preventDefault();
          break;
      }
    },
    showMessage(message) {
      this.snackbarMessage = message;
      this.showSnackbar = true;
    },
    previousPreset() {
      if (this.availablePresets.length > 0) {
        const newIndex = this.currentPresetIndex > 0
          ? this.currentPresetIndex - 1
          : this.availablePresets.length - 1;
        this.selectPreset(newIndex);
        this.showMessage(`Preset: ${this.availablePresets[newIndex].title}`);
      }
    },
    nextPreset() {
      if (this.availablePresets.length > 0) {
        const newIndex = this.currentPresetIndex < this.availablePresets.length - 1
          ? this.currentPresetIndex + 1
          : 0;
        this.selectPreset(newIndex);
        this.showMessage(`Preset: ${this.availablePresets[newIndex].title}`);
      }
    },
    togglePause() {
      if (this.simulation && this.simulation.params) {
        this.simulation.params.update = !this.simulation.params.update;
        this.isPaused = !this.simulation.params.update;
        this.showMessage(this.isPaused ? 'Simulation paused' : 'Simulation resumed');
      }
    },
    stepForward() {
      if (this.simulation && this.isPaused) {
        // Draw one frame when paused
        this.simulation.draw();
        this.showMessage('Stepped forward one frame');
      } else if (!this.isPaused) {
        this.showMessage('Pause simulation first to step forward');
      }
    },
    async saveCurrentPresetKeyboard() {
      const currentPreset = this.availablePresets[this.currentPresetIndex];
      if (!currentPreset) {
        this.showMessage('No preset selected');
        return;
      }

      if (currentPreset.isDefault) {
        this.showMessage('Cannot save default preset');
        return;
      }

      await this.saveCurrentPreset();
      this.showMessage(`Saved preset: ${currentPreset.title}`);
    },
    async revertToSavedPreset() {
      const currentPreset = this.availablePresets[this.currentPresetIndex];
      if (!currentPreset) {
        this.showMessage('No preset selected');
        return;
      }

      if (currentPreset.parameters && Array.isArray(currentPreset.parameters)) {
        // Revert to saved parameters
        for (let i = 0; i < currentPreset.parameters.length; i++) {
          if (currentPreset.parameters[i] !== undefined) {
            this.simulation.updateParameter(i, currentPreset.parameters[i]);
            this.currentParameters[i] = currentPreset.parameters[i];
          }
        }
        this.showMessage(`Reverted to saved: ${currentPreset.title}`);
      } else {
        this.showMessage('No saved version to revert to');
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

        // Store original parameters for revert functionality
        const preset = this.availablePresets[index];
        if (preset && preset.parameters) {
          this.originalPresetParameters[preset.id] = [...preset.parameters];
        }
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

      } catch (error) {
        console.error(`Failed to update preset ${this.editingField}:`, error);
      }

      this.cancelEdit();
    },
    cancelEdit() {
      this.editingPresetId = null;
      this.editingField = null;
      this.editingValue = '';
    },
    // Import/Export methods
    downloadPreset(preset) {
      try {
        this.presetDatabase.downloadPreset(preset);
        this.showMessage(`Downloaded preset: ${preset.title}`);
      } catch (error) {
        console.error('Failed to download preset:', error);
        this.showMessage('Failed to download preset');
      }
    },
    triggerFileUpload() {
      this.$refs.fileInput.click();
    },
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const result = await this.presetDatabase.importPresetFromFile(e.target.result, 'ask');

            if (result.status === 'conflict') {
              this.conflictData = result;
              this.importingFile = e.target.result;
              this.showImportConflictDialog = true;
            } else if (result.status === 'success') {
              await this.handleSuccessfulImport(result.preset);
            }
          } catch (error) {
            console.error('Import error:', error);
            this.showMessage(`Import failed: ${error.message}`);
          }
        };
        reader.readAsText(file);
      } catch (error) {
        console.error('File read error:', error);
        this.showMessage('Failed to read file');
      }

      // Clear the input
      event.target.value = '';
    },
    async resolveImportConflict(resolution) {
      if (!this.importingFile || !this.conflictData) return;

      try {
        const result = await this.presetDatabase.importPresetFromFile(this.importingFile, resolution);

        if (result.status === 'success') {
          await this.handleSuccessfulImport(result.preset);
        }
      } catch (error) {
        console.error('Import resolution error:', error);
        this.showMessage(`Import failed: ${error.message}`);
      }

      this.cancelImportConflict();
    },
    async handleSuccessfulImport(newPreset) {
      // Add to local presets list
      this.availablePresets.push(newPreset);

      // Add to simulation parameter sets
      this.simulation.addParameterSet(newPreset.parameters);

      // Select the new preset
      this.currentPresetIndex = this.availablePresets.length - 1;
      this.simulation.setPreset(this.currentPresetIndex);
      this.updateCurrentParameters();

      this.showMessage(`Imported preset: ${newPreset.title}`);
    },
    cancelImportConflict() {
      this.showImportConflictDialog = false;
      this.conflictData = null;
      this.importingFile = null;
    },
    formatDate(dateString) {
      if (!dateString) return 'Unknown';
      try {
        return new Date(dateString).toLocaleString();
      } catch {
        return 'Invalid Date';
      }
    },
    // Drag and Drop methods
    handleDragEnter(event) {
      event.preventDefault();
      this.dragCounter++;
      if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
        this.isDragOver = true;
      }
    },
    handleDragOver(event) {
      event.preventDefault();
    },
    handleDragLeave(event) {
      event.preventDefault();
      this.dragCounter--;
      if (this.dragCounter === 0) {
        this.isDragOver = false;
      }
    },
    async handleDrop(event) {
      event.preventDefault();
      this.dragCounter = 0;
      this.isDragOver = false;

      const files = event.dataTransfer.files;
      if (files.length === 0) return;

      const file = files[0];

      // Check if it's a JSON file
      if (!file.name.toLowerCase().endsWith('.json')) {
        this.showMessage('Please drop a JSON preset file');
        return;
      }

      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const result = await this.presetDatabase.importPresetFromFile(e.target.result, 'ask');

            if (result.status === 'conflict') {
              this.conflictData = result;
              this.importingFile = e.target.result;
              this.showImportConflictDialog = true;
            } else if (result.status === 'success') {
              await this.handleSuccessfulImport(result.preset);
            }
          } catch (error) {
            console.error('Import error:', error);
            this.showMessage(`Import failed: ${error.message}`);
          }
        };
        reader.readAsText(file);

        this.showMessage(`Processing dropped file: ${file.name}`);
      } catch (error) {
        console.error('File read error:', error);
        this.showMessage('Failed to read dropped file');
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

    // Add keyboard event listener
    document.addEventListener('keydown', this.handleKeydown);

    // Add drag and drop event listeners
    document.addEventListener('dragover', this.handleDragOver);
    document.addEventListener('dragenter', this.handleDragEnter);
    document.addEventListener('dragleave', this.handleDragLeave);
    document.addEventListener('drop', this.handleDrop);

    window.addEventListener("resize", this.simulation.resizeCanvas.bind(this.simulation));
    document.addEventListener("touchstart", this.simulation.touchStart.bind(this.simulation));
    document.addEventListener("touchmove", this.simulation.touchMove.bind(this.simulation));
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
    // Remove keyboard event listener
    document.removeEventListener('keydown', this.handleKeydown);

    // Remove drag and drop event listeners
    document.removeEventListener('dragover', this.handleDragOver);
    document.removeEventListener('dragenter', this.handleDragEnter);
    document.removeEventListener('dragleave', this.handleDragLeave);
    document.removeEventListener('drop', this.handleDrop);
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
.help-dialog div, .delete-dialog div, .save-as div, .import-conflict-dialog div {
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
  opacity: 0.0;
  left: -30px;
  transition: all 0.25s;
}
.control-icons {
  position: absolute;
  top: 20px;
  left: 0;
  padding: 5px 10px 5px 13px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.25) !important;
  border: 1px solid rgba(98, 0, 238, 0.5);
  border-left-style: none;
  border-radius: 4px;
  transition: all 0.25s;
}
.drawer-icon {
  transition: all 0.25s;
  cursor: pointer;
}
.drawer-icon:hover {
  opacity: 1;
  transition: all 0.25s;
}
.help-icon, .randomize-icon, .cog-icon {
  font-size: 1.2em;
}
.help-icon:hover, .randomize-icon:hover, .cog-icon:hover {
  color: #ff6b35 !important;
  transform: rotate(15deg);
}


/* Keyboard shortcuts styles */
.help-dialog .v-card {
  background: rgba(0, 0, 0, 0.9) !important;
}

.help-shortcuts .v-list-item {
  margin-bottom: 4px;
  padding: 8px 16px;
  text-align: center;
}

.shortcut-key {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: #fff !important;
}

.keyboard-feedback .v-snackbar__wrapper {
  background: rgba(0, 0, 0, 0.8) !important;
  backdrop-filter: blur(8px);
}

.keyboard-feedback .v-snackbar__content {
  color: #fff !important;
}

.conflict-preset-info {
  font-size: 0.9em;
}

.conflict-preset-info .text-caption {
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 0.8em;
}

/* About Dialog */
.about-dialog .v-card {
  background: rgba(0, 0, 0, 0.9) !important;
}

.about-content {
  color: #ccc !important;
}

.about-content a {
  color: #6200ee !important;
  text-decoration: none;
}

.about-content a:hover {
  color: #bb86fc !important;
  text-decoration: underline;
}

.about-content h3,
.about-content h4 {
  color: #fff !important;
}

.about-content ul {
  color: #ccc !important;
}

/* Drag and Drop Overlay */
.drag-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.drag-overlay-content {
  text-align: center;
  color: #fff;
  padding: 2rem;
  border: 2px dashed rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
}

.drag-overlay-content h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.drag-overlay-content p {
  margin: 0;
  opacity: 0.8;
  font-size: 1rem;
}

/* Mobile-specific styles */
.mobile-preset-item {
  width: 100%;
}

.mobile-preset-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  cursor: pointer;
}

.mobile-preset-info {
  flex: 1;
  min-width: 0;
}

.mobile-preset-title {
  font-weight: 500;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  word-wrap: break-word;
}

.mobile-preset-description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
  word-wrap: break-word;
}

.mobile-actions-toggle {
  margin-left: 8px;
  flex-shrink: 0;
}

.mobile-actions-panel {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 0;
  margin-top: 8px;
}

.mobile-action-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.mobile-action-row:last-child {
  margin-bottom: 0;
}

.mobile-action-btn {
  flex: 1;
  min-height: 40px;
  text-transform: none;
  font-size: 0.875rem;
}

.mobile-action-btn .v-icon {
  margin-right: 4px;
}

/* Desktop layout styles */
.desktop-preset-layout {
  width: 100%;
}

.desktop-action-buttons {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.preset-title {
  font-weight: 500;
  font-size: 1rem;
}

.preset-subtitle {
  font-size: 0.875rem;
  opacity: 0.7;
}

</style>
