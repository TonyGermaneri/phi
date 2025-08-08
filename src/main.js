/**
 * main.js
 *
 * Particle system generative art application
 * Deobfuscated from minified code
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Styles
import 'unfonts.css'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')

// Particle system configuration
const DEFAULT_POINT_INDEX = 6;
// Particle system parameter definitions
// Each line represents a different visual pattern/configuration
// Format: [26 parameters per line] followed by // pattern_name
// Parameters 0-19: Original physarum parameters
// Parameters 20-25: Color parameters (hueBase, hueMultiplier, saturationBase, saturationMultiplier, lightnessBase, lightnessMultiplier)
const PARTICLE_PARAMETERS = `
0.000, 4.000, 0.300, 0.100, 51.32, 20.00, 0.410, 4.000, 0.000, 0.100, 6.000, 0.100, 0.000, 0.000, 0.400, 0.705, 1.000, 0.300, 0.250, 8.0, 0.200, 0.800, 0.700, 0.300, 0.600, 0.000,   // pure_multiscale
0.000, 28.04, 14.53, 0.090, 1.000, 0.000, 0.010, 1.400, 1.120, 0.830, 0.000, 0.000, 0.570, 0.030, 0.070, 0.986, 1.000, 0.230, 0.166, 6.0, 0.500, 1.200, 0.800, 0.500, 0.600, 0.000,   // hex_hole_open
17.92, 0.000, 0.000, 0.520, 0.000, 0.000, 0.180, 0.000, 0.000, 0.100, 6.050, 0.170, 0.000, 0.000, 0.040, 0.973, 1.000, 0.530, 0.455, 16., 0.000, 0.600, 0.900, 0.200, 0.600, 0.000,   // vertebrata
3.000, 0.000, 0.000, 0.350, 0.000, 0.000, 0.000, 0.570, 2.000, 0.010, 4.000, 0.020, 0.300, 0.000, 0.110, 0.945, 1.000, 0.180, 0.248, 16., 0.100, 1.000, 0.600, 0.400, 0.600, 0.000,   // traffic_many_lanes
13.95, 7.460, 0.110, 4.040, 5.000, 0.520, 0.490, 0.580, 0.180, 7.590, 3.040, 0.160, 4.760, 0.000, 0.610, 0.975, 1.000, 0.348, 0.172, 5.0, 0.800, 0.400, 0.750, 0.600, 0.600, 0.000,   // tactile_extreme
3.000, 10.17, 0.400, 1.030, 2.300, 2.000, 1.420, 20.00, 0.750, 0.830, 1.560, 0.110, 1.070, 0.000, 0.200, 0.951, 10.00, 0.150, 0.248, 16., 0.300, 1.500, 0.850, 0.350, 0.600, 0.000,   // star_network
0.000, 8.510, 0.190, 0.610, 0.000, 0.000, 3.350, 0.000, 0.000, 0.750, 12.62, 0.060, 0.000, 0.000, 0.270, 0.904, 1.000, 0.060, 0.042, 7.0, 0.600, 0.800, 0.900, 0.300, 0.600, 0.000,   // enmeshed_singularities
0.000, 0.820, 0.030, 0.1800, 0.00, 0.000, 0.260, 0.000, 0.000, 0.000, 20.00, 0.650, 0.200, 0.900, 0.140, 0.939, 1.000, 0.470, 0.430, 10., 0.150, 0.900, 0.700, 0.800, 0.600, 0.000,   // waves_upturn
0.000, 8.440, 0.080, 4.820, 0.000, 0.000, 1.190, 0.000, 0.000, 0.000, 0.330, 0.010, 0.000, 0.000, 0.040, 0.980, 1.000, 0.320, 0.172, 7.0, 0.250, 1.100, 0.650, 0.700, 0.600, 0.000,   // turing
1.660, 19.26, 0.060, 1.260, 0.000, 0.000, 1.650, 0.000, 0.000, 0.060, 5.740, 0.080, 0.000, 3.040, 0.110, 0.988, 3.000, 0.134, 0.221, 19., 0.400, 0.700, 0.800, 0.400, 0.600, 0.000,   // petri_worms
0.000, 17.54, 0.080, 0.640, 0.000, 0.000, 1.800, 0.000, 0.000, 0.100, 20.00, 0.060, 0.400, 0.000, 0.200, 0.939, 1.000, 0.200, 0.283, 14., 0.700, 0.500, 0.750, 0.500, 0.600, 0.000,   // a_rooting
1.500, 1.940, 0.280, 1.730, 1.120, 0.710, 0.180, 2.220, 0.850, 0.500, 4.130, 0.110, 1.120, 0.000, 0.020, 0.850, 1.000, 0.140, 0.234, 11., 0.350, 1.300, 0.600, 0.900, 0.600, 0.000,   // more_individuals
8.340, 3.860, 0.030, 1.210, 1.400, 0.300, 1.130, 5.500, 0.390, 17.85, 8.510, 0.960, 0.000, 7.140, 0.020, 0.781, 1.000, 0.200, 0.166, 16., 0.900, 0.600, 0.850, 0.300, 0.600, 0.000,   // slow_metastructure
2.870, 3.040, 0.280, 0.090, 0.000, 0.000, 0.440, 0.850, 0.000, 0.000, 2.220, 0.140, 0.300, 0.850, 0.020, 0.891, 1.000, 0.140, 0.166, 21., 0.450, 0.800, 0.700, 0.600, 0.600, 0.000,   // sloppy_bucky
0.140, 1.120, 0.190, 0.270, 1.400, 0.000, 1.130, 2.000, 0.390, 0.750, 2.220, 0.190, 0.000, 7.140, 0.210, 0.795, 1.000, 0.120, 0.166, 19., 0.550, 1.000, 0.900, 0.400, 0.600, 0.000,   // massive_structure
0.001, 2.540, 0.080, 0.000, 0.000, 0.000, 3.350, 0.000, 0.000, 0.100, 12.62, 0.060, 0.000, 0.000, 0.270, 0.877, 1.000, 0.250, 0.344, 5.0, 0.650, 0.900, 0.800, 0.500, 0.600, 0.000,   // speed_modulation
0.000, 20.00, 0.080, 5.280, 0.000, 0.000, 5.200, 0.000, 0.000, 1.440, 1.560, 0.060, 1.810, 0.000, 0.050, 0.987, 1.000, 0.280, 0.172, 16., 0.750, 0.700, 0.600, 0.800, 0.600, 0.000,   // emergent_hex_waves
0.000, 17.26, 0.280, 0.350, 1.120, 0.660, 1.470, 0.570, 1.020, 0.750, 19.18, 0.390, 0.000, 1.940, 0.130, 0.959, 1.000, 0.110, 0.135, 21., 0.100, 1.400, 0.950, 0.250, 0.600, 0.000,   // formalisms
0.000, 89.60, 20.00, 1.300, 0.000, 0.000, 1.300, 1.400, 1.070, 0.750, 69.08, 2.220, 0.300, 0.000, 0.080, 0.959, 1.000, 0.160, 0.332, 10., 0.850, 0.500, 0.700, 0.700, 0.600, 0.000,   // growing_on_a_sea_of_sand
4.240, 75.92, 0.000, 4.390, 0.000, 0.000, 1.300, 171.7, 20.00, 6.220, 7.520, 1.120, 0.000, 0.000, 0.060, 0.877, 5.000, 0.230, 0.166, 11., 0.950, 1.200, 0.800, 0.400, 0.600, 0.000,   // grid_of_sorts
17.92, 89.60, 3.040, 2.670, 34.88, 10.70, 0.350, 294.8, 0.000, 0.001, 82.76, 20.00, 0.000, 0.000, 0.005, 0.999, 1.000, 0.330, 0.289, 6.0, 0.200, 0.800, 0.900, 0.600, 0.600, 0.000,   // negotiation_of_highways
0.000, 28.04, 20.00, 0.180, 26.74, 20.00, 0.010, 1.400, 1.120, 0.830, 0.000, 0.000, 2.540, 0.000, 0.120, 0.959, 1.000, 0.230, 0.166, 5.0, 0.600, 1.100, 0.750, 0.500, 0.600, 0.000,   // transmission_tower
2.000, 28.04, 0.000, 0.090, 1.000, 0.000, 0.800, 2.080, 0.000, 0.000, 2.000, 0.030, 0.820, 0.000, 0.050, 0.889, 1.000, 0.200, 0.394, 16., 0.400, 0.900, 0.650, 0.750, 0.600, 0.000,   // sacred_network_nodules
0.000, 0.850, 0.010, 0.350, 1.400, 0.000, 1.810, 0.570, 1.450, 0.010, 4.000, 0.020, 0.300, 0.000, 0.110, 0.945, 1.000, 0.070, 0.049, 16., 0.300, 1.300, 0.800, 0.350, 0.600, 0.000,   // positive_negative_space
1.660, 20.00, 33.19, 1.030, 39.03, 2.540, 2.650, 364.8, 8.200, 0.050, 2.150, 2.540, 0.000, 0.000, 0.001, 0.975, 1.000, 0.160, 0.115, 14., 0.500, 1.600, 0.700, 0.650, 0.600, 0.000,   // circular_consolidation
0.000, 9.000, 2000., 1.030, 39.03, 2.540, 2.650, 174.3, 8.200, 6.360, 5.000, 20.00, 0.000, 0.000, 0.001, 0.975, 1.000, 0.080, 0.115, 14., 0.800, 0.700, 0.850, 0.550, 0.600, 0.000,   // radiative_nexus
17.92, 89.60, 3.040, 2.670, 34.88, 10.70, 3.350, 294.8, 0.000, 0.001, 69.76, 116.4, 0.000, 0.000, 0.005, 0.999, 1.000, 0.330, 0.289, 10., 0.150, 1.500, 0.900, 0.300, 0.600, 0.000,   // unfold_time_but_only_in_a_line
0.000, 20.00, 3.000, 0.260, 2.150, 4.760, 0.410, 6.600, 12.62, 0.300, 6.600, 0.037, 0.400, 0.040, 0.030, 0.926, 1.000, 0.450, 0.459, 10., 0.000, 0.000, 0.000, 1.000, 0.600, 0.000,   // ink_on_white
0.000, 89.60, 20.00, 1.300, 0.000, 0.000, 0.180, 1.400, 1.070, 0.750, 69.08, 2.220, 0.300, 0.000, 0.080, 0.960, 1.000, 0.160, 0.332, 7.0, 0.350, 1.100, 0.800, 0.400, 0.600, 0.000,   // network_time
0.000, 0.800, 0.020, 0.100, 1.000, 0.000, 0.260, 0.100, 2.790, 0.830, 32.88, 37.74, 0.090, 0.330, 0.100, 0.939, 1.000, 0.430, 0.262, 3.0, 0.750, 0.600, 0.950, 0.700, 0.600, 0.000,   // inverse_network
27.50, 2.000, 2.540, 0.880, 26.74, 0.000, 0.090, 267.4, 1.400, 0.100, 5.000, 7.410, 1.400, 14.25, 0.140, 0.754, 1.000, 0.600, 0.627, 11., 0.900, 1.200, 0.600, 0.800, 0.600, 0.000,   // vanishing_points
5.350, 6.000, 0.000, 0.100, 1.000, 0.000, 0.180, 1.000, 0.000, 0.000, 2.150, 0.330, 0.000, 0.000, 0.100, 0.840, 2.000, 0.230, 0.164, 16., 0.250, 1.400, 0.750, 0.600, 0.600, 0.000,   // neuron_cluster
0.000, 6.000, 100.0, 0.157, 1.000, 1.070, 0.000, 1.000, 5.000, 0.830, 5.000, 20.00, 0.400, 0.000, 0.003, 0.914, 1.000, 0.250, 0.361, 6.0, 0.450, 0.800, 0.700, 0.900, 0.600, 0.000,   // scaling_nodule_emergence
0.005, 6.000, 205.3, 0.000, 1.000, 1.000, 0.180, 2.200, 20.00, 0.830, 3.000, 1.320, 0.400, 0.000, 0.001, 0.939, 1.000, 0.150, 0.361, 6.0, 0.650, 1.000, 0.850, 0.500, 0.600, 0.000,   // probe_emergence_from_line
0.000, 15.00, 8.600, 0.030, 1.000, 0.000, 0.340, 2.000, 1.070, 0.220, 15.00, 0.100, 2.300, 0.820, 1.000, 0.705, 1.000, 0.420, 0.373, 8.0, 0.100, 1.800, 0.600, 0.750, 0.600, 0.000,   // hyp_offset
0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 1.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.230, 0.166, 4.0, 0.500, 0.500, 0.500, 0.500, 0.600, 0.000,   // noise
0.000, 32.88, 402.0, 0.410, 3.000, 0.000, 0.100, 0.000, 0.000, 0.300, 6.000, 0.000, 0.000, 0.000, 0.090, 0.914, 1.000, 0.460, 0.290, 6.0, 0.850, 0.900, 0.700, 0.400, 0.600, 0.000,   // strike
5.350, 2.150, 0.000, 0.340, 20.59, 0.000, 0.490, 0.100, 2.790, 0.830, 125.1, 45.11, 0.090, 0.000, 0.190, 0.975, 1.000, 0.550, 0.213, 6.0, 0.700, 1.300, 0.800, 0.600, 0.600, 0.000,   // suture
0.000, 100.5, 20.00, 0.180, 14.44, 0.000, 1.260, 0.000, 0.000, 0.830, 75.91, 0.860, 0.300, 0.000, 0.390, 0.975, 2.000, 0.250, 0.250, 11., 0.550, 0.700, 0.900, 0.800, 0.600, 0.000,   // surface_tension_sharp
0.000, 0.800, 0.020, 0.340, 20.59, 0.000, 0.260, 0.100, 2.790, 0.830, 125.1, 45.11, 0.580, 0.330, 0.190, 0.975, 1.000, 0.520, 0.238, 5.0, 0.300, 1.100, 0.650, 0.950, 0.600, 0.000,   // pincushion
0.000, 0.800, 0.020, 5.200, 1.000, 0.000, 0.260, 0.100, 2.790, 0.830, 32.88, 37.74, 0.090, 0.330, 0.100, 0.939, 1.000, 0.450, 0.189, 6.0, 0.800, 0.800, 0.750, 0.700, 0.600, 0.000,   // clear_spaghetti
17.92, 89.60, 3.040, 2.670, 34.88, 10.70, 5.770, 294.8, 0.000, 0.001, 82.76, 20.00, 0.000, 0.000, 0.005, 0.999, 1.000, 0.330, 0.289, 10., 0.950, 1.600, 0.550, 0.650, 0.600, 0.000,   // negotiation_of_zoning
1.829, 23.65, 0.029, 0.674, 0.500, 0.000, 1.224, 1.039, 0.000, 0.029, 3.869, 0.054, 0.409, 1.519, 0.080, 0.938, 2.000, 0.065, 0.307, 18., 0.600, 1.000, 0.800, 0.350, 0.600, 0.000,   // hexa1833
`;
// Global state variables
let currentPresetIndex = DEFAULT_POINT_INDEX - 1;
let isInterpolating = false;

// Parse parameter data
const parameterLines = PARTICLE_PARAMETERS.split("\n");
parameterLines.shift(); // Remove first empty line

// Split each line into parameters
for (let i = 0; i < parameterLines.length; ++i) {
  parameterLines[i] = parameterLines[i].split(",");
}

let blurIterations = [];
let parameterSets = [];
let presetNames = [];
let frameCounter = 0;

// Process parameter data
for (let lineIndex = 0; lineIndex < parameterLines.length; ++lineIndex) {
  // Only process lines with enough parameters (at least 25 for the parameters + 1 for the name)
  if (parameterLines[lineIndex].length >= 25) {
    parameterSets.push(new Float32Array(parameterLines[lineIndex].slice(0, 26)));

    // Add blur iteration for this valid parameter set
    if (parameterLines[lineIndex].length > 16) {
      blurIterations.push(parseInt(parameterLines[lineIndex][16]));
    } else {
      blurIterations.push(0); // Default blur iterations if not available
    }

    // Only add preset name if we successfully added a parameter set
    let presetName = parameterLines[lineIndex][26] + "";
    presetName = presetName.replace(/\s|\//g, "");
    presetNames.push(presetName);
  }
}
// Mobile device adjustments for better performance
const isMobileDevice = ["iPad", "iPhone", "iPod"].includes(navigator.platform) ||
                       (navigator.userAgent.includes("Mac") && "ontouchend" in document);

if (isMobileDevice) {
  // Adjust parameters for mobile devices
  parameterSets[16][15] = 0.988;
  parameterSets[18][15] = 0.977;
  parameterSets[25][15] = 0.99;
  parameterSets[27][15] = 0.965;
  parameterSets[28][15] += 0.02;
  parameterSets[29][15] -= 0.002;
  parameterSets[32][15] += 0.04;
  parameterSets[33][15] += 0.045;
  parameterSets[35][15] += 0.1;
}

// Detect mobile layout orientation
let isMobileLayout = window.innerWidth / window.innerHeight < 0.8;
if (navigator.platform === "iPad") {
  isMobileLayout = false;
}

console.log("Point " + DEFAULT_POINT_INDEX.toString().padStart(2, "0") + " (" + presetNames[DEFAULT_POINT_INDEX - 1] + ")");

// Parameter names for proxy interface
const PARAMETER_NAMES = [
  'param0', 'param1', 'param2', 'param3', 'param4', 'param5', 'param6', 'param7', 'param8', 'param9',
  'param10', 'param11', 'param12', 'param13', 'param14', 'param15', 'param16', 'param17', 'param18', 'param19',
  'param20', 'param21', 'param22', 'param23'
];

// Physarum simulation parameter names based on Sage Jenson's "36 Points" algorithm
const PHYSARUM_PARAMETER_NAMES = [
  'sensorDistanceBase',        // p0: Sensor Distance base value (p1 in formula)
  'sensorDistanceMultiplier',  // p1: Sensor Distance multiplier (p2 in formula)
  'sensorDistanceExponent',    // p2: Sensor Distance exponent (p3 in formula)
  'sensorAngleBase',           // p3: Sensor Angle base value (p4 in formula)
  'sensorAngleMultiplier',     // p4: Sensor Angle multiplier (p5 in formula)
  'sensorAngleExponent',       // p5: Sensor Angle exponent (p6 in formula)
  'rotationAngleBase',         // p6: Rotation Angle base value (p7 in formula)
  'rotationAngleMultiplier',   // p7: Rotation Angle multiplier (p8 in formula)
  'rotationAngleExponent',     // p8: Rotation Angle exponent (p9 in formula)
  'moveDistanceBase',          // p9: Move Distance base value (p10 in formula)
  'moveDistanceMultiplier',    // p10: Move Distance multiplier (p11 in formula)
  'moveDistanceExponent',      // p11: Move Distance exponent (p12 in formula)
  'positionOffsetY',           // p12: Vertical position offset (p13 in formula)
  'positionOffsetHeading',     // p13: Heading-relative position offset (p14 in formula)
  'trailSenseScale',           // p14: Trail sensing scale factor (p15 in implementation)
  'decayFactor',               // p15: Trail decay factor (typically ~0.75-0.99)
  'blurIterations',            // p16: Number of blur/diffusion iterations
  'drawOpacity',               // p17: Visual opacity for drawing particles
  'fillOpacity',               // p18: Visual opacity for filling
  'depositAmount',             // p19: Amount deposited by each particle
  'hueBase',                   // p20: Base hue value (0-1)
  'hueMultiplier',             // p21: Hue multiplier based on trail intensity
  'saturationBase',            // p22: Base saturation value (0-1)
  'saturationMultiplier',      // p23: Saturation multiplier based on trail intensity
  'lightnessBase',             // p24: Base lightness value (0-1)
  'lightnessMultiplier'        // p25: Lightness multiplier based on trail intensity
];

// Combined parameter access - allows both numeric and semantic naming
const ALL_PARAMETER_NAMES = [...PARAMETER_NAMES, ...PHYSARUM_PARAMETER_NAMES];

/**
 * Creates a proxy-based interface for real-time parameter manipulation
 * @returns {Object} Proxy object with parameter access and manipulation methods
 */
