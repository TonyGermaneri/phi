export default class Physarum {
  constructor(canvas, defaultPreset = 7) {
    this.currentPresetIndex = defaultPreset;
    this.canvas = canvas;
    this.gl = this.canvas.getContext("webgl2", { preserveDrawingBuffer: true });
    this.isInterpolating = false;
    this.parameters = [
      [0.000, 4.000, 0.300, 0.100, 51.32, 20.00, 0.410, 4.000, 0.000, 0.100, 6.000, 0.100, 0.000, 0.000, 0.400, 0.705, 1.000, 0.300, 0.250, 8.0, 0.200, 0.800, 0.700, 0.300, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010,],   // pure_multiscale
      [0.000, 28.04, 14.53, 0.090, 1.000, 0.000, 0.010, 1.400, 1.120, 0.830, 0.000, 0.000, 0.570, 0.030, 0.070, 0.986, 1.000, 0.230, 0.166, 6.0, 0.500, 1.200, 0.800, 0.500, 0.600, 0.000, 1.000, 0.000, 0.150, 0.008,],   // hex_hole_open
      [17.92, 0.000, 0.000, 0.520, 0.000, 0.000, 0.180, 0.000, 0.000, 0.100, 6.050, 0.170, 0.000, 0.000, 0.040, 0.973, 1.000, 0.530, 0.455, 16., 0.000, 0.600, 0.900, 0.200, 0.600, 0.000, 1.000, 0.000, 0.100, 0.012,],   // vertebrata
      [3.000, 0.000, 0.000, 0.350, 0.000, 0.000, 0.000, 0.570, 2.000, 0.010, 4.000, 0.020, 0.300, 0.000, 0.110, 0.945, 1.000, 0.180, 0.248, 16., 0.100, 1.000, 0.600, 0.400, 0.600, 0.000, 1.000, 0.000, 0.000, 0.002,],   // traffic_many_lanes
      [13.95, 7.460, 0.110, 4.040, 5.000, 0.520, 0.490, 0.580, 0.180, 7.590, 3.040, 0.160, 4.760, 0.000, 0.610, 0.975, 1.000, 0.348, 0.172, 5.0, 0.800, 0.400, 0.750, 0.600, 0.600, 0.000, 1.000, 0.000, 0.000, 0.008,],   // tactile_extreme
      [3.000, 10.17, 0.400, 1.030, 2.300, 2.000, 1.420, 20.00, 0.750, 0.830, 1.560, 0.110, 1.070, 0.000, 0.200, 0.951, 10.00, 0.150, 0.248, 16., 0.300, 1.500, 0.850, 0.350, 0.600, 0.000, 1.000, 0.000, 0.000, 0.010,],   // star_network
      [0.000, 8.510, 0.190, 0.610, 0.000, 0.000, 3.350, 0.000, 0.000, 0.750, 12.62, 0.060, 0.000, 0.000, 0.270, 0.904, 1.000, 0.060, 0.042, 7.0, 0.600, 0.800, 0.900, 0.300, 0.600, 0.000, 1.000, 0.000, 0.000, 0.006,],   // enmeshed_singularities
      [0.000, 0.820, 0.030, 0.1800, 0.00, 0.000, 0.260, 0.000, 0.000, 0.000, 20.00, 0.650, 0.200, 0.900, 0.140, 0.939, 1.000, 0.470, 0.430, 10., 0.150, 0.900, 0.700, 0.800, 0.600, 0.000, 1.000, 0.000, 0.000, 0.001,],   // waves_upturn
      [0.000, 8.440, 0.080, 4.820, 0.000, 0.000, 1.190, 0.000, 0.000, 0.000, 0.330, 0.010, 0.000, 0.000, 0.040, 0.980, 1.000, 0.320, 0.172, 7.0, 0.250, 1.100, 0.650, 0.700, 0.600, 0.000, 1.000, 0.000, 0.000, 0.004,],   // turing
      [1.660, 19.26, 0.060, 1.260, 0.000, 0.000, 1.650, 0.000, 0.000, 0.060, 5.740, 0.080, 0.000, 3.040, 0.110, 0.988, 3.000, 0.134, 0.221, 19., 0.400, 0.700, 0.800, 0.400, 0.600, 0.000, 1.000, 0.000, 0.000, 0.002,],   // petri_worms
      [0.000, 17.54, 0.080, 0.640, 0.000, 0.000, 1.800, 0.000, 0.000, 0.100, 20.00, 0.060, 0.400, 0.000, 0.200, 0.939, 1.000, 0.200, 0.283, 14., 0.700, 0.500, 0.750, 0.500, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // a_rooting
      [1.500, 1.940, 0.280, 1.730, 1.120, 0.710, 0.180, 2.220, 0.850, 0.500, 4.130, 0.110, 1.120, 0.000, 0.020, 0.850, 1.000, 0.140, 0.234, 11., 0.350, 1.300, 0.600, 0.900, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // more_individuals
      [8.340, 3.860, 0.030, 1.210, 1.400, 0.300, 1.130, 5.500, 0.390, 17.85, 8.510, 0.960, 0.000, 7.140, 0.020, 0.781, 1.000, 0.200, 0.166, 16., 0.900, 0.600, 0.850, 0.300, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // slow_metastructure
      [2.870, 3.040, 0.280, 0.090, 0.000, 0.000, 0.440, 0.850, 0.000, 0.000, 2.220, 0.140, 0.300, 0.850, 0.020, 0.891, 1.000, 0.140, 0.166, 21., 0.450, 0.800, 0.700, 0.600, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // sloppy_bucky
      [0.140, 1.120, 0.190, 0.270, 1.400, 0.000, 1.130, 2.000, 0.390, 0.750, 2.220, 0.190, 0.000, 7.140, 0.210, 0.795, 1.000, 0.120, 0.166, 19., 0.550, 1.000, 0.900, 0.400, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // massive_structure
      [0.001, 2.540, 0.080, 0.000, 0.000, 0.000, 3.350, 0.000, 0.000, 0.100, 12.62, 0.060, 0.000, 0.000, 0.270, 0.877, 1.000, 0.250, 0.344, 5.0, 0.650, 0.900, 0.800, 0.500, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // speed_modulation
      [0.000, 20.00, 0.080, 5.280, 0.000, 0.000, 5.200, 0.000, 0.000, 1.440, 1.560, 0.060, 1.810, 0.000, 0.050, 0.987, 1.000, 0.280, 0.172, 16., 0.750, 0.700, 0.600, 0.800, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // emergent_hex_waves
      [0.000, 17.26, 0.280, 0.350, 1.120, 0.660, 1.470, 0.570, 1.020, 0.750, 19.18, 0.390, 0.000, 1.940, 0.130, 0.959, 1.000, 0.110, 0.135, 21., 0.100, 1.400, 0.950, 0.250, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // formalisms
      [0.000, 89.60, 20.00, 1.300, 0.000, 0.000, 1.300, 1.400, 1.070, 0.750, 69.08, 2.220, 0.300, 0.000, 0.080, 0.959, 1.000, 0.160, 0.332, 10., 0.850, 0.500, 0.700, 0.700, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // growing_on_a_sea_of_sand
      [4.240, 75.92, 0.000, 4.390, 0.000, 0.000, 1.300, 171.7, 20.00, 6.220, 7.520, 1.120, 0.000, 0.000, 0.060, 0.877, 5.000, 0.230, 0.166, 11., 0.950, 1.200, 0.800, 0.400, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // grid_of_sorts
      [17.92, 89.60, 3.040, 2.670, 34.88, 10.70, 0.350, 294.8, 0.000, 0.001, 82.76, 20.00, 0.000, 0.000, 0.005, 0.999, 1.000, 0.330, 0.289, 6.0, 0.200, 0.800, 0.900, 0.600, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // negotiation_of_highways
      [0.000, 28.04, 20.00, 0.180, 26.74, 20.00, 0.010, 1.400, 1.120, 0.830, 0.000, 0.000, 2.540, 0.000, 0.120, 0.959, 1.000, 0.230, 0.166, 5.0, 0.600, 1.100, 0.750, 0.500, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // transmission_tower
      [2.000, 28.04, 0.000, 0.090, 1.000, 0.000, 0.800, 2.080, 0.000, 0.000, 2.000, 0.030, 0.820, 0.000, 0.050, 0.889, 1.000, 0.200, 0.394, 16., 0.400, 0.900, 0.650, 0.750, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // sacred_network_nodules
      [0.000, 0.850, 0.010, 0.350, 1.400, 0.000, 1.810, 0.570, 1.450, 0.010, 4.000, 0.020, 0.300, 0.000, 0.110, 0.945, 1.000, 0.070, 0.049, 16., 0.300, 1.300, 0.800, 0.350, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // positive_negative_space
      [1.660, 20.00, 33.19, 1.030, 39.03, 2.540, 2.650, 364.8, 8.200, 0.050, 2.150, 2.540, 0.000, 0.000, 0.001, 0.975, 1.000, 0.160, 0.115, 14., 0.500, 1.600, 0.700, 0.650, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // circular_consolidation
      [0.000, 9.000, 2000., 1.030, 39.03, 2.540, 2.650, 174.3, 8.200, 6.360, 5.000, 20.00, 0.000, 0.000, 0.001, 0.975, 1.000, 0.080, 0.115, 14., 0.800, 0.700, 0.850, 0.550, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // radiative_nexus
      [17.92, 89.60, 3.040, 2.670, 34.88, 10.70, 3.350, 294.8, 0.000, 0.001, 69.76, 116.4, 0.000, 0.000, 0.005, 0.999, 1.000, 0.330, 0.289, 10., 0.150, 1.500, 0.900, 0.300, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // unfold_time_but_only_in_a_line
      [0.000, 20.00, 3.000, 0.260, 2.150, 4.760, 0.410, 6.600, 12.62, 0.300, 6.600, 0.037, 0.400, 0.040, 0.030, 0.926, 1.000, 0.450, 0.459, 10., 0.000, 0.000, 0.000, 1.000, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // ink_on_white
      [0.000, 89.60, 20.00, 1.300, 0.000, 0.000, 0.180, 1.400, 1.070, 0.750, 69.08, 2.220, 0.300, 0.000, 0.080, 0.960, 1.000, 0.160, 0.332, 7.0, 0.350, 1.100, 0.800, 0.400, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // network_time
      [0.000, 0.800, 0.020, 0.100, 1.000, 0.000, 0.260, 0.100, 2.790, 0.830, 32.88, 37.74, 0.090, 0.330, 0.100, 0.939, 1.000, 0.430, 0.262, 3.0, 0.750, 0.600, 0.950, 0.700, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // inverse_network
      [27.50, 2.000, 2.540, 0.880, 26.74, 0.000, 0.090, 267.4, 1.400, 0.100, 5.000, 7.410, 1.400, 14.25, 0.140, 0.754, 1.000, 0.600, 0.627, 11., 0.900, 1.200, 0.600, 0.800, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // vanishing_points
      [5.350, 6.000, 0.000, 0.100, 1.000, 0.000, 0.180, 1.000, 0.000, 0.000, 2.150, 0.330, 0.000, 0.000, 0.100, 0.840, 2.000, 0.230, 0.164, 16., 0.250, 1.400, 0.750, 0.600, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // neuron_cluster
      [0.000, 6.000, 100.0, 0.157, 1.000, 1.070, 0.000, 1.000, 5.000, 0.830, 5.000, 20.00, 0.400, 0.000, 0.003, 0.914, 1.000, 0.250, 0.361, 6.0, 0.450, 0.800, 0.700, 0.900, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // scaling_nodule_emergence
      [0.005, 6.000, 205.3, 0.000, 1.000, 1.000, 0.180, 2.200, 20.00, 0.830, 3.000, 1.320, 0.400, 0.000, 0.001, 0.939, 1.000, 0.150, 0.361, 6.0, 0.650, 1.000, 0.850, 0.500, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // probe_emergence_from_line
      [0.000, 15.00, 8.600, 0.030, 1.000, 0.000, 0.340, 2.000, 1.070, 0.220, 15.00, 0.100, 2.300, 0.820, 1.000, 0.705, 1.000, 0.420, 0.373, 8.0, 0.100, 1.800, 0.600, 0.750, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // hyp_offset
      [0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 1.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.230, 0.166, 4.0, 0.500, 0.500, 0.500, 0.500, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // noise
      [0.000, 32.88, 402.0, 0.410, 3.000, 0.000, 0.100, 0.000, 0.000, 0.300, 6.000, 0.000, 0.000, 0.000, 0.090, 0.914, 1.000, 0.460, 0.290, 6.0, 0.850, 0.900, 0.700, 0.400, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // strike
      [5.350, 2.150, 0.000, 0.340, 20.59, 0.000, 0.490, 0.100, 2.790, 0.830, 125.1, 45.11, 0.090, 0.000, 0.190, 0.975, 1.000, 0.550, 0.213, 6.0, 0.700, 1.300, 0.800, 0.600, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // suture
      [0.000, 100.5, 20.00, 0.180, 14.44, 0.000, 1.260, 0.000, 0.000, 0.830, 75.91, 0.860, 0.300, 0.000, 0.390, 0.975, 2.000, 0.250, 0.250, 11., 0.550, 0.700, 0.900, 0.800, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // surface_tension_sharp
      [0.000, 0.800, 0.020, 0.340, 20.59, 0.000, 0.260, 0.100, 2.790, 0.830, 125.1, 45.11, 0.580, 0.330, 0.190, 0.975, 1.000, 0.520, 0.238, 5.0, 0.300, 1.100, 0.650, 0.950, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // pincushion
      [0.000, 0.800, 0.020, 5.200, 1.000, 0.000, 0.260, 0.100, 2.790, 0.830, 32.88, 37.74, 0.090, 0.330, 0.100, 0.939, 1.000, 0.450, 0.189, 6.0, 0.800, 0.800, 0.750, 0.700, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // clear_spaghetti
      [17.92, 89.60, 3.040, 2.670, 34.88, 10.70, 5.770, 294.8, 0.000, 0.001, 82.76, 20.00, 0.000, 0.000, 0.005, 0.999, 1.000, 0.330, 0.289, 10., 0.950, 1.600, 0.550, 0.650, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // negotiation_of_zoning
      [1.829, 23.65, 0.029, 0.674, 0.500, 0.000, 1.224, 1.039, 0.000, 0.029, 3.869, 0.054, 0.409, 1.519, 0.080, 0.938, 2.000, 0.065, 0.307, 18., 0.600, 1.000, 0.800, 0.350, 0.600, 0.000, 1.000, 0.000, 0.000, 0.005,],   // hexa1833
    ];
    this.parameterSets = this.parameters.map(i => new Float32Array(i));
    this.parameterNames = [
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
      'lightnessMultiplier',       // p25: Lightness multiplier based on trail intensity
      'contrastBase',              // p26: Base contrast value (0-2, 1=normal)
      'contrastMultiplier',        // p27: Contrast multiplier based on trail intensity
      'chromaticAberrationStrength', // p28: Chromatic aberration effect strength (0-1)
      'chromaticAberrationOffset'  // p29: Chromatic aberration color separation offset (0-1)
    ];
    this.parameterDescriptions = [
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
      'Lightness Multiplier - scales lightness based on trail intensity',
      'Contrast Base - base contrast value for color generation (0-2, 1=normal)',
      'Contrast Multiplier - scales contrast based on trail intensity',
      'Chromatic Aberration Strength - controls the intensity of chromatic aberration effect (0-1)',
      'Chromatic Aberration Offset - controls the color separation distance (0-1)'
    ];
    // Vertex shader source code (used for rendering)
    this.vertexShaderSource = `#version 300 es
    in vec4 aVertexPosition;
    in vec2 aTexCoord;
    precision highp float;
    out vec2 vTexCoord;
    void main() {
      gl_Position = aVertexPosition;
      vTexCoord = aTexCoord;
    }`;
    this.params = {
      simSize: 512,
      renderSize: 1080,
      mouse: { x: 450, y: 450, button: 0, strength: 1.0, },
      particleDensity: 2.7,
      numParticles: -1,
      drawOpacity: 0.2,
      fillOpacity: 1,
      drawPointsize: 1,
      invert: false,
      displayParticles: true,
      canvasZoom: 1,
      convergenceRate: 0.15,
      name: "params",
      update: true,
      pastParams: this.parameterSets[this.currentPresetIndex],
      params: this.parameterSets[this.currentPresetIndex],
      lerpTime: 0,
      smartLerp: true
    };
    this.frame = 0;
    this.lerpParams = this.parameterSets[this.currentPresetIndex];

    // Initialize mouse position tracking (8 positions for trail effect)
    const mousePositionCount = 8;
    this.mousePositions = new Float32Array(mousePositionCount);
    this.mousePositions.fill(-1);

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
    this.resizeCanvas();
  }

  createShaderProgram(shaderInfos, transformFeedbackVaryings) {
    const program = this.gl.createProgram();

    for (let i = 0; i < shaderInfos.length; i++) {
      const shaderInfo = shaderInfos[i];
      const shader = this.compileShader(shaderInfo.type, shaderInfo.source);
      this.gl.attachShader(program, shader);
    }

    if (transformFeedbackVaryings != null) {
      this.gl.transformFeedbackVaryings(program, transformFeedbackVaryings, this.gl.INTERLEAVED_ATTRIBS);
    }

    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error("Didn't link shader. Info: " + this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  compileShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error("Didn't compile shader. Info: " + this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

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

  initializeShaderPrograms() {
    // Particle update shader (compute shader using transform feedback)
    this.updateParticles = this.createShaderProgram([
      {
        source: `#version 300 es
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
uniform float[30] v;
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
    this.renderParticles = this.createShaderProgram([
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
uniform float[30] v;
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
    float contrast = v[26] + v[27] * trailIntensity;

    // Wrap hue and clamp saturation and lightness
    hue = mod(hue, 1.0);
    saturation = clamp(saturation, 0.0, 1.0);
    lightness = clamp(lightness, 0.0, 1.0);
    contrast = clamp(contrast, 0.0, 2.0);

    // Convert HSL to RGB
    vec3 hslColor = vec3(hue, saturation, lightness);
    color = hsl2rgb(hslColor);

    // Apply contrast adjustment
    // Formula: (color - 0.5) * contrast + 0.5
    color = (color - 0.5) * contrast + 0.5;
    color = clamp(color, 0.0, 1.0);
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
    this.drawBlur = this.createShaderProgram([
      { source: this.vertexShaderSource, type: this.gl.VERTEX_SHADER },
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
    this.updateBlur = this.createShaderProgram([
      { source: this.vertexShaderSource, type: this.gl.VERTEX_SHADER },
      {
        source: `#version 300 es
precision highp float;
uniform vec2 uTextureSize;
uniform vec2 mouse;
uniform vec2 prevMouse;
uniform sampler2D uUpdateTex;
in vec2 vTexCoord;
out vec2 outState;
uniform float[30] v;
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

    // Screen drawing shader with chromatic aberration
    this.drawScreen = this.createShaderProgram([
      { source: this.vertexShaderSource, type: this.gl.VERTEX_SHADER },
      {
        source: `#version 300 es
precision highp float;
in vec2 vTexCoord;
out vec4 outColor;
uniform sampler2D uDrawTex;
uniform int invert;
uniform float[30] v;
uniform vec2 uTextureSize;

void main() {
  float aberrationStrength = v[28];
  float aberrationOffset = v[29];

  // Calculate chromatic aberration effect
  vec2 center = vec2(0.5, 0.5);
  vec2 direction = vTexCoord - center;
  float distance = length(direction);

  // Scale the offset based on distance from center for radial aberration
  vec2 radialOffset = normalize(direction) * aberrationOffset * aberrationStrength * distance;

  // Sample red, green, and blue channels with different offsets
  float red = texture(uDrawTex, vTexCoord - radialOffset).r;
  float green = texture(uDrawTex, vTexCoord).g;
  float blue = texture(uDrawTex, vTexCoord + radialOffset).b;

  // Combine channels
  vec4 color = vec4(red, green, blue, 1.0);

  // Apply existing invert logic
  if (invert == 1) {
    color.xyz = vec3(1.) - color.xyz;
  }

  outColor = clamp(color, 0., 1.);
}`,
        type: this.gl.FRAGMENT_SHADER
      }
    ], null);

    // Screen clearing shader
    this.clearScreen = this.createShaderProgram([
      { source: this.vertexShaderSource, type: this.gl.VERTEX_SHADER },
      {
        source: `#version 300 es
precision highp float;
in vec2 vTexCoord;
out vec4 outColor;
uniform float[30] v;
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

  getUniformLocation(program, name) {
    return this.gl.getUniformLocation(program, name);
  }

  getAttributeLocation(program, name) {
    return this.gl.getAttribLocation(program, name);
  }

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
    this.gl.uniform1i(this.gl.getUniformLocation(this.updateParticles, "mouseButton"), this.params.mouse.button);
    this.gl.uniform1f(this.gl.getUniformLocation(this.updateParticles, "mouseStrength"), this.params.mouse.strength);
    this.gl.uniform1fv(this.gl.getUniformLocation(this.updateParticles, "mps"), this.mousePositions);
    this.gl.uniform1i(this.gl.getUniformLocation(this.updateParticles, "frame"), this.frame);
    this.gl.uniform1i(this.gl.getUniformLocation(this.updateParticles, "pen"), this.isInterpolating);
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

  depositParticlesHelper() {
    this.gl.useProgram(this.renderParticles);
    this.gl.uniform1fv(this.gl.getUniformLocation(this.renderParticles, "v"), this.lerpParams);
    this.gl.uniform1i(this.getUniformLocation(this.renderParticles, "deposit"), 1);
    this.gl.uniform1f(this.getUniformLocation(this.renderParticles, "pointsize"), this.drawPointsize);
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

  drawCanvasToScreen() {
    this.gl.useProgram(this.drawScreen);
    this.gl.uniform1i(this.getUniformLocation(this.drawScreen, "invert"), this.params.invert);
    this.gl.uniform1fv(this.getUniformLocation(this.drawScreen, "v"), this.lerpParams);
    this.gl.uniform2f(this.getUniformLocation(this.drawScreen, "uTextureSize"), this.params.renderSize, this.params.renderSize);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.screenTexture);
    this.gl.uniform1i(this.getUniformLocation(this.drawScreen, "uDrawTex"), 0);
    this.gl.viewport(0, 0, this.params.renderSize, this.params.renderSize);
    this.gl.bindVertexArray(this.vao);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    this.gl.viewport(parseInt(this.params.renderSize), 0, this.params.renderSize, this.params.renderSize);

    this.gl.bindVertexArray(this.vao);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

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
    this.isInterpolating = !(t >= 1);
    return result;
  }

  setTexture(data) {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.R32F, this.params.simSize, this.params.simSize, 0, this.gl.RED, this.gl.FLOAT, data);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

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

  mouseTouchMove(e) {
    if (!this.params) {
      return;
    }
    const rect = this.gl.canvas.getBoundingClientRect();
    this.params.mouse.x = (e.clientX - rect.x) / this.params.canvasZoom * 2 / this.gl.canvas.width;
    this.params.mouse.y = (e.clientY - rect.y) / this.params.canvasZoom / this.gl.canvas.height;
    this.params.mouse.x = this.params.mouse.x - Math.floor(this.params.mouse.x);
    this.params.mouse.y = this.params.mouse.y - Math.floor(this.params.mouse.y);

  }

  mousedown(e) {
    if (e.target !== document.getElementById("canvas")) {
      return;
    }
    e.preventDefault();
    this.params.mouse.button = e.button + 1;
  }

  mouseup(e) {
    this.params.mouse.button = 0;
  }

  resizeCanvas() {
    if (this.params.mobile) {
      this.params.canvasZoom = window.innerWidth / this.params.renderSize;
    } else {
      this.params.canvasZoom = Math.max(
        window.innerHeight / this.params.renderSize,
        0.5 * window.innerWidth / this.params.renderSize
      );
    }

    this.params.canvasZoom = Math.max(0.5, this.params.canvasZoom);

    if (window.devicePixelRatio < 1.25) {
      this.params.canvasZoom = Math.max(1, this.params.canvasZoom);
    }

    const canvasSize = parseInt(this.params.renderSize * this.params.canvasZoom);

    this.gl.canvas.style.width = 2 * canvasSize + "px";
    this.gl.canvas.style.height = canvasSize + "px";
    this.gl.canvas.width = 2 * this.params.renderSize;
    this.gl.canvas.height = this.params.renderSize;
    this.gl.canvas.width = 2 * this.params.renderSize;
    this.gl.canvas.height = this.params.renderSize;

  }
}
