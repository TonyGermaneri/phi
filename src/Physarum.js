export default class Physarum {
  constructor(canvas, defaultPreset = 0) {
    this.currentPresetIndex = defaultPreset;
    this.canvas = canvas;
    this.gl = this.canvas.getContext("webgl2", { preserveDrawingBuffer: true });
    this.isInterpolating = false;
    this.parameters = [];
    this.parameterCount = 32;
    this.parameterSets = [];
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
      displayParticles: true,
      canvasZoom: 1,
      convergenceRate: 0.05,
      name: "params",
      update: true,
      pastParams: this.parameterSets[this.currentPresetIndex],
      currentParams: this.parameterSets[this.currentPresetIndex],
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
  addParameterSet(parameterSet) {
    const f32ParameterSet = new Float32Array(parameterSet);
    // no presets are loaded yet
    if (this.parameterSets.length == 0) {
      this.params.pastParams = f32ParameterSet;
      this.params.currentParams = f32ParameterSet;
    }
    this.parameterSets.push(f32ParameterSet);
  }
  setPreset(index) {
    this.currentPresetIndex = index;
    this.params.pastParams = this.lerpParams;
    this.params.lerpTime = 0;
    this.params.currentParams = this.parameterSets[this.currentPresetIndex];
  }

  updateParameter(index, value) {
    if (this.params.currentParams && index >= 0 && index < this.params.currentParams.length) {
      this.params.currentParams[index] = value;
    }
  }

  updateSystemParameter(name, value) {
    if (this.params.hasOwnProperty(name)) {
      this.params[name] = value;

      // Handle special cases that need immediate updates
      if (name === 'canvasZoom') {
        this.updateCanvasZoom();
      } else if (name === 'simSize' || name === 'renderSize') {
        this.resizeCanvas();
      }
    }
  }

  updateCanvasZoom() {
    if (this.canvas) {
      this.canvas.style.transform = `scale(${this.params.canvasZoom})`;
    }
  }

  getCurrentParameters() {
    return Array.from(this.params.currentParams || []);
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
uniform float[${this.parameterCount}] v;
uniform float[8] mps;
uniform int frame;
uniform int mouseButton;

// Boundary wrapping function - keeps coordinates within [-1, 1] range
vec2 wrapBoundary(vec2 position) {
  position *= 0.5;
  position += vec2(0.5);
  position -= floor(position);
  position -= vec2(0.5);
  position *= 2.0;
  return position;
}

// Generate noise value for randomization
float generateNoise(in vec2 coordinate, in float seed) {
  return fract(tan(distance(coordinate * (seed + 0.118446744073709551614), vec2(0.118446744073709551614, 0.314159265358979323846264))) * 0.141421356237309504880169);
}

// Cubic interpolation for mouse trail effect
vec2 cubicInterpolation(float t) {
  vec2 controlPoint1 = vec2(mps[0], mps[1]);
  vec2 controlPoint2 = vec2(mps[2], mps[3]);
  vec2 controlPoint3 = vec2(mps[4], mps[5]);
  vec2 controlPoint4 = vec2(mps[6], mps[7]);
  vec2 cubicCoeffA = controlPoint1 * -0.5 + controlPoint2 * 1.5 + controlPoint3 * -1.5 + controlPoint4 * 0.5;
  vec2 cubicCoeffB = controlPoint1 + controlPoint2 * -2.5 + controlPoint3 * 2.0 + controlPoint4 * -0.5;
  vec2 cubicCoeffC = controlPoint1 * -0.5 + controlPoint3 * 0.5;
  vec2 cubicCoeffD = controlPoint2;
  return t * (t * (t * cubicCoeffA + cubicCoeffB) + cubicCoeffC) + cubicCoeffD;
}

void main() {
  vec2 currentDirection = vec2(cos(i_T), sin(i_T));
  float halfDimension = i_dim.x / 2.0;
  vec2 samplePosition = 0.5 * (i_P + vec2(1.0));

  // Sample trail intensity at current position with sensor offset
  float sensorValue = texture(u_trail, wrapBoundary(samplePosition + v[13] / halfDimension * currentDirection + vec2(0.0, v[12] / halfDimension))).x;
  sensorValue = max(sensorValue, 0.000000001);

  // Calculate sensor and movement distances based on trail intensity
  float sensorDistance = v[0] / halfDimension + v[2] * pow(sensorValue, v[1]) * 250.0 / halfDimension;
  float movementDistance = v[9] / halfDimension + v[11] * pow(sensorValue, v[10]) * 250.0 / halfDimension;

  // Calculate sensor and rotation angles
  float sensorAngle = v[3] + v[5] * pow(sensorValue, v[4]);
  float rotationAngle = v[6] + v[8] * pow(sensorValue, v[7]);

  // Sample trail intensity at three sensor positions (forward, left, right)
  float forwardSensor = texture(u_trail, wrapBoundary(samplePosition + sensorDistance * vec2(cos(i_T), sin(i_T)))).x;
  float leftSensor = texture(u_trail, wrapBoundary(samplePosition + sensorDistance * vec2(cos(i_T + sensorAngle), sin(i_T + sensorAngle)))).x;
  float rightSensor = texture(u_trail, wrapBoundary(samplePosition + sensorDistance * vec2(cos(i_T - sensorAngle), sin(i_T - sensorAngle)))).x;

  // Update heading based on sensor readings
  float newHeading = i_T;
  if (forwardSensor > leftSensor && forwardSensor > rightSensor) {
    // Continue straight if forward sensor has highest value
  } else if (forwardSensor < leftSensor && forwardSensor < rightSensor) {
    // Random turn if forward sensor has lowest value
    if (generateNoise(i_P * 1332.4324, i_T) > 0.5) {
      newHeading += rotationAngle;
    } else {
      newHeading -= rotationAngle;
    }
  } else if (leftSensor < rightSensor) {
    // Turn right if right sensor is stronger
    newHeading -= rotationAngle;
  } else if (leftSensor > rightSensor) {
    // Turn left if left sensor is stronger
    newHeading += rotationAngle;
  }

  // Calculate new direction and position
  vec2 newDirection = vec2(cos(newHeading), sin(newHeading));
  vec2 newPosition = i_P + newDirection * movementDistance;

  // Handle mouse interaction for young particles
  const float segmentPopulation = 0.005;
  if (i_A < segmentPopulation && mouseButton == 1) {
    newPosition = 2.0 * cubicInterpolation(i_A / segmentPopulation) - vec2(1.0);
    newPosition += newDirection * pow(generateNoise(i_P * 132.43, i_T), 1.2);
  }

  // Output updated particle data
  v_P = wrapBoundary(newPosition);
  v_A = fract(i_A + segmentPopulation);
  v_T = newHeading;
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
uniform float[${this.parameterCount}] v;
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
uniform float[${this.parameterCount}] v;
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
uniform float[${this.parameterCount}] v;
uniform vec2 uTextureSize;

void main() {
  float aberrationStrength = v[28];
  float aberrationOffset = v[29];

  // Calculate chromatic aberration effect
  vec2 center = vec2(1, 0.5);
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
  if (v[31] == 1.0) {
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
uniform float[${this.parameterCount}] v;
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
    this.gl.uniform1f(this.getUniformLocation(this.renderParticles, "pointsize"), this.lerpParams[30]);
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
    this.gl.uniform1f(this.getUniformLocation(this.renderParticles, "pointsize"), this.lerpParams[30]);
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
    window.dispatchEvent(new Event("Physarum:draw", {detail: this}));
    // Linear convergence
    this.params.lerpTime = Math.min(1, this.params.lerpTime + this.params.convergenceRate);
    // Expo convergence
    // this.params.lerpTime = Math.min(1, this.params.lerpTime + Math.max((1 - this.params.lerpTime) * this.params.convergenceRate, 0.0001));
    this.lerpParams = this.interpolateParameters(this.params.pastParams, this.params.currentParams, this.params.lerpTime);
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

    // Handle both mouse and touch events
    let clientX, clientY;

    if (e.type === 'touchmove') {
      // For touch events, use the first touch point
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        return; // No touch points
      }
    } else if (e.type === 'pointermove') {
      // For pointer events, use the event coordinates
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      // For mouse events
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = this.gl.canvas.getBoundingClientRect();

    // Calculate normalized coordinates [0, 1]
    let normalizedX = (clientX - rect.left) / rect.width;
    let normalizedY = (clientY - rect.top) / 2 / rect.height;

    // Convert to simulation space [-1, 1] and handle wrapping
    this.params.mouse.x = normalizedX * 2 - 1;
    this.params.mouse.y = normalizedY * 2 - 1;

    // Apply wrapping to keep coordinates in valid range
    this.params.mouse.x = this.params.mouse.x - Math.floor(this.params.mouse.x + 1);
    this.params.mouse.y = this.params.mouse.y - Math.floor(this.params.mouse.y + 1);
  }

  mousedown(e) {
    if (e.target !== document.getElementById("canvas")) {
      return;
    }
    e.preventDefault();

    // Handle different event types
    if (e.type === 'touchstart') {
      this.params.mouse.button = 1; // Treat touch as left mouse button
    } else if (e.type === 'pointerdown') {
      this.params.mouse.button = e.button + 1;
    } else {
      this.params.mouse.button = e.button + 1;
    }
  }

  mouseup(e) {
    this.params.mouse.button = 0;
  }

  touchStart(e) {
    console.log("touch start");
    if (e.target !== document.getElementById("canvas")) {
      return;
    }
    e.preventDefault();

    // Handle multi-touch - use first touch for primary interaction
    if (e.touches && e.touches.length > 0) {
      this.params.mouse.button = 1;

      // Update position with first touch
      const rect = this.gl.canvas.getBoundingClientRect();
      let normalizedX = (e.touches[0].clientX - rect.left) / rect.width;
      let normalizedY = (e.touches[0].clientY - rect.top) / 2 / rect.height;

      this.params.mouse.x = normalizedX * 2 - 1;
      this.params.mouse.y = normalizedY * 2 - 1;

      this.params.mouse.x = this.params.mouse.x - Math.floor(this.params.mouse.x + 1);
      this.params.mouse.y = this.params.mouse.y - Math.floor(this.params.mouse.y + 1);
    }
  }

  touchMove(e) {
    if (!this.params) {
      return;
    }
    e.preventDefault();

    // Handle multi-touch - use first touch for primary interaction
    if (e.touches && e.touches.length > 0) {
      const rect = this.gl.canvas.getBoundingClientRect();
      let normalizedX = (e.touches[0].clientX - rect.left) / rect.width;
      let normalizedY = (e.touches[0].clientY - rect.top) / 2 / rect.height;

      this.params.mouse.x = normalizedX * 2 - 1;
      this.params.mouse.y = normalizedY * 2 - 1;

      this.params.mouse.x = this.params.mouse.x - Math.floor(this.params.mouse.x + 1);
      this.params.mouse.y = this.params.mouse.y - Math.floor(this.params.mouse.y + 1);
    }
  }

  touchEnd(e) {
    e.preventDefault();
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