function createParameterProxy() {
  const parameterInterface = {
    // Current parameter values (live array reference)
    get currentParams() {
      return parameterSets[currentPresetIndex];
    },

    // Get current preset index
    get presetIndex() {
      return currentPresetIndex;
    },

    // Get current preset name
    get presetName() {
      return presetNames[currentPresetIndex];
    },

    // Get all preset names
    get presetNames() {
      return [...presetNames];
    },

    // Get all parameter sets
    get allParams() {
      return parameterSets.map(params => [...params]);
    },

    // Switch to a specific preset
    switchPreset(index) {
      if (index >= 0 && index < parameterSets.length) {
        switchToPreset(index);
      }
    },

    // Apply parameter changes with optional smooth transition
    applyChanges(newParams, smooth = true) {
      if ((Array.isArray(newParams) || newParams instanceof Float32Array) && newParams.length === 26) {
        const targetParams = new Float32Array(newParams);

        // Always update the parameter set immediately
        parameterSets[currentPresetIndex] = targetParams;

        if (smooth && typeof particleSystem !== 'undefined') {
          systemParams.pastParams = particleSystem.lerpParams || systemParams.params;
          systemParams.params = targetParams;
          systemParams.lerpTime = 0;
        } else {
          // Direct update
          systemParams.params = targetParams;
          if (typeof particleSystem !== 'undefined') {
            particleSystem.lerpParams = targetParams;
          }
        }

        // Update visual parameters
        systemParams.drawOpacity = targetParams[17];
        systemParams.fillOpacity = targetParams[18];

        console.log(`Parameters updated for preset "${presetNames[currentPresetIndex]}" (${smooth ? 'smooth' : 'instant'})`);
      } else {
        console.error('Invalid parameters: must be an array of 26 numbers');
      }
    },
    // Reset current preset to original values
    reset() {
      const originalIndex = currentPresetIndex;
      // Force reload from original data
      const originalLine = parameterLines[originalIndex];
      if (originalLine && originalLine.length >= 26) {
        const originalParams = new Float32Array(originalLine.slice(0, 26));
        this.applyChanges(originalParams, false);
      }
    },

    // Get parameter by index
    getParam(index) {
      if (index >= 0 && index < 26) {
        return this.currentParams[index];
      }
      return undefined;
    },

    // Set parameter by index
    setParam(index, value, smooth = true) {
      if (index >= 0 && index < 26 && typeof value === 'number') {
        const newParams = [...this.currentParams];
        newParams[index] = value;
        this.applyChanges(newParams, smooth);
      }
    },

    // Batch set multiple parameters
    setParams(paramUpdates, smooth = true) {
      const newParams = [...this.currentParams];
      let hasChanges = false;

      for (const [index, value] of Object.entries(paramUpdates)) {
        const paramIndex = parseInt(index);
        if (paramIndex >= 0 && paramIndex < 26 && typeof value === 'number') {
          newParams[paramIndex] = value;
          hasChanges = true;
        }
      }

      if (hasChanges) {
        this.applyChanges(newParams, smooth);
      }
    },

    // Interpolate between current preset and another
    interpolateWith(targetIndex, amount) {
      if (targetIndex >= 0 && targetIndex < parameterSets.length &&
          amount >= 0 && amount <= 1) {
        const sourceParams = this.currentParams;
        const targetParams = parameterSets[targetIndex];
        const interpolated = interpolateParameterArrays(sourceParams, targetParams, amount);
        this.applyChanges(interpolated, true);
      }
    },

    // Create a random variation of current parameters
    randomize(variance = 0.5) {
      const currentParams = this.currentParams;

      if (!currentParams) {
        console.error('currentParams is null/undefined');
        return;
      }

      if (!Array.isArray(currentParams) && !(currentParams instanceof Float32Array)) {
        console.error('currentParams is not an array:', currentParams);
        return;
      }

      if (currentParams.length !== 26) {
        console.error(`currentParams has wrong length: ${currentParams.length}, expected 26`);
        return;
      }

      const newParams = currentParams.map(param => {
        const variation = (Math.random() - 0.5) * 2 * variance;
        return Math.max(0, param + param * variation);
      });

      this.applyChanges(newParams, true);
    },

    // Get parameter information with human-readable names
    getParameterInfo(index) {
      if (index >= 0 && index < ALL_PARAMETER_NAMES.length) {
        return {
          index: index,
          genericName: PARAMETER_NAMES[index] || `param_${index}`,
          physarumName: PHYSARUM_PARAMETER_NAMES[index] || `param_${index}`,
          value: this.currentParams[index],
          description: this.getParameterDescription(index)
        };
      }
      return null;
    },

    // Get description of what each parameter does
    getParameterDescription(index) {
      const descriptions = [
        'Sensor Distance base value - controls how far ahead agents look',
        'Sensor Distance multiplier - scales sensing distance based on trail intensity',
        'Sensor Distance exponent - controls non-linear trail response for sensing',
        'Sensor Angle base value - controls the angle between left/right sensors',
        'Sensor Angle multiplier - scales sensor angle based on trail intensity',
        'Sensor Angle exponent - controls non-linear trail response for sensor angle',
        'Rotation Angle base value - controls how much agents turn',
        'Rotation Angle multiplier - scales turning based on trail intensity',
        'Rotation Angle exponent - controls non-linear trail response for turning',
        'Move Distance base value - controls how far agents move each step',
        'Move Distance multiplier - scales movement based on trail intensity',
        'Move Distance exponent - controls non-linear trail response for movement',
        'Position Offset Y - vertical offset for trail sensing',
        'Position Offset Heading - forward/backward offset for trail sensing',
        'Trail Sense Scale - scaling factor for sensed trail values',
        'Decay Factor - how much trails fade each frame (0.75-0.99)',
        'Blur Iterations - number of diffusion steps per frame',
        'Draw Opacity - visual opacity for particle rendering',
        'Fill Opacity - visual opacity for trail filling',
        'Deposit Amount - how much trail each particle deposits',
        'Hue Base - base hue value for color generation (0-1)',
        'Hue Multiplier - scales hue based on trail intensity',
        'Saturation Base - base saturation value for color generation (0-1)',
        'Saturation Multiplier - scales saturation based on trail intensity',
        'Lightness Base - base lightness value for color generation (0-1)',
        'Lightness Multiplier - scales lightness based on trail intensity'
      ];
      return descriptions[index] || 'Unknown parameter';
    },

    // Get all parameter information as an array
    getAllParameterInfo() {
      return Array.from({length: 26}, (_, i) => this.getParameterInfo(i));
    },

    // Set physarum behavior parameters with semantic grouping
    setSensorBehavior(distanceBase, distanceMultiplier, distanceExponent, angleBase, angleMultiplier, angleExponent) {
      this.setParams({
        0: distanceBase,
        1: distanceMultiplier,
        2: distanceExponent,
        3: angleBase,
        4: angleMultiplier,
        5: angleExponent
      });
    },

    // Set movement behavior parameters
    setMovementBehavior(rotationBase, rotationMultiplier, rotationExponent, moveBase, moveMultiplier, moveExponent) {
      this.setParams({
        6: rotationBase,
        7: rotationMultiplier,
        8: rotationExponent,
        9: moveBase,
        10: moveMultiplier,
        11: moveExponent
      });
    },

    // Set visual parameters
    setVisualParams(drawOpacity, fillOpacity, depositAmount) {
      this.setParams({
        17: drawOpacity,
        18: fillOpacity,
        19: depositAmount
      });
    },

    // Set trail parameters
    setTrailParams(decayFactor, blurIterations, senseScale) {
      this.setParams({
        15: decayFactor,
        16: blurIterations,
        14: senseScale
      });
    },

    // Set color parameters
    setColorParams(hueBase, hueMultiplier, saturationBase, saturationMultiplier, lightnessBase, lightnessMultiplier) {
      this.setParams({
        20: hueBase,
        21: hueMultiplier,
        22: saturationBase,
        23: saturationMultiplier,
        24: lightnessBase,
        25: lightnessMultiplier
      });
    },

    // Expose systemParams for system-level controls
    get systemParams() {
      return systemParams;
    }
  };

  // Create proxy with dynamic parameter access
  return new Proxy(parameterInterface, {
    get(target, prop) {
      // Handle existing methods and properties
      if (prop in target) {
        return target[prop];
      }

      // Handle parameter access by generic name (param0, param1, etc.)
      const paramIndex = PARAMETER_NAMES.indexOf(prop);
      if (paramIndex !== -1) {
        return target.getParam(paramIndex);
      }

      // Handle parameter access by physarum name (sensorDistanceBase, etc.)
      const physarumIndex = PHYSARUM_PARAMETER_NAMES.indexOf(prop);
      if (physarumIndex !== -1) {
        return target.getParam(physarumIndex);
      }

      // Handle parameter access by index (p0, p1, etc.)
      if (typeof prop === 'string' && prop.startsWith('p') && prop.length <= 3) {
        const index = parseInt(prop.substring(1));
        if (!isNaN(index) && index >= 0 && index < 20) {
          return target.getParam(index);
        }
      }

      return undefined;
    },

    set(target, prop, value) {
      // Handle parameter setting by generic name (param0, param1, etc.)
      const paramIndex = PARAMETER_NAMES.indexOf(prop);
      if (paramIndex !== -1 && typeof value === 'number') {
        target.setParam(paramIndex, value, true);
        return true;
      }

      // Handle parameter setting by physarum name (sensorDistanceBase, etc.)
      const physarumIndex = PHYSARUM_PARAMETER_NAMES.indexOf(prop);
      if (physarumIndex !== -1 && typeof value === 'number') {
        target.setParam(physarumIndex, value, true);
        return true;
      }

      // Handle parameter setting by index (p0, p1, etc.)
      if (typeof prop === 'string' && prop.startsWith('p') && prop.length <= 3) {
        const index = parseInt(prop.substring(1));
        if (!isNaN(index) && index >= 0 && index < 20 && typeof value === 'number') {
          target.setParam(index, value, true);
          return true;
        }
      }

      // Allow assignment to any other property (for methods, utilities, etc.)
      target[prop] = value;
      return true;
    },

    ownKeys(target) {
      return [...Object.keys(target), ...ALL_PARAMETER_NAMES];
    },

    has(target, prop) {
      return prop in target || ALL_PARAMETER_NAMES.includes(prop) ||
             (typeof prop === 'string' && prop.startsWith('p') &&
              !isNaN(parseInt(prop.substring(1))) &&
              parseInt(prop.substring(1)) >= 0 && parseInt(prop.substring(1)) < 20);
    }
  });
}

