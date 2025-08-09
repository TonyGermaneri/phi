const controls = [
  {
    name: 'sensorDistanceBase',
    title: 'Sensor Distance Base',
    description: 'Base distance agents look ahead to sense trails',
    min: 0,
    max: 100,
    step: 0.1,
    group: 'sensing',
    index: 0
  },
  {
    name: 'sensorDistanceMultiplier',
    title: 'Sensor Distance Multiplier',
    description: 'Scales sensing distance based on trail intensity at agent position',
    min: 0,
    max: 100,
    step: 0.1,
    group: 'sensing',
    index: 1
  },
  {
    name: 'sensorDistanceExponent',
    title: 'Sensor Distance Exponent',
    description: 'Controls non-linear response to trail intensity for sensing distance',
    min: 0,
    max: 5,
    step: 0.01,
    group: 'sensing',
    index: 2
  },
  {
    name: 'sensorAngleBase',
    title: 'Sensor Angle Base',
    description: 'Base angle between left and right sensors (in radians)',
    min: 0,
    max: Math.PI,
    step: 0.01,
    group: 'sensing',
    index: 3
  },
  {
    name: 'sensorAngleMultiplier',
    title: 'Sensor Angle Multiplier',
    description: 'Scales sensor angle based on trail intensity',
    min: 0,
    max: 50,
    step: 0.1,
    group: 'sensing',
    index: 4
  },
  {
    name: 'sensorAngleExponent',
    title: 'Sensor Angle Exponent',
    description: 'Controls non-linear response to trail intensity for sensor angle',
    min: 0,
    max: 5,
    step: 0.01,
    group: 'sensing',
    index: 5
  },
  {
    name: 'rotationAngleBase',
    title: 'Rotation Angle Base',
    description: 'Base angle agents turn when following trails (in radians)',
    min: 0,
    max: Math.PI,
    step: 0.01,
    group: 'movement',
    index: 6
  },
  {
    name: 'rotationAngleMultiplier',
    title: 'Rotation Angle Multiplier',
    description: 'Scales rotation based on trail intensity',
    min: 0,
    max: 50,
    step: 0.1,
    group: 'movement',
    index: 7
  },
  {
    name: 'rotationAngleExponent',
    title: 'Rotation Angle Exponent',
    description: 'Controls non-linear response to trail intensity for rotation',
    min: 0,
    max: 5,
    step: 0.01,
    group: 'movement',
    index: 8
  },
  {
    name: 'moveDistanceBase',
    title: 'Move Distance Base',
    description: 'Base distance agents move forward each step',
    min: 0,
    max: 20,
    step: 0.01,
    group: 'movement',
    index: 9
  },
  {
    name: 'moveDistanceMultiplier',
    title: 'Move Distance Multiplier',
    description: 'Scales movement distance based on trail intensity',
    min: 0,
    max: 50,
    step: 0.1,
    group: 'movement',
    index: 10
  },
  {
    name: 'moveDistanceExponent',
    title: 'Move Distance Exponent',
    description: 'Controls non-linear response to trail intensity for movement',
    min: 0,
    max: 5,
    step: 0.01,
    group: 'movement',
    index: 11
  },
  {
    name: 'positionOffsetY',
    title: 'Position Offset Y',
    description: 'Vertical offset for trail sensing relative to agent position',
    min: -20,
    max: 20,
    step: 0.01,
    group: 'visual',
    index: 12
  },
  {
    name: 'positionOffsetHeading',
    title: 'Position Offset Heading',
    description: 'Forward/backward offset for trail sensing relative to heading direction',
    min: -20,
    max: 20,
    step: 0.01,
    group: 'visual',
    index: 13
  },
  {
    name: 'trailSenseScale',
    title: 'Trail Sense Scale',
    description: 'Scaling factor for sensed trail values. Affects sensitivity to trails',
    min: 0,
    max: 2,
    step: 0.01,
    group: 'trail',
    index: 14
  },
  {
    name: 'decayFactor',
    title: 'Decay Factor',
    description: 'How much trails fade each frame (0.75-0.99). Higher = longer lasting trails',
    min: 0.5,
    max: 0.999,
    step: 0.001,
    group: 'trail',
    index: 15
  },
  {
    name: 'blurIterations',
    title: 'Blur Iterations',
    description: 'Number of diffusion steps per frame. Higher = more trail spreading',
    min: 1,
    max: 20,
    step: 1,
    group: 'trail',
    index: 16
  },
  {
    name: 'drawOpacity',
    title: 'Draw Opacity',
    description: 'Visual opacity for rendering particles (0-1)',
    min: 0,
    max: 1,
    step: 0.001,
    group: 'visual',
    index: 17
  },
  {
    name: 'fillOpacity',
    title: 'Fill Opacity',
    description: 'Visual opacity for trail filling (0-1)',
    min: 0,
    max: 1,
    step: 0.001,
    group: 'visual',
    index: 18
  },
  {
    name: 'depositAmount',
    title: 'Deposit Amount',
    description: 'How much trail each agent deposits. Higher = stronger trails',
    min: 0,
    max: 50,
    step: 0.1,
    group: 'trail',
    index: 19
  },
  {
    name: 'hueBase',
    title: 'Hue Base',
    description: 'Base hue value for color generation (0-1, wraps around color wheel)',
    min: 0,
    max: 1,
    step: 0.01,
    group: 'color',
    index: 20
  },
  {
    name: 'hueMultiplier',
    title: 'Hue Multiplier',
    description: 'How much trail intensity affects hue changes. Higher values create more color variation',
    min: 0,
    max: 2,
    step: 0.01,
    group: 'color',
    index: 21
  },
  {
    name: 'saturationBase',
    title: 'Saturation Base',
    description: 'Base saturation value for color generation (0-1, 0=gray, 1=vivid)',
    min: 0,
    max: 1,
    step: 0.01,
    group: 'color',
    index: 22
  },
  {
    name: 'saturationMultiplier',
    title: 'Saturation Multiplier',
    description: 'How much trail intensity affects saturation. Higher values create more vivid colors in active areas',
    min: 0,
    max: 2,
    step: 0.01,
    group: 'color',
    index: 23
  },
  {
    name: 'lightnessBase',
    title: 'Lightness Base',
    description: 'Base lightness value for color generation (0-1, 0=black, 1=white)',
    min: 0,
    max: 1,
    step: 0.01,
    group: 'color',
    index: 24
  },
  {
    name: 'lightnessMultiplier',
    title: 'Lightness Multiplier',
    description: 'How much trail intensity affects lightness. Higher values create brighter colors in active areas',
    min: 0,
    max: 2,
    step: 0.01,
    group: 'color',
    index: 25
  },
  {
    name: 'contrastBase',
    title: 'Contrast Base',
    description: 'Base contrast value for color generation (0-2, 1=normal contrast)',
    min: 0,
    max: 2,
    step: 0.01,
    group: 'color',
    index: 26
  },
  {
    name: 'contrastMultiplier',
    title: 'Contrast Multiplier',
    description: 'How much trail intensity affects contrast. Higher values create more contrast in active areas',
    min: 0,
    max: 2,
    step: 0.01,
    group: 'color',
    index: 27
  },
  {
    name: 'chromaticAberrationStrength',
    title: 'Chromatic Aberration Strength',
    description: 'Controls the intensity of the chromatic aberration effect. Higher values create more color separation',
    min: 0,
    max: 0.05,
    step: 0.001,
    group: 'color',
    index: 28
  },
  {
    name: 'chromaticAberrationOffset',
    title: 'Chromatic Aberration Offset',
    description: 'Controls the offset distance for color channel separation. Higher values create wider color fringing',
    min: 0,
    max: 0.5,
    step: 0.03,
    group: 'color',
    index: 29
  },
  {
    name: 'drawPointsize',
    title: 'Draw Point Size',
    description: 'Size of individual particle points when rendered',
    min: 0.01,
    max: 5.00,
    step: 0.01,
    group: 'visual',
    index: 30
  },
  {
    name: 'invert',
    title: 'Invert',
    description: 'Size of individual particle points when rendered',
    group: 'visual',
    inputType: 'switch',
    index: 31
  },
];

