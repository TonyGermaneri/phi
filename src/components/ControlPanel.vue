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
      <v-select
        v-model="currentPresetIndex"
        :items="presetItems"
        variant="outlined"
        density="compact"
        style="max-width: 300px"
        hide-details
        @update:model-value="switchPreset"
      >
        <template v-slot:selection="{ item }">
          <span class="text-white" style="white-space: nowrap;">{{ item.title }}</span>
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
      <v-card flat height="100%">
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
              <v-row>
                <v-col cols="12">
                  <v-card variant="outlined">
                    <v-card-title>Pattern Presets</v-card-title>
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
                            Reset to Original
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

              <v-card variant="tonal" class="mt-4">
                <v-card-text>
                  <p class="text-body-2">
                    <strong>Color Evolution:</strong> Colors evolve organically based on trail intensity.
                  </p>
                  <p class="text-caption mt-2">
                    The color system uses HSL (Hue, Saturation, Lightness) with dynamic hue, saturation, and lightness
                    that respond to the same trail intensities that drive particle behavior, creating
                    colors that naturally follow the organic patterns of the simulation.
                  </p>
                </v-card-text>
              </v-card>
            </v-tabs-window-item>

            <!-- Advanced Tab -->
            <v-tabs-window-item value="advanced">
              <v-row>
                <v-col cols="12">
                  <h3 class="mb-4">Advanced Parameters</h3>
                  <p class="text-body-2 mb-4">
                    Position offsets and fine-tuning parameters for advanced users.
                  </p>
                </v-col>
              </v-row>

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

              <v-divider class="my-4"></v-divider>

              <v-card variant="outlined">
                <v-card-title>Interpolation Controls</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12">
                      <v-select
                        v-model="interpolationTarget"
                        :items="presetItems"
                        label="Interpolate with preset"
                        variant="outlined"
                      ></v-select>
                    </v-col>
                    <v-col cols="12">
                      <v-slider
                        v-model="interpolationAmount"
                        label="Interpolation Amount"
                        :min="0"
                        :max="1"
                        :step="0.01"
                        thumb-label
                        @update:model-value="interpolatePresets"
                      ></v-slider>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-tabs-window-item>

          </v-tabs-window>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>

    <!-- Import Dialog -->
    <v-dialog v-model="showImportDialog" max-width="500">
      <v-card>
        <v-card-title>Import Parameters</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="importText"
            label="Paste parameter array here"
            variant="outlined"
            rows="6"
            placeholder='[0.000, 4.000, 0.300, ...]'
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showImportDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="importParameters">Import</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import ParameterControl from './ParameterControl.vue';

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
    const showImportDialog = ref(false);
    const importText = ref('');
    const interpolationTarget = ref(0);
    const interpolationAmount = ref(0);
    const presetItems = ref([]);

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
      lightnessMultiplier: 0
    });

    // Access to global parameter interface
    let parameterInterface = null;
    let updateTimer = null;
    let suppressUpdates = false;

    const currentPresetName = computed(() => {
      if (!parameterInterface) return '';
      return parameterInterface.presetName.replace(/_/g, ' ');
    });

    // Methods
    const showHeader = () => {
      clearTimeout(hideTimer.value);
      headerVisible.value = true;
    };

    const startHideTimer = () => {
      if (!controlPanelOpen.value) {
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
    };

    const updateParameter = (index, value) => {
      if (parameterInterface) {
        parameterInterface.setParam(index, value, true);
      }
    };

    const switchPreset = (index) => {
      if (parameterInterface && typeof index === 'number') {
        parameterInterface.switchPreset(index);
        currentPresetIndex.value = index;
        updateParametersFromInterface();
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
        parameterInterface.randomize(0.5); // 20% variance
        updateParametersFromInterface();
      }
    };

    const interpolatePresets = (amount) => {
      if (parameterInterface && interpolationTarget.value !== null) {
        parameterInterface.interpolateWith(interpolationTarget.value, amount);
        updateParametersFromInterface();
      }
    };

    const exportParameters = () => {
      if (parameterInterface) {
        const params = Array.from(parameterInterface.currentParams);
        const exportString = JSON.stringify(params, null, 2);

        // Copy to clipboard
        navigator.clipboard.writeText(exportString).then(() => {
          console.log('Parameters exported to clipboard');
        }).catch(err => {
          console.error('Failed to copy parameters: ', err);
        });
      }
    };

    const importParameters = () => {
      try {
        const params = JSON.parse(importText.value);
        if (Array.isArray(params) && params.length === 24) {
          if (parameterInterface) {
            parameterInterface.applyChanges(params, true);
            updateParametersFromInterface();
            showImportDialog.value = false;
            importText.value = '';
          }
        } else {
          console.error('Invalid parameter format. Must be array of 24 numbers.');
        }
      } catch (error) {
        console.error('Failed to parse parameters:', error);
      }
    };

    // Initialize parameter interface when component mounts
    onMounted(() => {
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
      window.addEventListener("mousemove", () => {
        showHeader();
        startHideTimer();
      });
      // Start auto-hide timer
      startHideTimer();
    });

    onUnmounted(() => {
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
      parameters,
      showImportDialog,
      importText,
      interpolationTarget,
      interpolationAmount,
      presetItems,

      // Computed
      currentPresetName,

      // Methods
      showHeader,
      startHideTimer,
      toggleControlPanel,
      updateParameter,
      switchPreset,
      resetCurrentPreset,
      randomizeParameters,
      interpolatePresets,
      exportParameters,
      importParameters,

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
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>