// Create global parameter interface
const phi = createParameterProxy();

// Expose globally for console access
window.phi = phi;

// Add animation utilities for real-time parameter manipulation
phi.animate = {
  // Oscillate a parameter between min and max values
  oscillate(paramIndex, min, max, speed = 1, offset = 0) {
    const animate = () => {
      const time = Date.now() * 0.001 * speed + offset;
      const value = min + (max - min) * (Math.sin(time) * 0.5 + 0.5);
      phi.setParam(paramIndex, value, false);
      return requestAnimationFrame(animate);
    };
    return animate();
  },

  // Smoothly transition a parameter to a target value
  tweenTo(paramIndex, targetValue, duration = 2000) {
    const startValue = phi.getParam(paramIndex);
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const currentValue = startValue + (targetValue - startValue) * eased;

      phi.setParam(paramIndex, currentValue, false);

      if (progress < 1) {
        return requestAnimationFrame(animate);
      }
    };
    return animate();
  },

  // Smoothly transition between two presets
  morphPresets(fromIndex, toIndex, duration = 3000) {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      phi.interpolateWith(toIndex, eased);

      if (progress < 1) {
        return requestAnimationFrame(animate);
      }
    };
    return animate();
  },

  // Stop all animations (by clearing all animation frames would require tracking)
  stop() {
    console.log('To stop animations, refresh the page or use clearInterval/cancelAnimationFrame with returned IDs');
  }
};