// Add system parameters
const system = [
  {
    name: 'renderSize',
    title: 'Render Size',
    description: 'Resolution of the output canvas (pixels)',
    min: 512,
    max: 2048,
    step: 1,
    group: 'advanced',
    type: 'system'
  },
  {
    name: 'simSize',
    title: 'Simulation Size',
    description: 'Resolution of the simulation grid (affects performance)',
    min: 8,
    max: 4096,
    step: 1,
    group: 'advanced',
    type: 'system',
    options: [8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096]
  },
  {
    name: 'particleDensity',
    title: 'Particle Density',
    description: 'Number of particles per simulation cell',
    min: 0.1,
    max: 10,
    step: 0.1,
    group: 'advanced',
    type: 'system'
  },
  {
    name: 'displayParticles',
    title: 'Display Particles',
    description: 'Show or hide individual particle rendering',
    group: 'advanced',
    type: 'system',
    inputType: 'switch'
  },
  {
    name: 'canvasZoom',
    title: 'Canvas Zoom',
    description: 'Zoom level of the display canvas',
    min: 0.1,
    max: 3,
    step: 0.1,
    group: 'advanced',
    type: 'system'
  },
  {
    name: 'convergenceRate',
    title: 'Convergence Rate',
    description: 'Speed of parameter transitions and smoothing',
    min: 0.01,
    max: 1,
    step: 0.01,
    group: 'advanced',
    type: 'system'
  },
  {
    name: 'smartLerp',
    title: 'Smart Lerp',
    description: 'Enable intelligent parameter interpolation',
    group: 'advanced',
    type: 'system',
    inputType: 'switch'
  }
];
export default {controls, system};