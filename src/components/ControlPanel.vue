<template>
  <div class="control-panel-wrapper">
    <!-- Auto-hide header with gear icon -->
    <v-app-bar
      v-show="headerVisible"
      :class="['control-header']"
      color="rgba(0,0,0,0.5)"
      app
      floating
      height="48"
      @mouseenter="showHeader"
      @mouseleave="startHideTimer"
    >
      <v-app-bar-nav-icon
        @click="toggleControlPanel"
        :class="{ 'rotate-icon': controlPanelOpen }"
      >
        <v-icon>mdi-cog</v-icon>
      </v-app-bar-nav-icon>

      <v-app-bar-title class="text-white">
        Physarum
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- Quick preset selector -->
            <!-- Quick preset selector -->
      <v-select
        v-model="currentPresetValue"
        :items="allPresetItems"
        variant="outlined"
        density="compact"
        style="max-width: 300px"
        hide-details
        @update:model-value="switchPreset"
        @update:menu="selectMenuOpen = $event"
      >
        <template v-slot:selection="{ item }">
          <span class="text-white" style="white-space: nowrap;">{{ item.title }}</span>
        </template>
        <template v-slot:item="{ props, item }">
          <v-list-item v-bind="props">
            <template v-slot:append v-if="item.raw.type === 'user'">
              <v-btn
                icon
                size="small"
                variant="text"
                @click.stop="exportUserPreset(item.raw.preset)"
              >
                <v-icon size="16">mdi-download</v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                variant="text"
                color="error"
                @click.stop="deleteUserPreset(item.raw.preset)"
              >
                <v-icon size="16">mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-list-item>
        </template>
      </v-select>
    </v-app-bar>

    <!-- Main control panel -->
    <v-navigation-drawer
      v-model="controlPanelOpen"
      app
      temporary
      width="600"
      location="right"
      style="z-index: 2001"
    >
      <v-card flat height="100%" @keydown.stop @keyup.stop @keypress.stop>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Physarum Control Panel</span>
          <v-btn icon variant="text" @click="controlPanelOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-tabs v-model="activeTab" align-tabs="center">
          <v-tab value="presets">Presets</v-tab>
          <v-tab value="sensing">Sensing</v-tab>
          <v-tab value="movement">Movement</v-tab>
          <v-tab value="trail">Trail</v-tab>
          <v-tab value="visual">Visual</v-tab>
          <v-tab value="color">Color</v-tab>
          <v-tab value="advanced">Advanced</v-tab>
        </v-tabs>        <v-card-text style="height: calc(100vh - 200px); overflow-y: auto;">
          <v-tabs-window v-model="activeTab">

            <!-- Presets Tab -->
            <v-tabs-window-item value="presets">
              <!-- Built-in Presets -->
              <v-row>
                <v-col cols="12">
                  <v-card variant="outlined">
                    <v-card-title>Built-in Presets</v-card-title>
                    <v-card-text>
                      <v-select
                        v-model="currentPresetIndex"
                        :items="presetItems"
                        variant="outlined"
                        @update:model-value="switchPreset"
                      ></v-select>

                      <v-row class="mt-4">
                        <v-col cols="6">
                          <v-btn
                            color="primary"
                            variant="outlined"
                            block
                            @click="resetCurrentPreset"
                          >
                            Reset Current
                          </v-btn>
                        </v-col>
                        <v-col cols="6">
                          <v-btn
                            color="secondary"
                            variant="outlined"
                            block
                            @click="randomizeParameters"
                          >
                            Randomize
                          </v-btn>
                        </v-col>
                      </v-row>

                      <!-- Save Current Preset Button -->
                      <v-row class="mt-4">
                        <v-col cols="12">
                          <v-btn
                            color="primary"
                            variant="outlined"
                            block
                            @click="showSaveDialog = true"
                          >
                            <v-icon left>mdi-plus</v-icon>
                            Save Current Parameters as Preset
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Import Section -->
              <v-row class="mt-4">
                <v-col cols="12">
                  <v-card
                    variant="outlined"
                    class="drop-zone"
                    :class="{ 'drop-zone-active': dragOver }"
                    @dragover.prevent="dragOver = true"
                    @dragleave.prevent="dragOver = false"
                    @drop.prevent="handleFileDrop"
                  >
                    <v-card-title>Import Presets</v-card-title>
                    <v-card-text class="text-center">
                      <v-icon size="48" class="mb-2">mdi-upload</v-icon>
                      <p>Drag and drop .json preset files here</p>
                      <p class="text-body-2 text-grey">or</p>
                      <v-btn
                        color="primary"
                        variant="outlined"
                        @click="$refs.fileInput.click()"
                      >
                        Choose Files
                      </v-btn>
                      <input
                        ref="fileInput"
                        type="file"
                        accept=".json"
                        multiple
                        style="display: none"
                        @change="handleFileSelect"
                      />
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-card variant="outlined" class="mt-4">
                <v-card-title>Physarum HLSA Interactive (PHI) Simulation</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="7">
                      <a href="https://tonygermaneri.github.io/phi/">https://tonygermaneri.github.io/phi/</a><br>

                      Attributions:<br><br>

                      <p>Parts of the code contained herein are based on</p>

                      <a href="https://www.sagejenson.com/36points" target="about:blank">36 Points (2019-2022) By Sage Jenson</a>

                      Adaptations include:<br><br>

                      &bull; Added HLSA simulation<br>
                      &bull; Heavily Modified Physarum Algorithm<br>
                      &bull; JS Proxy Interface<br>
                      &bull; Vue 3 Framework Wrapper<br>
                      &bull; Interactive Vuetify MD Control Panel<br><br>

                      <a href="https://uwe-repository.worktribe.com/output/980579/characteristics-of-pattern-formation-and-evolution-in-approximations-of-physarum-transport-networks">Based on research by Jeff Jones</a><br><br>

                      <p>(2025) Tony Germaneri</p>
                      <p style="white-space: nowrap;">Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License</p>

                      <a href="https://creativecommons.org/licenses/by-nc-sa/3.0/legalcode">Full license</a>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>


            </v-tabs-window-item>

            <!-- Sensing Tab -->
            <v-tabs-window-item value="sensing">
              <v-row>
                <v-col cols="12">
                  <h3 class="mb-4">Sensor Behavior</h3>
                  <p class="text-body-2 mb-4">
                    Controls how agents detect trails in their environment. Agents have three sensors:
                    straight ahead, left, and right.
                  </p>
                </v-col>
              </v-row>

              <!-- Sensor Distance -->
              <parameter-control
                v-model="parameters.sensorDistanceBase"
                title="Sensor Distance Base"
                description="Base distance agents look ahead to sense trails"
                :min="0"
                :max="100"
                :step="0.1"
                @update:model-value="updateParameter(0, $event)"
              />

              <parameter-control
                v-model="parameters.sensorDistanceMultiplier"
                title="Sensor Distance Multiplier"
                description="Scales sensing distance based on trail intensity at agent position"
                :min="0"
                :max="100"
                :step="0.1"
                @update:model-value="updateParameter(1, $event)"
              />

              <parameter-control
                v-model="parameters.sensorDistanceExponent"
                title="Sensor Distance Exponent"
                description="Controls non-linear response to trail intensity for sensing distance"
                :min="0"
                :max="5"
                :step="0.01"
                @update:model-value="updateParameter(2, $event)"
              />

              <!-- Sensor Angle -->
              <parameter-control
                v-model="parameters.sensorAngleBase"
                title="Sensor Angle Base"
                description="Base angle between left and right sensors (in radians)"
                :min="0"
                :max="Math.PI"
                :step="0.01"
                @update:model-value="updateParameter(3, $event)"
              />

              <parameter-control
                v-model="parameters.sensorAngleMultiplier"
                title="Sensor Angle Multiplier"
                description="Scales sensor angle based on trail intensity"
                :min="0"
                :max="50"
                :step="0.1"
                @update:model-value="updateParameter(4, $event)"
              />

              <parameter-control
                v-model="parameters.sensorAngleExponent"
                title="Sensor Angle Exponent"
                description="Controls non-linear response to trail intensity for sensor angle"
                :min="0"
                :max="5"
                :step="0.01"
                @update:model-value="updateParameter(5, $event)"
              />
            </v-tabs-window-item>

            <!-- Movement Tab -->
            <v-tabs-window-item value="movement">
              <v-row>
                <v-col cols="12">
                  <h3 class="mb-4">Movement Behavior</h3>
                  <p class="text-body-2 mb-4">
                    Controls how agents rotate and move based on sensed trail information.
                  </p>
                </v-col>
              </v-row>

              <!-- Rotation Angle -->
              <parameter-control
                v-model="parameters.rotationAngleBase"
                title="Rotation Angle Base"
                description="Base angle agents turn when following trails (in radians)"
                :min="0"
                :max="Math.PI"
                :step="0.01"
                @update:model-value="updateParameter(6, $event)"
              />

              <parameter-control
                v-model="parameters.rotationAngleMultiplier"
                title="Rotation Angle Multiplier"
                description="Scales rotation based on trail intensity"
                :min="0"
                :max="50"
                :step="0.1"
                @update:model-value="updateParameter(7, $event)"
              />

              <parameter-control
                v-model="parameters.rotationAngleExponent"
                title="Rotation Angle Exponent"
                description="Controls non-linear response to trail intensity for rotation"
                :min="0"
                :max="5"
                :step="0.01"
                @update:model-value="updateParameter(8, $event)"
              />

              <!-- Move Distance -->
              <parameter-control
                v-model="parameters.moveDistanceBase"
                title="Move Distance Base"
                description="Base distance agents move forward each step"
                :min="0"
                :max="20"
                :step="0.01"
                @update:model-value="updateParameter(9, $event)"
              />

              <parameter-control
                v-model="parameters.moveDistanceMultiplier"
                title="Move Distance Multiplier"
                description="Scales movement distance based on trail intensity"
                :min="0"
                :max="50"
                :step="0.1"
                @update:model-value="updateParameter(10, $event)"
              />

              <parameter-control
                v-model="parameters.moveDistanceExponent"
                title="Move Distance Exponent"
                description="Controls non-linear response to trail intensity for movement"
                :min="0"
                :max="5"
                :step="0.01"
                @update:model-value="updateParameter(11, $event)"
              />
            </v-tabs-window-item>

            <!-- Trail Tab -->
            <v-tabs-window-item value="trail">
              <v-row>
                <v-col cols="12">
                  <h3 class="mb-4">Trail Properties</h3>
                  <p class="text-body-2 mb-4">
                    Controls trail decay, diffusion, and sensing behavior.
                  </p>
                </v-col>
              </v-row>

              <parameter-control
                v-model="parameters.decayFactor"
                title="Decay Factor"
                description="How much trails fade each frame (0.75-0.99). Higher = longer lasting trails"
                :min="0.5"
                :max="0.999"
                :step="0.001"
                @update:model-value="updateParameter(15, $event)"
              />

              <parameter-control
                v-model="parameters.blurIterations"
                title="Blur Iterations"
                description="Number of diffusion steps per frame. Higher = more trail spreading"
                :min="1"
                :max="20"
                :step="1"
                @update:model-value="updateParameter(16, $event)"
              />

              <parameter-control
                v-model="parameters.trailSenseScale"
                title="Trail Sense Scale"
                description="Scaling factor for sensed trail values. Affects sensitivity to trails"
                :min="0"
                :max="2"
                :step="0.01"
                @update:model-value="updateParameter(14, $event)"
              />

              <parameter-control
                v-model="parameters.depositAmount"
                title="Deposit Amount"
                description="How much trail each agent deposits. Higher = stronger trails"
                :min="0"
                :max="50"
                :step="0.1"
                @update:model-value="updateParameter(19, $event)"
              />
            </v-tabs-window-item>

            <!-- Visual Tab -->
            <v-tabs-window-item value="visual">
              <v-row>
                <v-col cols="12">
                  <h3 class="mb-4">Visual Appearance</h3>
                  <p class="text-body-2 mb-4">
                    Controls the visual rendering of particles and trails.
                  </p>
                </v-col>
              </v-row>

              <parameter-control
                v-model="parameters.drawOpacity"
                title="Draw Opacity"
                description="Visual opacity for rendering particles (0-1)"
                :min="0"
                :max="1"
                :step="0.001"
                @update:model-value="updateParameter(17, $event)"
              />

              <parameter-control
                v-model="parameters.fillOpacity"
                title="Fill Opacity"
                description="Visual opacity for trail filling (0-1)"
                :min="0"
                :max="1"
                :step="0.001"
                @update:model-value="updateParameter(18, $event)"
              />


              <parameter-control
                v-model="parameters.positionOffsetY"
                title="Position Offset Y"
                description="Vertical offset for trail sensing relative to agent position"
                :min="-20"
                :max="20"
                :step="0.01"
                @update:model-value="updateParameter(12, $event)"
              />

              <parameter-control
                v-model="parameters.positionOffsetHeading"
                title="Position Offset Heading"
                description="Forward/backward offset for trail sensing relative to heading direction"
                :min="-20"
                :max="20"
                :step="0.01"
                @update:model-value="updateParameter(13, $event)"
              />

            </v-tabs-window-item>

            <!-- Color Tab -->
            <v-tabs-window-item value="color">
              <v-row>
                <v-col cols="12">
                  <h3 class="mb-4">Color Parameters</h3>
                  <p class="text-body-2 mb-4">
                    Controls the organic color evolution of the simulation using HSLA transformations based on trail intensity.
                  </p>
                </v-col>
              </v-row>

              <parameter-control
                v-model="parameters.hueBase"
                title="Hue Base"
                description="Base hue value for color generation (0-1, wraps around color wheel)"
                :min="0"
                :max="1"
                :step="0.01"
                @update:model-value="updateParameter(20, $event)"
              />

              <parameter-control
                v-model="parameters.hueMultiplier"
                title="Hue Multiplier"
                description="How much trail intensity affects hue changes. Higher values create more color variation"
                :min="0"
                :max="2"
                :step="0.01"
                @update:model-value="updateParameter(21, $event)"
              />

              <parameter-control
                v-model="parameters.saturationBase"
                title="Saturation Base"
                description="Base saturation value for color generation (0-1, 0=gray, 1=vivid)"
                :min="0"
                :max="1"
                :step="0.01"
                @update:model-value="updateParameter(22, $event)"
              />

              <parameter-control
                v-model="parameters.saturationMultiplier"
                title="Saturation Multiplier"
                description="How much trail intensity affects saturation. Higher values create more vivid colors in active areas"
                :min="0"
                :max="2"
                :step="0.01"
                @update:model-value="updateParameter(23, $event)"
              />

              <parameter-control
                v-model="parameters.lightnessBase"
                title="Lightness Base"
                description="Base lightness value for color generation (0-1, 0=black, 1=white)"
                :min="0"
                :max="1"
                :step="0.01"
                @update:model-value="updateParameter(24, $event)"
              />

              <parameter-control
                v-model="parameters.lightnessMultiplier"
                title="Lightness Multiplier"
                description="How much trail intensity affects lightness. Higher values create brighter colors in active areas"
                :min="0"
                :max="2"
                :step="0.01"
                @update:model-value="updateParameter(25, $event)"
              />

              <parameter-control
                v-model="parameters.contrastBase"
                title="Contrast Base"
                description="Base contrast value for color generation (0-2, 1=normal contrast)"
                :min="0"
                :max="2"
                :step="0.01"
                @update:model-value="updateParameter(26, $event)"
              />

              <parameter-control
                v-model="parameters.contrastMultiplier"
                title="Contrast Multiplier"
                description="How much trail intensity affects contrast. Higher values create more contrast in active areas"
                :min="0"
                :max="2"
                :step="0.01"
                @update:model-value="updateParameter(27, $event)"
              />

              <v-divider class="my-4"></v-divider>

              <h4 class="mb-3">Post-Processing Effects</h4>

              <parameter-control
                v-model="parameters.chromaticAberrationStrength"
                title="Chromatic Aberration Strength"
                description="Controls the intensity of the chromatic aberration effect. Higher values create more color separation"
                :min="0"
                :max="0.05"
                :step="0.001"
                @update:model-value="updateParameter(28, $event)"
              />

              <parameter-control
                v-model="parameters.chromaticAberrationOffset"
                title="Chromatic Aberration Offset"
                description="Controls the offset distance for color channel separation. Higher values create wider color fringing"
                :min="0"
                :max="0.5"
                :step="0.03"
                @update:model-value="updateParameter(29, $event)"
              />

            </v-tabs-window-item>

            <!-- Advanced Tab -->
            <v-tabs-window-item value="advanced">
              <v-row>
                <v-col cols="12">
                  <h3 class="mb-4">Advanced Parameters</h3>
                  <p class="text-body-2 mb-4">
                    Fine-tuning parameters for advanced users.
                  </p>
                </v-col>
              </v-row>

              <parameter-control
                v-model="parameters.renderSize"
                title="Render Size"
                description="Resolution of the output canvas (pixels)"
                :min="512"
                :max="2048"
                :step="1"
                @update:model-value="updateSystemParameter('renderSize', $event)"
              />

              <hr class="mt-2" color="#333"/>

              <v-select
                v-model="parameters.simSize"
                :items="[8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096]"
                label="Simulation Size"
                hint="Resolution of the simulation grid (affects performance)"
                persistent-hint
                variant="outlined"
                @update:model-value="updateSystemParameter('simSize', $event)"
              ></v-select>

              <parameter-control
                v-model="parameters.particleDensity"
                title="Particle Density"
                description="Number of particles per simulation cell"
                :min="0.1"
                :max="10"
                :step="0.1"
                @update:model-value="updateSystemParameter('particleDensity', $event)"
              />

              <parameter-control
                v-model="parameters.drawPointsize"
                title="Draw Point Size"
                description="Size of individual particle points when rendered"
                :min="0.5"
                :max="5"
                :step="0.1"
                @update:model-value="updateSystemParameter('drawPointsize', $event)"
              />

              <v-row>
                <v-col cols="12">
                  <v-switch
                    v-model="parameters.displayParticles"
                    label="Display Particles"
                    color="primary"
                    hide-details
                    @update:model-value="updateSystemParameter('displayParticles', $event)"
                  ></v-switch>
                  <div class="text-caption text-medium-emphasis">
                    Show or hide individual particle rendering
                  </div>
                </v-col>
              </v-row>

              <parameter-control
                v-model="parameters.canvasZoom"
                title="Canvas Zoom"
                description="Zoom level of the display canvas"
                :min="0.1"
                :max="3"
                :step="0.1"
                @update:model-value="updateSystemParameter('canvasZoom', $event)"
              />

              <parameter-control
                v-model="parameters.convergenceRate"
                title="Convergence Rate"
                description="Speed of parameter transitions and smoothing"
                :min="0.01"
                :max="1"
                :step="0.01"
                @update:model-value="updateSystemParameter('convergenceRate', $event)"
              />

              <v-row>
                <v-col cols="12">
                  <v-switch
                    v-model="parameters.smartLerp"
                    label="Smart Lerp"
                    color="primary"
                    hide-details
                    @update:model-value="updateSystemParameter('smartLerp', $event)"
                  ></v-switch>
                  <div class="text-caption text-medium-emphasis">
                    Enable intelligent parameter interpolation
                  </div>
                </v-col>
              </v-row>

            </v-tabs-window-item>

          </v-tabs-window>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>

    <!-- Save Preset Dialog -->
    <v-dialog v-model="showSaveDialog" max-width="500">
      <v-card @keydown.stop @keyup.stop @keypress.stop>
        <v-card-title>{{ editingPreset ? 'Edit Preset' : 'Save Current Parameters as Preset' }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="presetForm.title"
            label="Preset Title"
            variant="outlined"
            :rules="[v => !!v || 'Title is required']"
            class="mb-3"
            @keydown.stop
            @keyup.stop
            @keypress.stop
            @keydown.enter="presetForm.title.trim() ? savePreset() : null"
          ></v-text-field>

          <v-textarea
            v-model="presetForm.description"
            label="Description (optional)"
            variant="outlined"
            rows="3"
            placeholder="Describe what makes this preset unique..."
            @keydown.stop
            @keyup.stop
            @keypress.stop
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="cancelPresetEdit">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="savePreset"
            :disabled="!presetForm.title.trim()"
          >
            {{ editingPreset ? 'Update' : 'Save' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card @keydown.stop @keyup.stop @keypress.stop>
        <v-card-title>Delete Preset</v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ presetToDelete?.title }}"?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDeletePreset">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Import Status Snackbar -->
    <v-snackbar
      v-model="showImportStatus"
      :color="importStatus.success ? 'success' : 'error'"
      timeout="3000"
    >
      {{ importStatus.message }}
    </v-snackbar>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import ParameterControl from './ParameterControl.vue';
import presetDatabase from '../services/presetDatabase.js';

import Physarum from '../Physarum.js'

export default defineComponent({
  name: 'ControlPanel',
  components: {
    ParameterControl
  },
  setup() {
    // Reactive state
    const headerVisible = ref(false);
    const controlPanelOpen = ref(false);
    const activeTab = ref('presets');
    const hideTimer = ref(null);
    const currentPresetIndex = ref(7); // Default point index
    const selectMenuOpen = ref(false);

    // User preset management
    const userPresets = ref([]);
    const showSaveDialog = ref(false);
    const showDeleteDialog = ref(false);
    const editingPreset = ref(null);
    const presetToDelete = ref(null);
    const presetForm = ref({
      title: '',
      description: ''
    });

    // Import/export state
    const dragOver = ref(false);
    const showImportStatus = ref(false);
    const importStatus = ref({
      success: false,
      message: ''
    });

    const interpolationTarget = ref(0);
    const interpolationAmount = ref(0);
    const presetItems = ref([]);
    const currentPresetValue = ref(0); // Track current selection (built-in or user preset)

    // Computed property for combined preset list
    const allPresetItems = computed(() => {
      const builtInPresets = presetItems.value.map(preset => ({
        ...preset,
        type: 'builtin',
        group: 'Built-in Presets'
      }));

      const userPresetItems = userPresets.value.map((preset, index) => ({
        title: preset.title,
        value: `user_${preset.id}`,
        type: 'user',
        preset: preset,
        group: 'User Presets'
      }));

      return [...builtInPresets, ...userPresetItems];
    });

    // Parameters object - reactive refs to actual parameter values
    const parameters = ref({
      sensorDistanceBase: 0,
      sensorDistanceMultiplier: 0,
      sensorDistanceExponent: 0,
      sensorAngleBase: 0,
      sensorAngleMultiplier: 0,
      sensorAngleExponent: 0,
      rotationAngleBase: 0,
      rotationAngleMultiplier: 0,
      rotationAngleExponent: 0,
      moveDistanceBase: 0,
      moveDistanceMultiplier: 0,
      moveDistanceExponent: 0,
      positionOffsetY: 0,
      positionOffsetHeading: 0,
      trailSenseScale: 0,
      decayFactor: 0,
      blurIterations: 0,
      drawOpacity: 0,
      fillOpacity: 0,
      depositAmount: 0,
      hueBase: 0,
      hueMultiplier: 0,
      saturationBase: 0,
      saturationMultiplier: 0,
      lightnessBase: 0,
      lightnessMultiplier: 0,
      contrastBase: 0,
      contrastMultiplier: 0,
      chromaticAberrationStrength: 0,
      chromaticAberrationOffset: 0,
      // System parameters
      renderSize: 1080,
      simSize: 512,
      particleDensity: 2.7,
      drawPointsize: 1,
      displayParticles: true,
      canvasZoom: 1,
      convergenceRate: 0.15,
      smartLerp: true
    });

    // Access to global parameter interface
    let parameterInterface = null;
    let updateTimer = null;
    let suppressUpdates = false;

    const currentPresetName = computed(() => {
      if (!parameterInterface) return '';
      return parameterInterface.presetName.replace(/_/g, ' ');
    });


    // Add preset management utilities
    const presets = {
      // Reset all default presets to their original values
      async resetDefaults() {
        try {
          // Import preset database (if using module system, this would be handled differently)
          if (window.presetDatabase) {
            const resetCount = await window.presetDatabase.resetDefaultPresets();
            const updatedDefaults = await window.presetDatabase.getCurrentDefaultPresets();

            // Update the main parameter sets with reset values
            for (let i = 0; i < Math.min(updatedDefaults.length, parameterSets.length); i++) {
              parameterSets[i] = new Float32Array(updatedDefaults[i]);
            }

            // If currently on a default preset, refresh it
            if (currentPresetIndex >= 0 && currentPresetIndex < parameterSets.length) {
              phi.switchPreset(currentPresetIndex);
            }

            console.log(`Reset ${resetCount} default presets to original values`);
            return { success: true, count: resetCount };
          } else {
            console.warn('Preset database not available');
            return { success: false, error: 'Preset database not available' };
          }
        } catch (error) {
          console.error('Failed to reset default presets:', error);
          return { success: false, error: error.message };
        }
      },

      // Initialize preset database with current defaults
      async initializeDatabase() {
        try {
          if (window.presetDatabase) {
            await window.presetDatabase.saveDefaultPresets(
              parameterSets.map(params => [...params]), // Convert to regular arrays
              phi.presetNames,
              parameterLines // Pass original parameter lines for reset functionality
            );
            console.log('Preset database initialized with default presets');
            return { success: true };
          } else {
            console.warn('Preset database not available');
            return { success: false, error: 'Preset database not available' };
          }
        } catch (error) {
          console.error('Failed to initialize preset database:', error);
          return { success: false, error: error.message };
        }
      }
    };



    // Methods
    const showHeader = () => {
      clearTimeout(hideTimer.value);
      headerVisible.value = true;
    };

    const startHideTimer = () => {
      if (!controlPanelOpen.value && !selectMenuOpen.value) {
        hideTimer.value = setTimeout(() => {
          headerVisible.value = false;
        }, 2000);
      }
    };

    const toggleControlPanel = () => {
      controlPanelOpen.value = !controlPanelOpen.value;
      if (controlPanelOpen.value) {
        showHeader();
        clearTimeout(hideTimer.value);
      } else {
        startHideTimer();
      }
    };

    const updateParametersFromInterface = () => {
      // Don't update if user is actively editing parameters
      if (!parameterInterface || suppressUpdates) return;

      const currentParams = parameterInterface.currentParams;
      parameters.value.sensorDistanceBase = currentParams[0];
      parameters.value.sensorDistanceMultiplier = currentParams[1];
      parameters.value.sensorDistanceExponent = currentParams[2];
      parameters.value.sensorAngleBase = currentParams[3];
      parameters.value.sensorAngleMultiplier = currentParams[4];
      parameters.value.sensorAngleExponent = currentParams[5];
      parameters.value.rotationAngleBase = currentParams[6];
      parameters.value.rotationAngleMultiplier = currentParams[7];
      parameters.value.rotationAngleExponent = currentParams[8];
      parameters.value.moveDistanceBase = currentParams[9];
      parameters.value.moveDistanceMultiplier = currentParams[10];
      parameters.value.moveDistanceExponent = currentParams[11];
      parameters.value.positionOffsetY = currentParams[12];
      parameters.value.positionOffsetHeading = currentParams[13];
      parameters.value.trailSenseScale = currentParams[14];
      parameters.value.decayFactor = currentParams[15];
      parameters.value.blurIterations = currentParams[16];
      parameters.value.drawOpacity = currentParams[17];
      parameters.value.fillOpacity = currentParams[18];
      parameters.value.depositAmount = currentParams[19];
      parameters.value.hueBase = currentParams[20];
      parameters.value.hueMultiplier = currentParams[21];
      parameters.value.saturationBase = currentParams[22];
      parameters.value.saturationMultiplier = currentParams[23];
      parameters.value.lightnessBase = currentParams[24];
      parameters.value.lightnessMultiplier = currentParams[25];
      parameters.value.contrastBase = currentParams[26];
      parameters.value.contrastMultiplier = currentParams[27];
      parameters.value.chromaticAberrationStrength = currentParams[28];
      parameters.value.chromaticAberrationOffset = currentParams[29];

      // Update system parameters
      if (parameterInterface.systemParams) {
        parameters.value.renderSize = parameterInterface.systemParams.renderSize;
        parameters.value.simSize = parameterInterface.systemParams.simSize;
        parameters.value.particleDensity = parameterInterface.systemParams.particleDensity;
        parameters.value.drawPointsize = parameterInterface.systemParams.drawPointsize;
        parameters.value.displayParticles = parameterInterface.systemParams.displayParticles;
        parameters.value.canvasZoom = parameterInterface.systemParams.canvasZoom;
        parameters.value.convergenceRate = parameterInterface.systemParams.convergenceRate;
        parameters.value.smartLerp = parameterInterface.systemParams.smartLerp;
      }
    };

    const updateParameter = (index, value) => {
      if (parameterInterface) {
        parameterInterface.setParam(index, value, true);
      }
    };

    const updateSystemParameter = (paramName, value) => {
      if (parameterInterface && parameterInterface.systemParams) {
        parameterInterface.systemParams[paramName] = value;
      }
      if (['renderSize', 'simSize', 'particleDensity', 'canvasZoom'].find(e => e == paramName)) {
        window.resetSystem();
      }
    };

    const switchPreset = (value) => {
      if (!value) return;

      if (typeof value === 'number') {
        // Built-in preset
        if (parameterInterface) {
          parameterInterface.switchPreset(value);
          currentPresetIndex.value = value;
          currentPresetValue.value = value;
          updateParametersFromInterface();
        }
      } else if (typeof value === 'string' && value.startsWith('user_')) {
        // User preset
        const presetId = value.replace('user_', '');
        const preset = userPresets.value.find(p => p.id === presetId);
        if (preset && parameterInterface) {
          parameterInterface.applyChanges(preset.parameters, true);
          currentPresetValue.value = value;
          updateParametersFromInterface();
        }
      }
    };

    const resetCurrentPreset = () => {
      if (parameterInterface) {
        parameterInterface.reset();
        updateParametersFromInterface();
      }
    };

    const randomizeParameters = () => {
      if (parameterInterface) {
        parameterInterface.randomize(0.5); // 50% variance
        updateParametersFromInterface();
      }
    };

    const interpolatePresets = (amount) => {
      if (parameterInterface && interpolationTarget.value !== null) {
        parameterInterface.interpolateWith(interpolationTarget.value, amount);
        updateParametersFromInterface();
      }
    };

    // User preset management functions
    const loadUserPresets = async () => {
      try {
        const presets = await presetDatabase.getUserPresets();
        userPresets.value = presets.map((a) => {
          while (a.parameters && a.parameters.length < 30) {
            a.parameters.push(0); // Ensure all presets have full parameter arrays
          }
          return a;
        }).sort((a, b) => new Date(b.created) - new Date(a.created));
      } catch (error) {
        console.error('Failed to load user presets:', error);
      }
    };

    const resetAllDefaults = async () => {
      try {
        if (window.phi && window.phi.presets) {
          const result = await window.phi.presets.resetDefaults();
          if (result.success) {
            // Update the current preset display
            if (parameterInterface) {
              updateParametersFromInterface();
            }
            showImportStatus.value = true;
            importStatus.value = {
              success: true,
              message: `Reset ${result.count} default presets successfully`
            };
          } else {
            throw new Error(result.error || 'Failed to reset defaults');
          }
        } else {
          throw new Error('Preset management not available');
        }
      } catch (error) {
        console.error('Failed to reset defaults:', error);
        showImportStatus.value = true;
        importStatus.value = {
          success: false,
          message: 'Failed to reset default presets'
        };
      }
    };

    const savePreset = async () => {
      if (!presetForm.value.title.trim()) return;

      try {
        const currentParams = Array.from(parameterInterface.currentParams);

        if (editingPreset.value) {
          // Update existing preset
          await presetDatabase.updatePreset(
            editingPreset.value.id,
            presetForm.value.title,
            presetForm.value.description,
            currentParams
          );
        } else {
          // Save new preset
          await presetDatabase.saveUserPreset(
            presetForm.value.title,
            presetForm.value.description,
            currentParams
          );
        }

        await loadUserPresets();
        cancelPresetEdit();

        showImportStatus.value = true;
        importStatus.value = {
          success: true,
          message: editingPreset.value ? 'Preset updated successfully' : 'Preset saved successfully'
        };
      } catch (error) {
        console.error('Failed to save preset:', error);
        showImportStatus.value = true;
        importStatus.value = {
          success: false,
          message: 'Failed to save preset'
        };
      }
    };

    // Keyboard key codes for preset switching (numbers, QWERTY layout, etc.)
    let keyCodeMapping = [
      49, 50, 51, 52, 53, 54, 55, 56, 57, 48,  // 1-9, 0
      113, 119, 101, 114, 116, 121, 117, 105, 111, 112,  // qwertyuiop
      97, 115, 100, 102, 103, 104, 106, 107, 108,  // asdfghjkl
      122, 120, 99, 118, 98, 110, 109,  // zxcvbnm
      90, 88, 67, 86, 66, 78, 77  // ZXCVBNM
    ];

    const editUserPreset = (preset) => {
      editingPreset.value = preset;
      presetForm.value.title = preset.title;
      presetForm.value.description = preset.description;
      showSaveDialog.value = true;
    };

    const exportUserPreset = (preset) => {
      presetDatabase.exportPresetAsFile(preset);
    };

    const deleteUserPreset = (preset) => {
      presetToDelete.value = preset;
      showDeleteDialog.value = true;
    };

    const confirmDeletePreset = async () => {
      if (!presetToDelete.value) return;

      try {
        await presetDatabase.deletePreset(presetToDelete.value.id);
        await loadUserPresets();
        showDeleteDialog.value = false;
        presetToDelete.value = null;

        showImportStatus.value = true;
        importStatus.value = {
          success: true,
          message: 'Preset deleted successfully'
        };
      } catch (error) {
        console.error('Failed to delete preset:', error);
        showImportStatus.value = true;
        importStatus.value = {
          success: false,
          message: 'Failed to delete preset'
        };
      }
    };

    const cancelPresetEdit = () => {
      showSaveDialog.value = false;
      editingPreset.value = null;
      presetForm.value = {
        title: '',
        description: ''
      };
    };
    let isFullscreen = false;

    /**
     * Toggle fullscreen mode
     */
    function toggleFullscreen() {
      if (isFullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } else {
        if (document.body.requestFullscreen) {
          document.body.requestFullscreen();
        } else if (document.body.webkitRequestFullscreen) {
          document.body.webkitRequestFullscreen();
        } else if (document.body.msRequestFullscreen) {
          document.body.msRequestFullscreen();
        }
      }
      isFullscreen = !isFullscreen;
    }

    // File import handling
    const handleFileDrop = async (event) => {
      dragOver.value = false;
      const files = Array.from(event.dataTransfer.files);
      await processImportFiles(files);
    };

    const handleFileSelect = async (event) => {
      const files = Array.from(event.target.files);
      await processImportFiles(files);
      event.target.value = ''; // Reset file input
    };

    const processImportFiles = async (files) => {
      let successCount = 0;
      let errorCount = 0;

      for (const file of files) {
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          try {
            await presetDatabase.handleFileDrop(file);
            successCount++;
          } catch (error) {
            console.error(`Failed to import ${file.name}:`, error);
            errorCount++;
          }
        } else {
          errorCount++;
        }
      }

      await loadUserPresets();

      let message = '';
      if (successCount > 0) {
        message += `${successCount} preset${successCount > 1 ? 's' : ''} imported successfully`;
      }
      if (errorCount > 0) {
        if (message) message += ', ';
        message += `${errorCount} file${errorCount > 1 ? 's' : ''} failed to import`;
      }

      showImportStatus.value = true;
      importStatus.value = {
        success: successCount > 0,
        message: message || 'No valid preset files found'
      };
    };

    // Initialize parameter interface when component mounts
    onMounted(async () => {
      // Initialize preset database
      try {
        await presetDatabase.init();
        window.presetDatabase = presetDatabase; // Make available globally
        await loadUserPresets();
        console.log('Preset database initialized');
      } catch (error) {
        console.error('Failed to initialize preset database:', error);
      }


      window.physarum = new Physarum(document.getElementById("canvas"));
      window.addEventListener("resize", physarum.resizeCanvas.bind(physarum));
      document.addEventListener("pointermove", physarum.mouseTouchMove.bind(physarum));
      document.addEventListener("mousemove", physarum.mouseTouchMove.bind(physarum));
      document.addEventListener("mousedown", physarum.mousedown.bind(physarum));
      document.addEventListener("mouseup", physarum.mouseup.bind(physarum));
      document.addEventListener("mouseleave", physarum.mouseup.bind(physarum));

      function animate() {
        if (physarum.params.update) {
          physarum.draw();
        }
        requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);


      // Wait for global parameter interface to be available
      const checkInterface = () => {
        if (window.createParameterProxy) {
          parameterInterface = window.createParameterProxy();
          presetItems.value = parameterInterface.presetNames.map((name, index) => ({
            title: `${String(index + 1).padStart(2, '0')}. ${name.replace(/_/g, ' ')}`,
            value: index
          }))
          currentPresetIndex.value = parameterInterface.presetIndex;
          updateParametersFromInterface();

          // Initialize database with default presets if needed
          presetDatabase.saveDefaultPresets(
            parameterInterface.allParams,
            parameterInterface.presetNames
          ).catch(error => {
            console.error('Failed to save default presets:', error);
          });

          // Set up periodic sync to keep control panel updated
          setInterval(() => {
            if (parameterInterface && !suppressUpdates) {
              // Check if preset changed
              if (currentPresetIndex.value !== parameterInterface.presetIndex) {
                currentPresetIndex.value = parameterInterface.presetIndex;
              }
              // Update parameters to reflect current state
              updateParametersFromInterface();
            }
          }, 100); // Update every 100ms
        } else {
          setTimeout(checkInterface, 100);
        }
      };
      checkInterface();
      document.body.addEventListener("keypress", (e) => {
        setTimeout(() => {
          updateParametersFromInterface();
        }, 1);
      });
      window.addEventListener("mousemove", () => {
        showHeader();
        startHideTimer();
      });

      function handleKeyPress(e) {

        const character = String.fromCharCode(e.keyCode);

        switch (character) {
          case "\\":
            // Freeze current parameters
            parameterInterface.systemParams.params = particleSystem.lerpParams;
            parameterInterface.systemParams.lerpTime = 1;
            console.log("Frozen!");
            break;
          case "U":
            // Toggle update
            parameterInterface.systemParams.update = !parameterInterface.systemParams.update;
            break;
          case "R":
            // Reset system
            parameterInterface.reset();

            break;
          case "L":
            // Log current parameters
            console.log("Current parameters: " + particleSystem.lerpParams);
            break;
          case " ":
            // Toggle fullscreen
            toggleFullscreen();
            console.log("Toggle fullscreen");
            break;
          case "~":
            // Random interpolation
            if (window.createParameterProxy) {
              const paramInterface = window.createParameterProxy();
              paramInterface.randomize(0.5);
              console.log("Parameters randomized");
            } else {
              // Fallback to old method
              interpolateBetweenPresets(
                Math.floor(Math.random() * keyCodeMapping.length),
                Math.floor(Math.random() * keyCodeMapping.length),
                parseFloat(Math.random().toFixed(3)),
                true,
                false
              );
            }
            break;
          case "+":
            // Increase convergence rate
            parameterInterface.systemParams.convergenceRate = Math.max(1e-15, 0.5 * parameterInterface.systemParams.convergenceRate);
            console.log("Convergence speed: " + parameterInterface.systemParams.convergenceRate);
            break;
          case "-":
            // Decrease convergence rate
            parameterInterface.systemParams.convergenceRate = Math.min(1, 2 * parameterInterface.systemParams.convergenceRate);
            console.log("Convergence speed: " + parameterInterface.systemParams.convergenceRate);
            break;
        }
      }

      document.body.addEventListener("keypress", handleKeyPress);



      // Start auto-hide timer
      startHideTimer();
    });

    onUnmounted(() => {
      document.body.removeEventListener("keypress", handleKeyPress);
      clearTimeout(hideTimer.value);
      if (updateTimer) {
        clearTimeout(updateTimer);
      }
    });

    return {
      // State
      headerVisible,
      controlPanelOpen,
      activeTab,
      currentPresetIndex,
      selectMenuOpen,
      parameters,

      // User preset management
      userPresets,
      showSaveDialog,
      showDeleteDialog,
      editingPreset,
      presetToDelete,
      presetForm,

      // Import/export state
      dragOver,
      showImportStatus,
      importStatus,

      interpolationTarget,
      interpolationAmount,
      presetItems,
      currentPresetValue,
      allPresetItems,

      // Computed
      currentPresetName,

      // Methods
      showHeader,
      startHideTimer,
      toggleControlPanel,
      updateParameter,
      updateSystemParameter,
      switchPreset,
      resetCurrentPreset,
      resetAllDefaults,
      randomizeParameters,
      interpolatePresets,

      // User preset methods
      savePreset,
      editUserPreset,
      exportUserPreset,
      deleteUserPreset,
      confirmDeletePreset,
      cancelPresetEdit,

      // File handling
      handleFileDrop,
      handleFileSelect,

      // Math for template
      Math
    };
  }
});
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
  backdrop-filter: blur(8px);
}

.v-tabs {
  background: transparent;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Drag and drop styles */
.drop-zone {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.drop-zone-active {
  border-color: #2196F3;
  background-color: rgba(33, 150, 243, 0.1);
  transform: scale(1.02);
}
</style>