// Add preset exploration utilities
phi.explore = {
  // Find presets with similar parameter ranges
  findSimilar(paramIndex, tolerance = 0.1) {
    const currentValue = phi.getParam(paramIndex);
    const similar = [];

    phi.allParams.forEach((params, index) => {
      if (index !== phi.presetIndex) {
        const diff = Math.abs(params[paramIndex] - currentValue);
        if (diff <= tolerance) {
          similar.push({
            index,
            name: phi.presetNames[index],
            value: params[paramIndex],
            difference: diff
          });
        }
      }
    });

    return similar.sort((a, b) => a.difference - b.difference);
  },

  // Get statistics about a parameter across all presets
  parameterStats(paramIndex) {
    const values = phi.allParams.map(params => params[paramIndex]);
    values.sort((a, b) => a - b);

    return {
      min: values[0],
      max: values[values.length - 1],
      median: values[Math.floor(values.length / 2)],
      mean: values.reduce((sum, val) => sum + val, 0) / values.length,
      range: values[values.length - 1] - values[0]
    };
  },

  // Find presets where a parameter is at its extreme values
  findExtremes(paramIndex) {
    const allParams = phi.allParams;
    let minValue = Infinity;
    let maxValue = -Infinity;
    let minIndices = [];
    let maxIndices = [];

    allParams.forEach((params, index) => {
      const value = params[paramIndex];
      if (value < minValue) {
        minValue = value;
        minIndices = [index];
      } else if (value === minValue) {
        minIndices.push(index);
      }

      if (value > maxValue) {
        maxValue = value;
        maxIndices = [index];
      } else if (value === maxValue) {
        maxIndices.push(index);
      }
    });

    return {
      min: {
        value: minValue,
        presets: minIndices.map(i => ({ index: i, name: phi.presetNames[i] }))
      },
      max: {
        value: maxValue,
        presets: maxIndices.map(i => ({ index: i, name: phi.presetNames[i] }))
      }
    };
  }
};

// Add preset management utilities
phi.presets = {
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

console.log('🎨 Particle parameter interface initialized!');
console.log('📚 Based on Sage Jenson\'s "36 Points" physarum simulation algorithm and Jeff Jones Characteristics of pattern formation and evolution in approximations of physarum transport networks.');
console.log('');
console.log('Parameter access methods:');
console.log('  phi.param0 = 5.0                    // Generic parameter names');
console.log('  phi.p1 = 2.5                        // Shorthand (p0-p19)');
console.log('  phi.sensorDistanceBase = 3.0        // Semantic physarum names');
console.log('  phi.sensorAngleMultiplier = 1.5     // More descriptive');
console.log('');
console.log('Basic operations:');
console.log('  phi.setParams({0: 1, 5: 3})         // Set multiple parameters');
console.log('  phi.switchPreset(10)                // Switch to preset 10');
console.log('  phi.randomize(0.2)                  // Add 20% random variation');
console.log('  phi.interpolateWith(5, 0.5)         // 50% blend with preset 5');
console.log('  phi.currentParams                   // View current parameters');
console.log('  phi.presetName                      // Current preset name');
console.log('  phi.reset()                         // Reset to original values');
console.log('');
console.log('Parameter information:');
console.log('  phi.getParameterInfo(0)             // Get info for parameter 0');
console.log('  phi.getAllParameterInfo()           // Get info for all parameters');
console.log('');
console.log('Semantic parameter groups:');
console.log('  phi.setSensorBehavior(2,1,0.5,1,0,0)    // Set sensor parameters');
console.log('  phi.setMovementBehavior(1,0,0,2,0,0)    // Set movement parameters');
console.log('  phi.setVisualParams(0.2, 0.3, 8)       // Set visual parameters');
console.log('  phi.setTrailParams(0.85, 1, 1)         // Set trail parameters');
console.log('  phi.setColorParams(0.5,0.2,0.8,0.1,0.6,0.0) // Set color parameters');
console.log('');
console.log('Animation utilities:');
console.log('  phi.animate.oscillate(0, 0, 10, 1)     // Oscillate param 0 between 0-10');
console.log('  phi.animate.tweenTo(5, 15, 2000)       // Tween param 5 to 15 over 2s');
console.log('  phi.animate.morphPresets(0, 5, 3000)   // Morph to preset 5 over 3s');
console.log('');
console.log('Exploration utilities:');
console.log('  phi.explore.findSimilar(0, 0.5)        // Find presets with similar param 0');
console.log('  phi.explore.parameterStats(0)          // Get statistics for param 0');
console.log('  phi.explore.findExtremes(0)            // Find min/max values for param 0');
console.log('');
console.log('Preset management:');
console.log('  phi.presets.resetDefaults()            // Reset all default presets to original values');
console.log('  phi.presets.initializeDatabase()       // Initialize preset database');
console.log('');
console.log('🧬 Physarum simulation parameters:');
console.log('  Sensing: sensorDistanceBase/Multiplier/Exponent, sensorAngleBase/Multiplier/Exponent');
console.log('  Movement: rotationAngleBase/Multiplier/Exponent, moveDistanceBase/Multiplier/Exponent');
console.log('  Position: positionOffsetY, positionOffsetHeading');
console.log('  Trail: trailSenseScale, decayFactor, blurIterations');
console.log('  Visual: drawOpacity, fillOpacity, depositAmount');
console.log('');
console.log('💡 Try: phi.sensorDistanceBase = 15; phi.animate.oscillate(0, 5, 25) for live exploration!');
console.log('');
console.log('🎛️  UI Features:');
console.log('  • Use the gear icon (⚙️) in the top-left to access the Control Panel');
console.log('  • Save custom presets with titles and descriptions');
console.log('  • Export presets as .json files or import by drag & drop');
console.log('  • Reset default presets to original values');
console.log('  • Real-time parameter manipulation with sliders');

// Vertex shader source code (used for rendering)
const VERTEX_SHADER_SOURCE = `#version 300 es
 in vec4 aVertexPosition;
 in vec2 aTexCoord;
 precision highp float;
 out vec2 vTexCoord;
 void main() {
   gl_Position = aVertexPosition;
   vTexCoord = aTexCoord;
 }`;

/**
 * Creates and compiles a WebGL shader program
 * @param {WebGL2RenderingContext} gl - WebGL context
 * @param {Array} shaderInfos - Array of shader objects with source and type
 * @param {Array} transformFeedbackVaryings - Transform feedback varyings (optional)
 * @returns {WebGLProgram} Compiled shader program
 */
function createShaderProgram(gl, shaderInfos, transformFeedbackVaryings) {
  const program = gl.createProgram();

  for (let i = 0; i < shaderInfos.length; i++) {
    const shaderInfo = shaderInfos[i];
    const shader = compileShader(gl, shaderInfo.type, shaderInfo.source);
    gl.attachShader(program, shader);
  }

  if (transformFeedbackVaryings != null) {
    gl.transformFeedbackVaryings(program, transformFeedbackVaryings, gl.INTERLEAVED_ATTRIBS);
  }

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Didn't link shader. Info: " + gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

/**
 * Compiles a single shader
 * @param {WebGL2RenderingContext} gl - WebGL context
 * @param {number} type - Shader type (VERTEX_SHADER or FRAGMENT_SHADER)
 * @param {string} source - Shader source code
 * @returns {WebGLShader} Compiled shader
 */
function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Didn't compile shader. Info: " + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
// Special easter egg flag
let easterEggActive = false;

/**
 * Particle System Class
 * Handles WebGL-based particle simulation and rendering
 */
class ParticleSystem {
  /**
   * Creates a framebuffer texture for screen rendering
   * @param {Float32Array} data - Initial texture data
   * @returns {WebGLTexture} Created texture
   */
  createScreenFramebufferTexture(data) {
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D, 0, this.gl.RGBA32F,
      this.params.renderSize, this.params.renderSize,
      0, this.gl.RGBA, this.gl.FLOAT, data
    );
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    return texture;
  }
  /**
   * Constructor for ParticleSystem
   * @param {WebGL2RenderingContext} gl - WebGL context
   * @param {Object} params - System parameters
   */
  constructor(gl, params) {
    this.gl = gl;
    this.params = params;
    this.frame = 0;
    this.lerpParams = parameterSets[currentPresetIndex];

    // Initialize mouse position tracking (8 positions for trail effect)
    const mousePositionCount = 8;
    this.mousePositions = new Float32Array(mousePositionCount);
    this.mousePositions.fill(-1);

    // Initialize mouse buttons and strength
    this.mouseButton = 0;
    this.mouseStrength = 1.0;

    // Enable required WebGL extensions
    this.gl.getExtension("EXT_color_buffer_float");
    this.gl.getExtension("OES_texture_float_linear");
    this.gl.getExtension("EXT_float_blend");

    // Create screen rendering texture
    this.screenTexture = this.createScreenFramebufferTexture(null);

    // Create shader programs
    this.initializeShaderPrograms();

    // Set up vertex arrays and buffers
    this.initializeBuffersAndVAOs();

    // Initialize simulation texture
    const simTextureSize = this.params.simSize * this.params.simSize * 2;
    this.setTexture(new Float32Array(Array(simTextureSize).fill(0)));
  }

  /**
   * Initialize all shader programs used by the particle system
   */
  initializeShaderPrograms() {
    // Particle update shader (compute shader using transform feedback)
    this.updateParticles = createShaderProgram(this.gl, [
      {
        source: `#version 300 es
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License
// Full license: https://creativecommons.org/licenses/by-nc-sa/3.0/legalcode
// Contact the author for other licensing options (sagejenson.com / @mxsage)
precision highp float;
uniform sampler2D u_trail;
in vec2 i_P;
in float i_A;
in float i_T;
out vec2 v_P;
out float v_A;
out float v_T;
uniform vec2 i_dim;
uniform int pen;
uniform float[26] v;
uniform float[8] mps;
uniform int frame;
uniform int mouseButton;
//uniform float mouseStrength;

vec2 bd(vec2 pos) {
  pos *= .5;
  pos += vec2(.5);
  pos -= floor(pos);
  pos -= vec2(.5);
  pos *= 2.;
  return pos;
}

float gn(in vec2 coordinate, in float seed){
  return fract(tan(distance(coordinate*(seed+0.118446744073709551614), vec2(0.118446744073709551614, 0.314159265358979323846264)))*0.141421356237309504880169);
}

vec2 cr(float t) {
  vec2 G1 = vec2(mps[0], mps[1]);
  vec2 G2 = vec2(mps[2], mps[3]);
  vec2 G3 = vec2(mps[4], mps[5]);
  vec2 G4 = vec2(mps[6], mps[7]);
  vec2 A = G1*-0.5+G2*1.5+G3*-1.5+G4*0.5;
  vec2 B = G1+G2*-2.5+G3*2.+G4*-.5;
  vec2 C = G1*-0.5+G3*0.5 ;
  vec2 D = G2;
  return t*(t*(t*A+B)+C)+D;
}

void main() {
  vec2 dir = vec2(cos(i_T), sin(i_T));
  float hd= i_dim.x/2.;
  vec2 sp=.5*(i_P+ vec2(1.0));
  float sv= texture(u_trail, bd(sp+v[13]/hd*dir+vec2(0.,v[12]/hd))).x;
  sv= max(sv, 0.000000001);
  float sd=v[0]/hd+v[2]*pow(sv,v[1])*250./hd;
  float md=v[9]/hd+v[11]*pow(sv,v[10])*250./hd;
  float sa=v[3]+v[5]*pow(sv, v[4]);
  float ra=v[6]+v[8]*pow(sv, v[7]);
  float m=texture(u_trail, bd(sp+ sd*vec2(cos(i_T), sin(i_T)))).x;
  float l=texture(u_trail, bd(sp+ sd*vec2(cos(i_T+sa), sin(i_T+sa)))).x;
  float r=texture(u_trail, bd(sp+ sd*vec2(cos(i_T-sa), sin(i_T-sa)))).x;
  float h=i_T;
  if (m>l&&m>r){}
  else if (m<l&&m<r){if (gn(i_P*1332.4324,i_T) > 0.5) h+= ra; else h-=ra;}
  else if (l<r) h-=ra;
  else if (l>r) h+=ra;
  vec2 nd=vec2(cos(h), sin(h));
  vec2 op=i_P+nd*md;
  const float segmentPop = 0.005;
  if (i_A < segmentPop && mouseButton == 1){
    op=2.*cr(i_A/segmentPop)-vec2(1.);
    op+= nd*pow(gn(i_P*132.43,i_T), 1.8);
  }
  v_P = bd(op);
  v_A= fract(i_A+segmentPop);
  v_T =h;
}`,
        type: this.gl.VERTEX_SHADER
      },
      {
        source: `#version 300 es
precision highp float;
in float v_A;
void main() {
  discard;
}`,
        type: this.gl.FRAGMENT_SHADER
      }
    ], ["v_P", "v_A", "v_T"]);

    // Particle rendering shader
    this.renderParticles = createShaderProgram(this.gl, [
      {
        source: `#version 300 es
precision highp float;
in vec2 i_P;
uniform float pointsize;
uniform float dotSize;
void main() {
  gl_PointSize = pointsize;
  gl_Position = vec4(i_P, 0.0, 1.0);
  if (gl_VertexID == 0) {
    gl_PointSize = dotSize;
  }
}`,
        type: this.gl.VERTEX_SHADER
      },
      {
        source: `#version 300 es
precision highp float;
out vec4 FragColor;
uniform float[26] v;
uniform int deposit;
uniform sampler2D u_trail;
uniform vec2 u_resolution;

// Boundary wrapping function (same as in vertex shader)
vec2 bd(vec2 pos) {
  pos *= .5;
  pos += vec2(.5);
  pos -= floor(pos);
  pos -= vec2(.5);
  pos *= 2.;
  return pos;
}

// HSL to RGB conversion
vec3 hsl2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
  return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

void main() {
  float opacity;
  if (deposit == 1) {
    opacity = v[14];
  } else {
    opacity = v[17];
  }

  if (dot(gl_PointCoord - 0.5, gl_PointCoord - 0.5) > 0.25) discard;

  vec3 color;
  if (deposit == 1) {
    // For deposit mode, use simple white
    color = vec3(1.0, 1.0, 1.0);
  } else {
    // For display mode, calculate color using trail texture
    // Use the actual rendering resolution for coordinate normalization
    vec2 particleCoord = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
    // Convert to texture space [0,1] like particles: sp = 0.5 * (i_P + 1.0)
    vec2 sp = 0.5 * (particleCoord + 1.0);
    // Apply boundary wrapping exactly like particles do
    float trailIntensity = texture(u_trail, bd(sp)).r;

    // Calculate color using HSL parameters
    float hue = v[20] + v[21] * trailIntensity;
    float saturation = v[22] + v[23] * trailIntensity;
    float lightness = v[24] + v[25] * trailIntensity;

    // Wrap hue and clamp saturation and lightness
    hue = mod(hue, 1.0);
    saturation = clamp(saturation, 0.0, 1.0);
    lightness = clamp(lightness, 0.0, 1.0);

    color = hsl2rgb(vec3(hue, saturation, lightness));
  }

  FragColor = vec4(color, opacity);
}`,
        type: this.gl.FRAGMENT_SHADER
      }
    ], null);

    // Set up attribute locations
    this.setupAttributeLocations();

    // Additional shader programs for blur effects and screen rendering
    this.initializeAdditionalShaders();
  }
  /**
   * Set up attribute locations for shaders
   */
  setupAttributeLocations() {
    this.update_attrib_locations = {
      i_P: {
        location: this.gl.getAttribLocation(this.updateParticles, "i_P"),
        num_components: 2,
        type: this.gl.FLOAT
      },
      i_A: {
        location: this.gl.getAttribLocation(this.updateParticles, "i_A"),
        num_components: 1,
        type: this.gl.FLOAT
      },
      i_T: {
        location: this.gl.getAttribLocation(this.updateParticles, "i_T"),
        num_components: 1,
        type: this.gl.FLOAT
      }
    };

    this.render_attrib_locations = {
      i_P: {
        location: this.gl.getAttribLocation(this.renderParticles, "i_P"),
        num_components: 2,
        type: this.gl.FLOAT
      }
    };
  }

  /**
   * Initialize additional shader programs for blur and screen effects
   */
  initializeAdditionalShaders() {
    // Blur drawing shader
    this.drawBlur = createShaderProgram(this.gl, [
      { source: VERTEX_SHADER_SOURCE, type: this.gl.VERTEX_SHADER },
      {
        source: `#version 300 es
precision highp float;
in vec2 vTexCoord;
uniform vec2 uTextureSize;
out vec4 outColor;
uniform sampler2D uDrawTex;
void main() {
  vec2 uv = texture(uDrawTex, vTexCoord).rg;
  vec3 color = vec3(uv.r);
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`,
        type: this.gl.FRAGMENT_SHADER
      }
    ], null);

    // Blur update shader
    this.updateBlur = createShaderProgram(this.gl, [
      { source: VERTEX_SHADER_SOURCE, type: this.gl.VERTEX_SHADER },
      {
        source: `#version 300 es
precision highp float;
uniform vec2 uTextureSize;
uniform vec2 mouse;
uniform vec2 prevMouse;
uniform sampler2D uUpdateTex;
in vec2 vTexCoord;
out vec2 outState;
uniform float[26] v;
void main() {
  vec2 onePixel = 1.0 / uTextureSize;
  vec2 average = vec2(0.);
  float dec_x = vTexCoord.x - onePixel.x;
  float inc_x = vTexCoord.x + onePixel.x;
  float dec_y = vTexCoord.y - onePixel.y;
  float inc_y = vTexCoord.y + onePixel.y;
  average += texture(uUpdateTex, vec2(dec_x, dec_y)).rg;
  average += texture(uUpdateTex, vec2(dec_x, vTexCoord.y)).rg;
  average += texture(uUpdateTex, vec2(dec_x, inc_y)).rg;
  average += texture(uUpdateTex, vec2(vTexCoord.x, dec_y)).rg;
  average += texture(uUpdateTex, vTexCoord).rg;
  average += texture(uUpdateTex, vec2(vTexCoord.x, inc_y)).rg;
  average += texture(uUpdateTex, vec2(inc_x, dec_y)).rg;
  average += texture(uUpdateTex, vec2(inc_x, vTexCoord.y)).rg;
  average += texture(uUpdateTex, vec2(inc_x, inc_y)).rg;
  average /= 9.;
  outState = average * v[15];
}`,
        type: this.gl.FRAGMENT_SHADER
      }
    ], null);

    // Screen drawing shader
    this.drawScreen = createShaderProgram(this.gl, [
      { source: VERTEX_SHADER_SOURCE, type: this.gl.VERTEX_SHADER },
      {
        source: `#version 300 es
precision highp float;
in vec2 vTexCoord;
out vec4 outColor;
uniform sampler2D uDrawTex;
uniform int invert;
void main() {
  vec4 color = clamp(texture(uDrawTex, vTexCoord), 0., 1.);
  color.a = 1.0;
  if (invert == 1) {
    color.xyz = vec3(1.) - color.xyz;
  }
  outColor = color;
}`,
        type: this.gl.FRAGMENT_SHADER
      }
    ], null);

    // Screen clearing shader
    this.clearScreen = createShaderProgram(this.gl, [
      { source: VERTEX_SHADER_SOURCE, type: this.gl.VERTEX_SHADER },
      {
        source: `#version 300 es
precision highp float;
in vec2 vTexCoord;
out vec4 outColor;
uniform float[26] v;
void main() {
  outColor = vec4(0., 0., 0., v[18]);
}`,
        type: this.gl.FRAGMENT_SHADER
      }
    ], null);
  }

  /**
   * Initialize buffers and vertex array objects
   */
  initializeBuffersAndVAOs() {
    // Create vertex arrays and buffers
    this.vaos = [
      this.gl.createVertexArray(),
      this.gl.createVertexArray(),
      this.gl.createVertexArray(),
      this.gl.createVertexArray()
    ];
    this.buffers = [this.gl.createBuffer(), this.gl.createBuffer()];

    // VAO descriptions
    this.vao_desc = [
      { vao: this.vaos[0], buffers: [{ buffer_object: this.buffers[0], stride: 16, attribs: this.update_attrib_locations }] },
      { vao: this.vaos[1], buffers: [{ buffer_object: this.buffers[1], stride: 16, attribs: this.update_attrib_locations }] },
      { vao: this.vaos[2], buffers: [{ buffer_object: this.buffers[0], stride: 16, attribs: this.render_attrib_locations }] },
      { vao: this.vaos[3], buffers: [{ buffer_object: this.buffers[1], stride: 16, attribs: this.render_attrib_locations }] }
    ];

    // Calculate number of particles and initialize data
    this.params.numParticles = this.params.simSize * this.params.simSize * this.params.particleDensity;
    this.initial_data = new Float32Array(this.generateInitialParticleData(this.params.numParticles));

    // Set up buffers
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[0]);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.initial_data, this.gl.STREAM_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[1]);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.initial_data, this.gl.STREAM_DRAW);

    // Set up vertex arrays
    for (let i = 0; i < this.vao_desc.length; i++) {
      this.setupVertexArray(this.vao_desc[i].buffers, this.vao_desc[i].vao, 4);
    }

    this.read = 0;
    this.write = 1;

    // Initialize screen vertex array and textures
    this.vao = this.initializeScreenVertexArray();
    this.textures = new Array(2);

    for (let i = 0; i < this.textures.length; i++) {
      this.textures[i] = this.loadSimulationTexture(null);
    }

    // Set up framebuffer and OpenGL state
    this.framebuffer = this.gl.createFramebuffer();
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.clearColor(0, 0, 0, 0.1);
  }

  /**
   * Generate initial particle data
   * @param {number} particleCount - Number of particles to generate
   * @returns {Array} Initial particle data array
   */
  generateInitialParticleData(particleCount) {
    let data = [];
    for (let i = 0; i < particleCount; ++i) {
      data.push(2 * Math.random() - 1); // x position
      data.push(2 * Math.random() - 1); // y position
      data.push(i / particleCount);     // age
      data.push(2 * Math.random() * 3.14159); // angle
    }
    return data;
  }

  /**
   * Set up vertex array with buffers and attributes
   * @param {Array} buffers - Buffer descriptions
   * @param {WebGLVertexArrayObject} vao - Vertex array object
   * @param {number} stride - Byte stride per element
   */
  setupVertexArray(buffers, vao, stride) {
    this.gl.bindVertexArray(vao);

    for (let i = 0; i < buffers.length; i++) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers[i].buffer_object);
      let offset = 0;

      for (const attribName in buffers[i].attribs) {
        if (buffers[i].attribs.hasOwnProperty(attribName)) {
          const attrib = buffers[i].attribs[attribName];
          this.gl.enableVertexAttribArray(attrib.location);
          this.gl.vertexAttribPointer(
            attrib.location,
            attrib.num_components,
            attrib.type,
            false,
            buffers[i].stride,
            offset
          );
          offset += attrib.num_components * stride;
        }
      }
    }

    this.gl.bindVertexArray(null);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }
  /**
   * Get uniform location helper
   * @param {WebGLProgram} program - Shader program
   * @param {string} name - Uniform name
   * @returns {WebGLUniformLocation} Uniform location
   */
  getUniformLocation(program, name) {
    return this.gl.getUniformLocation(program, name);
  }

  /**
   * Get attribute location helper
   * @param {WebGLProgram} program - Shader program
   * @param {string} name - Attribute name
   * @returns {number} Attribute location
   */
  getAttributeLocation(program, name) {
    return this.gl.getAttribLocation(program, name);
  }

  /**
   * Update particles using compute shader
   */
  updateParticlesHelper() {
    this.frame++;
    this.gl.enable(this.gl.BLEND);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.useProgram(this.updateParticles);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.uniform1fv(this.gl.getUniformLocation(this.updateParticles, "v"), this.lerpParams);

    // Update mouse position history
    this.mousePositions[0] = this.params.mouse.x;
    this.mousePositions[1] = 1 - this.params.mouse.y;

    for (let i = 7; i >= 2; --i) {
      this.mousePositions[i] = this.mousePositions[i - 2];
    }
    this.gl.uniform1i(this.gl.getUniformLocation(this.updateParticles, "mouseButton"), this.mouseButton);
    this.gl.uniform1f(this.gl.getUniformLocation(this.updateParticles, "mouseStrength"), this.mouseStrength);
    this.gl.uniform1fv(this.gl.getUniformLocation(this.updateParticles, "mps"), this.mousePositions);
    this.gl.uniform1i(this.gl.getUniformLocation(this.updateParticles, "frame"), this.frame);
    this.gl.uniform1i(this.gl.getUniformLocation(this.updateParticles, "pen"), 0 | (easterEggActive || isInterpolating));
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]);
    this.gl.uniform1i(this.getUniformLocation(this.updateParticles, "u_trail"), 1);
    this.gl.uniform2f(this.getUniformLocation(this.updateParticles, "i_dim"), this.params.simSize, this.params.simSize);
    this.gl.bindVertexArray(this.vaos[this.read]);
    this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.buffers[this.write]);
    this.gl.enable(this.gl.RASTERIZER_DISCARD);
    this.gl.beginTransformFeedback(this.gl.POINTS);
    this.gl.drawArrays(this.gl.POINTS, 0, this.params.numParticles);
    this.gl.endTransformFeedback();
    this.gl.disable(this.gl.RASTERIZER_DISCARD);
    this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    this.gl.bindVertexArray(this.vaos[this.read + 2]);

    // Swap read/write buffers
    const temp = this.read;
    this.read = this.write;
    this.write = temp;
  }

  /**
   * Deposit particles to simulation texture
   */
  depositParticlesHelper() {
    this.gl.useProgram(this.renderParticles);
    this.gl.uniform1fv(this.gl.getUniformLocation(this.renderParticles, "v"), this.lerpParams);
    this.gl.uniform1i(this.getUniformLocation(this.renderParticles, "deposit"), 1);
    this.gl.uniform1f(this.getUniformLocation(this.renderParticles, "pointsize"), 1);
    this.gl.uniform1f(this.getUniformLocation(this.renderParticles, "dotSize"), this.lerpParams[19]);

    // Bind the OTHER texture to avoid feedback loop (we're writing to textures[0], so read from textures[1])
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[1]);
    this.gl.uniform1i(this.getUniformLocation(this.renderParticles, "u_trail"), 0);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textures[0], 0);
    this.gl.bindVertexArray(this.vaos[this.read + 2]);
    this.gl.viewport(0, 0, this.params.simSize, this.params.simSize);
    this.gl.drawArrays(this.gl.POINTS, 0, this.params.numParticles);
  }

  /**
   * Apply blur effect to simulation
   */
  blurHelper() {
    this.gl.disable(this.gl.BLEND);
    this.gl.bindVertexArray(this.vao);

    const blurIterationCount = Math.round(this.lerpParams[16]);
    for (let i = 0; i < blurIterationCount; i++) {
      this.gl.useProgram(this.updateBlur);
      this.gl.uniform1fv(this.gl.getUniformLocation(this.updateBlur, "v"), this.lerpParams);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[1]);
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
      this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textures[1], 0);
      this.gl.activeTexture(this.gl.TEXTURE1);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]);
      this.gl.uniform1i(this.getUniformLocation(this.updateBlur, "uUpdateTex"), 1);
      this.gl.uniform2f(this.getUniformLocation(this.updateBlur, "mouse"), this.params.mouse.x, this.params.mouse.y);
      this.gl.uniform2f(this.getUniformLocation(this.updateBlur, "prevMouse"), this.params.prevMouseX, this.params.prevMouseY);
      this.gl.uniform2f(this.getUniformLocation(this.updateBlur, "uTextureSize"), this.params.simSize, this.params.simSize);
      this.gl.viewport(0, 0, this.params.simSize, this.params.simSize);
      this.gl.clearColor(1, 0, 0, 1);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

      // Swap textures
      this.textures = [this.textures[1], this.textures[0]];
    }
    this.gl.enable(this.gl.BLEND);
  }

  /**
   * Draw particles to canvas
   */
  drawParticlesToCanvas() {
    this.gl.bindVertexArray(this.vaos[this.read + 2]);
    this.gl.useProgram(this.renderParticles);
    this.gl.uniform1fv(this.gl.getUniformLocation(this.renderParticles, "v"), this.lerpParams);
    this.gl.uniform1i(this.getUniformLocation(this.renderParticles, "deposit"), 0);
    this.gl.uniform1f(this.getUniformLocation(this.renderParticles, "pointsize"), this.params.drawPointsize);
    this.gl.uniform1f(this.getUniformLocation(this.renderParticles, "dotSize"), this.lerpParams[19]);
    this.gl.uniform2f(this.getUniformLocation(this.renderParticles, "u_resolution"), this.params.renderSize, this.params.renderSize);

    // Bind trail texture for color calculation
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]);
    this.gl.uniform1i(this.getUniformLocation(this.renderParticles, "u_trail"), 1);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.screenTexture, 0);
    this.gl.enable(this.gl.BLEND);
    this.gl.viewport(0, 0, this.params.renderSize, this.params.renderSize);
    this.gl.drawArrays(this.gl.POINTS, 0, this.params.numParticles);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
  }

  /**
   * Fade screen with opacity
   */
  fadeScreen() {
    this.gl.useProgram(this.clearScreen);
    this.gl.enable(this.gl.BLEND);
    this.gl.uniform1fv(this.gl.getUniformLocation(this.clearScreen, "v"), this.lerpParams);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.screenTexture);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.screenTexture, 0);
    this.gl.viewport(0, 0, this.params.renderSize, this.params.renderSize);
    this.gl.bindVertexArray(this.vao);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

  /**
   * Draw canvas to screen
   */
  drawCanvasToScreen() {
    this.gl.useProgram(this.drawScreen);
    // Invert colors for specific presets
    this.gl.uniform1i(this.getUniformLocation(this.drawScreen, "invert"), (currentPresetIndex == 27 || currentPresetIndex == 36) | 0);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.screenTexture);
    this.gl.uniform1i(this.getUniformLocation(this.drawScreen, "uDrawTex"), 0);
    this.gl.viewport(0, 0, this.params.renderSize, this.params.renderSize);
    this.gl.bindVertexArray(this.vao);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    // Draw second viewport for mobile layout
    if (isMobileLayout) {
      this.gl.viewport(0, parseInt(this.params.renderSize), this.params.renderSize, this.params.renderSize);
    } else {
      this.gl.viewport(parseInt(this.params.renderSize), 0, this.params.renderSize, this.params.renderSize);
    }
    this.gl.bindVertexArray(this.vao);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }
  /**
   * Main draw function - orchestrates the entire rendering pipeline
   */
  draw() {
    // Update interpolation between parameter sets
    this.params.lerpTime = Math.min(1, this.params.lerpTime + Math.max((1 - this.params.lerpTime) * this.params.convergenceRate, 0.001));
    this.lerpParams = this.interpolateParameters(this.params.pastParams, this.params.params, this.params.lerpTime);

    // Execute rendering pipeline
    this.updateParticlesHelper();
    this.depositParticlesHelper();
    this.blurHelper();

    if (this.params.displayParticles) {
      // Full particle rendering mode
      this.fadeScreen();
      this.drawParticlesToCanvas();
      this.drawCanvasToScreen();
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    } else {
      // Simulation-only mode
      this.gl.useProgram(this.drawBlur);
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]);
      this.gl.uniform1i(this.getUniformLocation(this.drawBlur, "uDrawTex"), 0);
      this.gl.uniform2f(this.getUniformLocation(this.drawBlur, "uTextureSize"), this.params.simSize, this.params.simSize);
      this.gl.clearColor(0, 0, 0, 1);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
  }

  /**
   * Interpolate between two parameter sets
   * @param {Array} fromParams - Starting parameters
   * @param {Array} toParams - Target parameters
   * @param {number} t - Interpolation factor (0-1)
   * @returns {Array} Interpolated parameters
   */
  interpolateParameters(fromParams, toParams, t) {
    let result = [];
    for (let i = 0; i < fromParams.length; ++i) {
      if (typeof fromParams[i] === "number") {
        let value = 0;

        // Special interpolation for specific parameter indices
        if (i === 1 || i === 4 || i === 7 || i === 11) {
          // Exponential interpolation for these parameters
          value = Math.pow(fromParams[i], 1 - t) * Math.pow(toParams[i], t);
        } else if (i == 19) {
          // Special interpolation for parameter 19
          value = Math.pow(fromParams[i], 1 - Math.pow(t, 10)) * Math.pow(toParams[i], Math.pow(t, 10));
        } else {
          // Linear interpolation
          value = (1 - t) * fromParams[i] + t * toParams[i];
        }
        result.push(value);
      }
    }
    return result;
  }

  /**
   * Set simulation texture data
   * @param {Float32Array} data - Texture data
   */
  setTexture(data) {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.R32F, this.params.simSize, this.params.simSize, 0, this.gl.RED, this.gl.FLOAT, data);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

  /**
   * Initialize screen vertex array for fullscreen quad
   * @returns {WebGLVertexArrayObject} Vertex array object
   */
  initializeScreenVertexArray() {
    const vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(vao);

    // Position buffer
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]), this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(this.getAttributeLocation(this.drawBlur, "aVertexPosition"));
    this.gl.vertexAttribPointer(this.getAttributeLocation(this.drawBlur, "aVertexPosition"), 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.getAttributeLocation(this.updateBlur, "aVertexPosition"));
    this.gl.vertexAttribPointer(this.getAttributeLocation(this.updateBlur, "aVertexPosition"), 2, this.gl.FLOAT, false, 0, 0);

    // Texture coordinate buffer
    const texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([0, 1, 0, 0, 1, 1, 1, 0]), this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(this.getAttributeLocation(this.drawBlur, "aTexCoord"));
    this.gl.vertexAttribPointer(this.getAttributeLocation(this.drawBlur, "aTexCoord"), 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.getAttributeLocation(this.updateBlur, "aTexCoord"));
    this.gl.vertexAttribPointer(this.getAttributeLocation(this.updateBlur, "aTexCoord"), 2, this.gl.FLOAT, false, 0, 0);

    this.gl.bindVertexArray(null);
    return vao;
  }

  /**
   * Load simulation texture
   * @param {Float32Array} data - Initial texture data
   * @returns {WebGLTexture} Created texture
   */
  loadSimulationTexture(data) {
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RG32F, this.params.simSize, this.params.simSize, 0, this.gl.RG, this.gl.FLOAT, data);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    return texture;
  }
}
// Global variables for hash and URL management
let currentHashName = "";

/**
 * Set the current hash name and update URL
 * @param {string} hashName - Hash name to set
 */
function setHashName(hashName) {
  currentHashName = hashName;
  window.location.hash = hashName;
}

/**
 * Update hash based on current preset
 */
function updateHash() {
  const presetNumber = currentPresetIndex + 1;
  setHashName(presetNumber.toString().padStart(2, "0") + "_" + presetNames[currentPresetIndex]);
}

// Handle URL hash changes
window.onhashchange = function () {
  let hash = window.location.hash.slice();
  if (hash.slice(1, 12) !== "interpolant") {
    isInterpolating = false;
    let digits = hash.match(/\d/g);
    const newIndex = parseInt(digits.join("")) - 1;
    if (currentPresetIndex != newIndex) {
      switchToPreset(newIndex);
    }
  } else {
    isInterpolating = true;
    const parts = hash.split("_").slice(1);
    if (parts.length == 3) {
      let amount = parseFloat(parts[2]);
      amount = Math.max(0, Math.min(1, amount));
      interpolateBetweenPresets(parseInt(parts[0]) - 1, parseInt(parts[1]) - 1, amount, false, true);
    }
  }
};

updateHash();

// Canvas and WebGL setup
const canvas = document.getElementById("canvas");
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

/**
 * Save current canvas as PNG image
 */
function saveCanvas() {
  const currentDate = new Date();
  const filename = "36_Points_" + currentHashName;

  const link = document.createElement("a");
  link.download = filename + ".png";
  link.href = canvas.toDataURL();
  link.click();
  link.remove();
}
// System parameters object
const systemParams = {
  simSize: 512,
  renderSize: 1080,
  mouse: { x: 450, y: 450 },
  particleDensity: 2.7,
  numParticles: -1,
  drawOpacity: 0.2,
  fillOpacity: 1,
  drawPointsize: 1,
  displayParticles: true,
  canvasZoom: 1,
  convergenceRate: 0.15,
  name: "params",
  update: true,
  pastParams: parameterSets[currentPresetIndex],
  params: parameterSets[currentPresetIndex],
  lerpTime: 0,
  smartLerp: true
};

// Adjust parameters for mobile devices
if (isMobileLayout) {
  systemParams.drawPointsize = 1.5515151515151515;
  systemParams.simSize = 330;
}

// Initialize WebGL context
const gl = document.getElementById("canvas").getContext("webgl2", { preserveDrawingBuffer: true });

/**
 * Resize and position canvas based on window size
 */
function resizeCanvas() {
  if (systemParams.mobile) {
    systemParams.canvasZoom = window.innerWidth / systemParams.renderSize;
  } else {
    systemParams.canvasZoom = Math.max(
      window.innerHeight / systemParams.renderSize,
      0.5 * window.innerWidth / systemParams.renderSize
    );
  }

  systemParams.canvasZoom = Math.max(0.5, systemParams.canvasZoom);

  if (window.devicePixelRatio < 1.25) {
    systemParams.canvasZoom = Math.max(1, systemParams.canvasZoom);
  }

  const canvasSize = parseInt(systemParams.renderSize * systemParams.canvasZoom);

  if (systemParams.mobile) {
    canvas.style.width = canvasSize + "px";
    canvas.style.height = 2 * canvasSize + "px";
    gl.canvas.width = systemParams.renderSize;
    gl.canvas.height = 2 * systemParams.renderSize;
    canvas.width = systemParams.renderSize;
    canvas.height = 2 * systemParams.renderSize;
  } else {
    canvas.style.width = 2 * canvasSize + "px";
    canvas.style.height = canvasSize + "px";
    gl.canvas.width = 2 * systemParams.renderSize;
    gl.canvas.height = systemParams.renderSize;
    canvas.width = 2 * systemParams.renderSize;
    canvas.height = systemParams.renderSize;
  }
}

// Check WebGL2 support and initialize canvas
if (!gl) {
  alert("Requires WebGL2");
} else {
  resizeCanvas();
}
// Keyboard key codes for preset switching (numbers, QWERTY layout, etc.)
let keyCodeMapping = [
  49, 50, 51, 52, 53, 54, 55, 56, 57, 48,  // 1-9, 0
  113, 119, 101, 114, 116, 121, 117, 105, 111, 112,  // qwertyuiop
  97, 115, 100, 102, 103, 104, 106, 107, 108,  // asdfghjkl
  122, 120, 99, 118, 98, 110, 109,  // zxcvbnm
  90, 88, 67, 86, 66, 78, 77  // ZXCVBNM
];

/**
 * Switch to a random preset
 */
function switchToRandomPreset() {
  const randomIndex = Math.floor(Math.random() * keyCodeMapping.length);
  if (randomIndex != currentPresetIndex) {
    currentPresetIndex = randomIndex;
    systemParams.pastParams = systemParams.params;
    systemParams.lerpTime = 0;
    systemParams.params = parameterSets[currentPresetIndex];
    systemParams.drawOpacity = systemParams.params[17];
    systemParams.fillOpacity = systemParams.params[18];
    updateHash();
  }
}

/**
 * Switch to a specific preset by index
 * @param {number} index - Preset index
 */
function switchToPreset(index) {
  if (index < 0 || index >= parameterSets.length) {
    updateHash();
  } else {
    currentPresetIndex = index;
    systemParams.pastParams = particleSystem.lerpParams;
    systemParams.lerpTime = 0;
    systemParams.params = parameterSets[currentPresetIndex];
    systemParams.drawOpacity = systemParams.params[17];
    systemParams.fillOpacity = systemParams.params[18];
    easterEggActive = false;
    updateHash();
    console.log("Point " + (index + 1).toString().padStart(2, "0") + " (" + presetNames[index] + ")");
  }
}

/**
 * Interpolate between two presets
 * @param {number} fromIndex - Starting preset index
 * @param {number} toIndex - Target preset index
 * @param {number} amount - Interpolation amount (0-1)
 * @param {boolean} logOutput - Whether to log the interpolation
 * @param {boolean} updateHash - Whether to update the URL hash
 */
function interpolateBetweenPresets(fromIndex, toIndex, amount, logOutput, shouldUpdateHash) {
  if (typeof fromIndex !== "number" || typeof toIndex !== "number" || typeof amount !== "number" ||
      fromIndex < 0 || fromIndex >= keyCodeMapping.length ||
      toIndex < 0 || toIndex >= keyCodeMapping.length ||
      amount < 0 || amount > 1) {
    console.log("Invalid interpolation parameters: " + fromIndex + " " + toIndex + " " + amount);
    updateHash();
    return;
  }

  systemParams.pastParams = particleSystem.lerpParams;
  systemParams.params = interpolateParameterArrays(parameterSets[fromIndex], parameterSets[toIndex], amount);
  systemParams.lerpTime = 0;

  if (logOutput) {
    console.log("Interpolation from Point " + (fromIndex + 1) + " to Point " + (toIndex + 1) + " with amount " + amount);
  }

  if (shouldUpdateHash) {
    setHashName("interpolant_" + (fromIndex + 1) + "_" + (toIndex + 1) + "_" + amount);
  }
}

/**
 * Interpolate between two parameter arrays
 * @param {Array} from - Starting parameters
 * @param {Array} to - Target parameters
 * @param {number} amount - Interpolation amount (0-1)
 * @returns {Array} Interpolated parameter array
 */
function interpolateParameterArrays(from, to, amount) {
  let result = [];
  for (let i = 0; i < from.length; ++i) {
    if (typeof from[i] === "number") {
      result.push((1 - amount) * from[i] + amount * to[i]);
    }
  }
  return result;
}

/**
 * Handle keyboard input for preset switching and controls
 * @param {number} keyCode - Pressed key code
 */
function handleKeyPress(keyCode) {
  const character = String.fromCharCode(keyCode);

  switch (character) {
    case "\\":
      // Freeze current parameters
      systemParams.params = particleSystem.lerpParams;
      systemParams.lerpTime = 1;
      console.log("Frozen!");
      break;
    case "U":
      // Toggle update
      systemParams.update = !systemParams.update;
      break;
    case "S":
      // Save canvas
      saveCanvas();
      console.log("Save canvas");
      break;
    case "R":
      // Reset system
      resetSystem();

      console.log("Reset");
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
      systemParams.convergenceRate = Math.max(1e-15, 0.5 * systemParams.convergenceRate);
      console.log("Convergence speed: " + systemParams.convergenceRate);
      break;
    case "-":
      // Decrease convergence rate
      systemParams.convergenceRate = Math.min(1, 2 * systemParams.convergenceRate);
      console.log("Convergence speed: " + systemParams.convergenceRate);
      break;
    default:
      // Switch to preset based on key
      const presetIndex = keyCodeMapping.indexOf(keyCode);
      switchToPreset(presetIndex);
      break;
  }
}
// Event listeners
window.addEventListener("resize", resizeCanvas);

document.body.addEventListener("keypress", (e) => {
  inactivityCounter = 0;
  handleKeyPress(e.keyCode);
});

// Initialize particle system
window.particleSystem = new ParticleSystem(gl, systemParams);
// Resets the whole system (some params need this).
window.resetSystem = () => {
  window.particleSystem = new ParticleSystem(gl, systemParams);
};
let inactivityCounter = 0;


const mouseTouchMove = (e) => {
  const rect = canvas.getBoundingClientRect();

  particleSystem.params.mouse.x = (e.clientX - rect.x) / particleSystem.params.canvasZoom * 2 / canvas.width;
  particleSystem.params.mouse.y = (e.clientY - rect.y) / particleSystem.params.canvasZoom / canvas.height;
  particleSystem.params.mouse.x = particleSystem.params.mouse.x - Math.floor(particleSystem.params.mouse.x);
  particleSystem.params.mouse.y = particleSystem.params.mouse.y - Math.floor(particleSystem.params.mouse.y);

};
const mousedown = (e) => {
  if (e.target !== document.getElementById("canvas")) {
    return;
  }
  e.preventDefault();
  particleSystem.mouseButton = e.button + 1;
}
const mouseup = (e) => {
  particleSystem.mouseButton = 0;
}
// Mouse/touch event handlers
document.addEventListener("pointermove", mouseTouchMove);
document.addEventListener("mousemove", mouseTouchMove);
document.addEventListener("mousedown", mousedown);
document.addEventListener("mouseup", mouseup);
document.addEventListener("mouseleave", mouseup);


/**
 * Main animation loop
 */
function animate() {
  inactivityCounter++;
  frameCounter++;

  if (systemParams.update) {
    particleSystem.draw();
  }

  requestAnimationFrame(animate);
}

// Expose createParameterProxy globally for UI components
window.createParameterProxy = createParameterProxy;

// Start the animation loop
requestAnimationFrame(animate);

