/**
 * IndexedDB service for managing particle simulation presets
 * Handles storage and retrieval of user-created presets with metadata
 */

class PresetDatabase {
  constructor() {
    this.dbName = 'PhysarumPresets';
    this.version = 3; // Increment version to trigger upgrade for lastState store
    this.db = null;
    this.defaultPresets = []; // Will be populated with original presets
    this.originalParameterLines = []; // Store original parameter data for reset
  }

  /**
   * Initialize the database and create object stores
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const oldVersion = event.oldVersion;

        // Create presets store if it doesn't exist
        if (!db.objectStoreNames.contains('presets')) {
          const presetStore = db.createObjectStore('presets', { keyPath: 'id' });
          presetStore.createIndex('title', 'title', { unique: false });
          presetStore.createIndex('created', 'created', { unique: false });
          presetStore.createIndex('isDefault', 'isDefault', { unique: false });
          presetStore.createIndex('listOrder', 'listOrder', { unique: false });
        }

        // Handle upgrades from version 1 to 2
        if (oldVersion < 2) {
          const transaction = event.target.transaction;
          const presetStore = transaction.objectStore('presets');

          if (!presetStore.indexNames.contains('listOrder')) {
            presetStore.createIndex('listOrder', 'listOrder', { unique: false });
          }

          // Add listOrder field to existing presets
          const getAllRequest = presetStore.getAll();
          getAllRequest.onsuccess = () => {
            const presets = getAllRequest.result;
            presets.forEach((preset, index) => {
              if (preset.listOrder === undefined) {
                preset.listOrder = index;
                presetStore.put(preset);
              }
            });
          };
        }

        // Handle upgrades from version 2 to 3: add lastState store
        if (oldVersion < 3 && !db.objectStoreNames.contains('lastState')) {
          const lastStateStore = db.createObjectStore('lastState', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Generate a UUID for preset identification
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Save default presets to the database
   * Called during initialization to store original presets
   */
  async saveDefaultPresets(presets, presetNames, originalParameterLines = null) {
    if (!this.db) await this.init();

    // Store original parameter lines for reset functionality
    if (originalParameterLines) {
      this.originalParameterLines = originalParameterLines;
    }

    const transaction = this.db.transaction(['presets'], 'readwrite');
    const store = transaction.objectStore('presets');

    // Check if default presets already exist
    const existingDefaults = await this.getDefaultPresets();
    if (existingDefaults.length > 0) {
      return; // Default presets already saved
    }

    for (let i = 0; i < presets.length; i++) {
      const preset = {
        id: this.generateUUID(),
        title: presetNames[i] || `Preset ${i + 1}`,
        description: `Default preset ${i + 1}`,
        parameters: [...presets[i]], // Deep copy
        originalParameters: originalParameterLines ? [...originalParameterLines[i].slice(0, 32)] : [...presets[i]], // Store original for reset
        isDefault: true,
        listOrder: i,
        version: 1,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      };

      await this.putPreset(preset);
    }

    this.defaultPresets = await this.getDefaultPresets();
  }

  /**
   * Add or update a preset
   */
  async putPreset(preset) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['presets'], 'readwrite');
      const store = transaction.objectStore('presets');

      const request = store.put(preset);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save a user preset
   */
  async saveUserPreset(title, description, parameters) {
    // Get the next available order position
    const allPresets = await this.getAllPresets();
    const maxOrder = allPresets.reduce((max, preset) => Math.max(max, preset.listOrder || 0), -1);

    const preset = {
      id: this.generateUUID(),
      title: title.trim(),
      description: description.trim(),
      parameters: [...parameters], // Deep copy
      isDefault: false,
      listOrder: maxOrder + 1,
      version: 1,
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };

    await this.putPreset(preset);
    return preset;
  }

  /**
   * Update an existing preset
   */
  async updatePreset(id, title, description, parameters = null) {
    const preset = await this.getPreset(id);
    if (!preset) {
      throw new Error('Preset not found');
    }

    preset.title = title.trim();
    preset.description = description.trim();
    // Only update parameters if explicitly provided
    if (parameters !== null) {
      preset.parameters = [...parameters];
    }
    preset.version = (preset.version || 1) + 1;
    preset.modified = new Date().toISOString();

    await this.putPreset(preset);
    return preset;
  }

  /**
   * Get a specific preset by ID
   */
  async getPreset(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['presets'], 'readonly');
      const store = transaction.objectStore('presets');

      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all presets
   */
  async getAllPresets() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['presets'], 'readonly');
      const store = transaction.objectStore('presets');

      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result;
        // Sort by listOrder, with fallback to creation date for items without listOrder
        results.sort((a, b) => {
          const orderA = a.listOrder !== undefined ? a.listOrder : 999999;
          const orderB = b.listOrder !== undefined ? b.listOrder : 999999;
          return orderA - orderB;
        });
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get default presets only
   */
  async getDefaultPresets() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['presets'], 'readonly');
      const store = transaction.objectStore('presets');

      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result.filter(preset => preset.isDefault === true);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get user presets only
   */
  async getUserPresets() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['presets'], 'readonly');
      const store = transaction.objectStore('presets');

      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result.filter(preset => preset.isDefault === false);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a preset (only user presets can be deleted)
   */
  async deletePreset(id) {
    const preset = await this.getPreset(id);
    if (!preset) {
      throw new Error('Preset not found');
    }

    if (preset.isDefault) {
      throw new Error('Cannot delete default presets');
    }

    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['presets'], 'readwrite');
      const store = transaction.objectStore('presets');

      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save the last state parameters
   */
  async saveLastState(parameters, selectedPresetId = null) {
    if (!this.db) await this.init();

    const lastState = {
      id: 'lastState', // Fixed ID for the last state
      parameters: [...parameters], // Deep copy
      selectedPresetId: selectedPresetId, // Store which preset was selected
      timestamp: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['lastState'], 'readwrite');
      const store = transaction.objectStore('lastState');

      const request = store.put(lastState);
      request.onsuccess = () => resolve(lastState);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load the last state parameters
   */
  async loadLastState() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['lastState'], 'readonly');
      const store = transaction.objectStore('lastState');

      const request = store.get('lastState');
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve({
            parameters: result.parameters,
            selectedPresetId: result.selectedPresetId || null,
            timestamp: result.timestamp
          });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Move a preset up in the list order
   */
  async movePresetUp(id) {
    const presets = await this.getAllPresets();
    const currentIndex = presets.findIndex(preset => preset.id === id);

    if (currentIndex <= 0) {
      return; // Already at the top or not found
    }

    const currentPreset = presets[currentIndex];
    const previousPreset = presets[currentIndex - 1];

    // Swap the listOrder values
    const tempOrder = currentPreset.listOrder;
    currentPreset.listOrder = previousPreset.listOrder;
    previousPreset.listOrder = tempOrder;

    // Update both presets in the database
    await this.putPreset(currentPreset);
    await this.putPreset(previousPreset);
  }

  /**
   * Move a preset down in the list order
   */
  async movePresetDown(id) {
    const presets = await this.getAllPresets();
    const currentIndex = presets.findIndex(preset => preset.id === id);

    if (currentIndex >= presets.length - 1 || currentIndex === -1) {
      return; // Already at the bottom or not found
    }

    const currentPreset = presets[currentIndex];
    const nextPreset = presets[currentIndex + 1];

    // Swap the listOrder values
    const tempOrder = currentPreset.listOrder;
    currentPreset.listOrder = nextPreset.listOrder;
    nextPreset.listOrder = tempOrder;

    // Update both presets in the database
    await this.putPreset(currentPreset);
    await this.putPreset(nextPreset);
  }

  /**
   * Set the exact order position for a preset
   */
  async setPresetOrder(id, newOrder) {
    const presets = await this.getAllPresets();
    const preset = presets.find(p => p.id === id);

    if (!preset) {
      throw new Error('Preset not found');
    }

    const oldOrder = preset.listOrder;

    // Update the target preset's order
    preset.listOrder = newOrder;

    // Adjust other presets' orders
    for (const otherPreset of presets) {
      if (otherPreset.id !== id) {
        if (newOrder < oldOrder && otherPreset.listOrder >= newOrder && otherPreset.listOrder < oldOrder) {
          otherPreset.listOrder++;
        } else if (newOrder > oldOrder && otherPreset.listOrder > oldOrder && otherPreset.listOrder <= newOrder) {
          otherPreset.listOrder--;
        }
      }
    }

    // Update all modified presets
    for (const presetToUpdate of presets) {
      await this.putPreset(presetToUpdate);
    }
  }

  /**
   * Get current default presets and return them in the format expected by the main app
   */
  async getCurrentDefaultPresets() {
    const defaults = await this.getDefaultPresets();
    return defaults
      .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }))
      .map(preset => preset.parameters);
  }

  /**
   * Reset all default presets to their original values
   */
  async resetDefaultPresets() {
    if (!this.db) await this.init();

    const defaultPresets = await this.getDefaultPresets();

    for (const preset of defaultPresets) {
      if (preset.originalParameters) {
        // Reset to original parameters
        preset.parameters = [...preset.originalParameters];
        preset.modified = new Date().toISOString();
        await this.putPreset(preset);
      }
    }

    return defaultPresets.length;
  }

  /**
   * Export preset as JSON file download
   */
  exportPresetAsFile(preset) {
    const exportData = {
      id: preset.id,
      title: preset.title,
      description: preset.description,
      parameters: preset.parameters,
      exported: new Date().toISOString(),
      version: 1
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${preset.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  /**
   * Import preset from JSON data
   */
  async importPresetFromData(jsonData) {
    let data;
    try {
      data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    } catch (error) {
      throw new Error('Invalid JSON format');
    }

    // Validate required fields
    if (!data.title || !data.parameters || !Array.isArray(data.parameters)) {
      throw new Error('Invalid preset format: missing title or parameters');
    }

    if (data.parameters.length !== 32) {
      throw new Error('Invalid preset format: must have exactly 32 parameters');
    }

    // Check if preset with same ID already exists
    let preset;
    if (data.id) {
      const existing = await this.getPreset(data.id);
      if (existing) {
        // Update existing preset
        preset = await this.updatePreset(
          data.id,
          data.title,
          data.description || '',
          data.parameters
        );
      } else {
        // Create new preset with the provided ID
        preset = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          parameters: [...data.parameters],
          isDefault: false,
          created: new Date().toISOString(),
          modified: new Date().toISOString()
        };
        await this.putPreset(preset);
      }
    } else {
      // Create new preset with generated ID
      preset = await this.saveUserPreset(
        data.title,
        data.description || '',
        data.parameters
      );
    }

    return preset;
  }

  /**
   * Handle file drop for import
   */
  async handleFileDrop(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const preset = await this.importPresetFromData(event.target.result);
          resolve(preset);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Export preset to JSON format for download
   */
  exportPreset(preset) {
    const exportData = {
      id: preset.id,
      title: preset.title,
      description: preset.description || '',
      parameters: [...preset.parameters],
      version: preset.version || 1,
      created: preset.created,
      modified: preset.modified,
      exportedAt: new Date().toISOString(),
      format: 'PhysarumPreset',
      formatVersion: '1.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Download preset as JSON file
   */
  downloadPreset(preset) {
    const jsonData = this.exportPreset(preset);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${preset.title.replace(/[^a-zA-Z0-9]/g, '_')}_preset.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Get default parameter values for validation
   */
  getDefaultParameters() {
    // Return default parameter set - using the first default preset if available
    if (this.defaultPresets && this.defaultPresets.length > 0) {
      return [...this.defaultPresets[0].parameters];
    }

    // Fallback default parameters - pure_multiscale preset
    return [0.000, 4.000, 0.300, 0.100, 51.32, 20.00, 0.410, 4.000, 0.000, 0.100, 6.000, 0.100, 0.000, 0.000, 0.400, 0.705, 1.000, 0.300, 0.250, 8.0, 0.200, 0.800, 0.700, 0.300, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00];
  }

  /**
   * Get all default preset configurations
   */
  getDefaultPresetConfigurations() {
    return [
      {
        name: "pure_multiscale",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 4.000, 0.300, 0.100, 51.32, 20.00, 0.410, 4.000, 0.000, 0.100, 6.000, 0.100, 0.000, 0.000, 0.400, 0.705, 1.000, 0.300, 0.250, 8.0, 0.200, 0.800, 0.700, 0.300, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "hex_hole_open",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 28.04, 14.53, 0.090, 1.000, 0.000, 0.010, 1.400, 1.120, 0.830, 0.000, 0.000, 0.570, 0.030, 0.070, 0.986, 1.000, 0.230, 0.166, 6.0, 0.500, 1.200, 0.800, 0.500, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "vertebrata",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [17.92, 0.000, 0.000, 0.520, 0.000, 0.000, 0.180, 0.000, 0.000, 0.100, 6.050, 0.170, 0.000, 0.000, 0.040, 0.973, 1.000, 0.530, 0.455, 16., 0.000, 0.600, 0.900, 0.200, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "traffic_many_lanes",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [3.000, 0.000, 0.000, 0.350, 0.000, 0.000, 0.000, 0.570, 2.000, 0.010, 4.000, 0.020, 0.300, 0.000, 0.110, 0.945, 1.000, 0.180, 0.248, 16., 0.100, 1.000, 0.600, 0.400, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "tactile_extreme",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [13.95, 7.460, 0.110, 4.040, 5.000, 0.520, 0.490, 0.580, 0.180, 7.590, 3.040, 0.160, 4.760, 0.000, 0.610, 0.975, 1.000, 0.348, 0.172, 5.0, 0.800, 0.400, 0.750, 0.600, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "star_network",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [3.000, 10.17, 0.400, 1.030, 2.300, 2.000, 1.420, 20.00, 0.750, 0.830, 1.560, 0.110, 1.070, 0.000, 0.200, 0.951, 10.00, 0.150, 0.248, 16., 0.300, 1.500, 0.850, 0.350, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "enmeshed_singularities",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 8.510, 0.190, 0.610, 0.000, 0.000, 3.350, 0.000, 0.000, 0.750, 12.62, 0.060, 0.000, 0.000, 0.270, 0.904, 1.000, 0.060, 0.042, 7.0, 0.600, 0.800, 0.900, 0.300, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "waves_upturn",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 0.820, 0.030, 0.1800, 0.00, 0.000, 0.260, 0.000, 0.000, 0.000, 20.00, 0.650, 0.200, 0.900, 0.140, 0.939, 1.000, 0.470, 0.430, 10., 0.150, 0.900, 0.700, 0.800, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "turing",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 8.440, 0.080, 4.820, 0.000, 0.000, 1.190, 0.000, 0.000, 0.000, 0.330, 0.010, 0.000, 0.000, 0.040, 0.980, 1.000, 0.320, 0.172, 7.0, 0.250, 1.100, 0.650, 0.700, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "petri_worms",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [1.660, 19.26, 0.060, 1.260, 0.000, 0.000, 1.650, 0.000, 0.000, 0.060, 5.740, 0.080, 0.000, 3.040, 0.110, 0.988, 3.000, 0.134, 0.221, 19., 0.400, 0.700, 0.800, 0.400, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "a_rooting",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 17.54, 0.080, 0.640, 0.000, 0.000, 1.800, 0.000, 0.000, 0.100, 20.00, 0.060, 0.400, 0.000, 0.200, 0.939, 1.000, 0.200, 0.283, 14., 0.700, 0.500, 0.750, 0.500, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "more_individuals",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [1.500, 1.940, 0.280, 1.730, 1.120, 0.710, 0.180, 2.220, 0.850, 0.500, 4.130, 0.110, 1.120, 0.000, 0.020, 0.850, 1.000, 0.140, 0.234, 11., 0.350, 1.300, 0.600, 0.900, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "slow_metastructure",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [8.340, 3.860, 0.030, 1.210, 1.400, 0.300, 1.130, 5.500, 0.390, 17.85, 8.510, 0.960, 0.000, 7.140, 0.020, 0.781, 1.000, 0.200, 0.166, 16., 0.900, 0.600, 0.850, 0.300, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "sloppy_bucky",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [2.870, 3.040, 0.280, 0.090, 0.000, 0.000, 0.440, 0.850, 0.000, 0.000, 2.220, 0.140, 0.300, 0.850, 0.020, 0.891, 1.000, 0.140, 0.166, 21., 0.450, 0.800, 0.700, 0.600, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "massive_structure",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.140, 1.120, 0.190, 0.270, 1.400, 0.000, 1.130, 2.000, 0.390, 0.750, 2.220, 0.190, 0.000, 7.140, 0.210, 0.795, 1.000, 0.120, 0.166, 19., 0.550, 1.000, 0.900, 0.400, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "speed_modulation",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.001, 2.540, 0.080, 0.000, 0.000, 0.000, 3.350, 0.000, 0.000, 0.100, 12.62, 0.060, 0.000, 0.000, 0.270, 0.877, 1.000, 0.250, 0.344, 5.0, 0.650, 0.900, 0.800, 0.500, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "emergent_hex_waves",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 20.00, 0.080, 5.280, 0.000, 0.000, 5.200, 0.000, 0.000, 1.440, 1.560, 0.060, 1.810, 0.000, 0.050, 0.987, 1.000, 0.280, 0.172, 16., 0.750, 0.700, 0.600, 0.800, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "formalisms",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 17.26, 0.280, 0.350, 1.120, 0.660, 1.470, 0.570, 1.020, 0.750, 19.18, 0.390, 0.000, 1.940, 0.130, 0.959, 1.000, 0.110, 0.135, 21., 0.100, 1.400, 0.950, 0.250, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "growing_on_a_sea_of_sand",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 89.60, 20.00, 1.300, 0.000, 0.000, 1.300, 1.400, 1.070, 0.750, 69.08, 2.220, 0.300, 0.000, 0.080, 0.959, 1.000, 0.160, 0.332, 10., 0.850, 0.500, 0.700, 0.700, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "grid_of_sorts",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [4.240, 75.92, 0.000, 4.390, 0.000, 0.000, 1.300, 171.7, 20.00, 6.220, 7.520, 1.120, 0.000, 0.000, 0.060, 0.877, 5.000, 0.230, 0.166, 11., 0.950, 1.200, 0.800, 0.400, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "negotiation_of_highways",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [17.92, 89.60, 3.040, 2.670, 34.88, 10.70, 0.350, 294.8, 0.000, 0.001, 82.76, 20.00, 0.000, 0.000, 0.005, 0.999, 1.000, 0.330, 0.289, 6.0, 0.200, 0.800, 0.900, 0.600, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "transmission_tower",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 28.04, 20.00, 0.180, 26.74, 20.00, 0.010, 1.400, 1.120, 0.830, 0.000, 0.000, 2.540, 0.000, 0.120, 0.959, 1.000, 0.230, 0.166, 5.0, 0.600, 1.100, 0.750, 0.500, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "sacred_network_nodules",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [2.000, 28.04, 0.000, 0.090, 1.000, 0.000, 0.800, 2.080, 0.000, 0.000, 2.000, 0.030, 0.820, 0.000, 0.050, 0.889, 1.000, 0.200, 0.394, 16., 0.400, 0.900, 0.650, 0.750, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "positive_negative_space",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 0.850, 0.010, 0.350, 1.400, 0.000, 1.810, 0.570, 1.450, 0.010, 4.000, 0.020, 0.300, 0.000, 0.110, 0.945, 1.000, 0.070, 0.049, 16., 0.300, 1.300, 0.800, 0.350, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "circular_consolidation",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [1.660, 20.00, 33.19, 1.030, 39.03, 2.540, 2.650, 364.8, 8.200, 0.050, 2.150, 2.540, 0.000, 0.000, 0.001, 0.975, 1.000, 0.160, 0.115, 14., 0.500, 1.600, 0.700, 0.650, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "radiative_nexus",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 9.000, 2000., 1.030, 39.03, 2.540, 2.650, 174.3, 8.200, 6.360, 5.000, 20.00, 0.000, 0.000, 0.001, 0.975, 1.000, 0.080, 0.115, 14., 0.800, 0.700, 0.850, 0.550, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "unfold_time_but_only_in_a_line",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [17.92, 89.60, 3.040, 2.670, 34.88, 10.70, 3.350, 294.8, 0.000, 0.001, 69.76, 116.4, 0.000, 0.000, 0.005, 0.999, 1.000, 0.330, 0.289, 10., 0.150, 1.500, 0.900, 0.300, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "ink_on_white",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 20.00, 3.000, 0.260, 2.150, 4.760, 0.410, 6.600, 12.62, 0.300, 6.600, 0.037, 0.400, 0.040, 0.030, 0.926, 1.000, 0.450, 0.459, 10., 0.000, 0.000, 0.000, 1.000, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "network_time",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 89.60, 20.00, 1.300, 0.000, 0.000, 0.180, 1.400, 1.070, 0.750, 69.08, 2.220, 0.300, 0.000, 0.080, 0.960, 1.000, 0.160, 0.332, 7.0, 0.350, 1.100, 0.800, 0.400, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "inverse_network",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 0.800, 0.020, 0.100, 1.000, 0.000, 0.260, 0.100, 2.790, 0.830, 32.88, 37.74, 0.090, 0.330, 0.100, 0.939, 1.000, 0.430, 0.262, 3.0, 0.750, 0.600, 0.950, 0.700, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "vanishing_points",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [27.50, 2.000, 2.540, 0.880, 26.74, 0.000, 0.090, 267.4, 1.400, 0.100, 5.000, 7.410, 1.400, 14.25, 0.140, 0.754, 1.000, 0.600, 0.627, 11., 0.900, 1.200, 0.600, 0.800, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "neuron_cluster",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [5.350, 6.000, 0.000, 0.100, 1.000, 0.000, 0.180, 1.000, 0.000, 0.000, 2.150, 0.330, 0.000, 0.000, 0.100, 0.840, 2.000, 0.230, 0.164, 16., 0.250, 1.400, 0.750, 0.600, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "scaling_nodule_emergence",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 6.000, 100.0, 0.157, 1.000, 1.070, 0.000, 1.000, 5.000, 0.830, 5.000, 20.00, 0.400, 0.000, 0.003, 0.914, 1.000, 0.250, 0.361, 6.0, 0.450, 0.800, 0.700, 0.900, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "probe_emergence_from_line",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.005, 6.000, 205.3, 0.000, 1.000, 1.000, 0.180, 2.200, 20.00, 0.830, 3.000, 1.320, 0.400, 0.000, 0.001, 0.939, 1.000, 0.150, 0.361, 6.0, 0.650, 1.000, 0.850, 0.500, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "hyp_offset",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 15.00, 8.600, 0.030, 1.000, 0.000, 0.340, 2.000, 1.070, 0.220, 15.00, 0.100, 2.300, 0.820, 1.000, 0.705, 1.000, 0.420, 0.373, 8.0, 0.100, 1.800, 0.600, 0.750, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "noise",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 1.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.230, 0.166, 4.0, 0.500, 0.500, 0.500, 0.500, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "strike",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 32.88, 402.0, 0.410, 3.000, 0.000, 0.100, 0.000, 0.000, 0.300, 6.000, 0.000, 0.000, 0.000, 0.090, 0.914, 1.000, 0.460, 0.290, 6.0, 0.850, 0.900, 0.700, 0.400, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "suture",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [5.350, 2.150, 0.000, 0.340, 20.59, 0.000, 0.490, 0.100, 2.790, 0.830, 125.1, 45.11, 0.090, 0.000, 0.190, 0.975, 1.000, 0.550, 0.213, 6.0, 0.700, 1.300, 0.800, 0.600, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "surface_tension_sharp",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 100.5, 20.00, 0.180, 14.44, 0.000, 1.260, 0.000, 0.000, 0.830, 75.91, 0.860, 0.300, 0.000, 0.390, 0.975, 2.000, 0.250, 0.250, 11., 0.550, 0.700, 0.900, 0.800, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "pincushion",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 0.800, 0.020, 0.340, 20.59, 0.000, 0.260, 0.100, 2.790, 0.830, 125.1, 45.11, 0.580, 0.330, 0.190, 0.975, 1.000, 0.520, 0.238, 5.0, 0.300, 1.100, 0.650, 0.950, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "clear_spaghetti",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [0.000, 0.800, 0.020, 5.200, 1.000, 0.000, 0.260, 0.100, 2.790, 0.830, 32.88, 37.74, 0.090, 0.330, 0.100, 0.939, 1.000, 0.450, 0.189, 6.0, 0.800, 0.800, 0.750, 0.700, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "negotiation_of_zoning",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [17.92, 89.60, 3.040, 2.670, 34.88, 10.70, 5.770, 294.8, 0.000, 0.001, 82.76, 20.00, 0.000, 0.000, 0.005, 0.999, 1.000, 0.330, 0.289, 10., 0.950, 1.600, 0.550, 0.650, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      },
      {
        name: "hexa1833",
        description: "From 36 Points (2019-2022) By Sage Jenson",
        parameters: [1.829, 23.65, 0.029, 0.674, 0.500, 0.000, 1.224, 1.039, 0.000, 0.029, 3.869, 0.054, 0.409, 1.519, 0.080, 0.938, 2.000, 0.065, 0.307, 18., 0.600, 1.000, 0.800, 0.350, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00]
      }
    ];
  }

  /**
   * Create a new user preset based on default parameters
   */
  async createNewPresetFromDefault(title = null, description = null) {
    const defaultParams = this.getDefaultParameters();

    // Generate default title if not provided
    if (!title) {
      const timestamp = new Date().toLocaleString();
      title = `New Default ${timestamp}`;
    }

    // Generate default description if not provided
    if (!description) {
      description = 'New preset created from default parameters';
    }

    // Get all presets to handle ordering
    const allPresets = await this.getAllPresets();

    // Set listOrder to 0 to put it at the top, and increment all other presets
    for (const existingPreset of allPresets) {
      existingPreset.listOrder = (existingPreset.listOrder || 0) + 1;
      await this.putPreset(existingPreset);
    }

    // Create the new preset with listOrder 0 (top position)
    const preset = {
      id: this.generateUUID(),
      title: title.trim(),
      description: description.trim(),
      parameters: [...defaultParams], // Deep copy
      isDefault: false,
      listOrder: 0, // Put at the top
      version: 1,
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };

    await this.putPreset(preset);
    return preset;
  }  /**
   * Validate and normalize parameters array
   */
  validateParameters(parameters) {
    const defaultParams = this.getDefaultParameters();
    const normalizedParams = [...parameters];

    // Add missing parameters from defaults
    while (normalizedParams.length < defaultParams.length) {
      normalizedParams.push(defaultParams[normalizedParams.length]);
    }

    // Truncate if too many parameters
    if (normalizedParams.length > defaultParams.length) {
      normalizedParams.length = defaultParams.length;
    }

    return normalizedParams;
  }

  /**
   * Import preset from JSON data with conflict resolution
   */
  async importPresetFromFile(jsonData, conflictResolution = 'ask') {
    let data;
    try {
      data = JSON.parse(jsonData);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }

    // Validate format
    if (data.format !== 'PhysarumPreset') {
      throw new Error('Invalid preset format. Expected PhysarumPreset format.');
    }

    // Validate required fields
    if (!data.title || !Array.isArray(data.parameters)) {
      throw new Error('Invalid preset data. Missing required fields.');
    }

    // Validate and normalize parameters
    const validatedParameters = this.validateParameters(data.parameters);

    // Check if preset with same ID already exists
    const existingPreset = await this.getPreset(data.id);

    if (existingPreset && conflictResolution === 'ask') {
      return {
        status: 'conflict',
        existingPreset,
        importData: {
          ...data,
          parameters: validatedParameters
        }
      };
    }

    let preset;

    if (existingPreset && conflictResolution === 'overwrite') {
      // Update existing preset with new version
      preset = {
        ...existingPreset,
        title: data.title,
        description: data.description || '',
        parameters: validatedParameters,
        version: (existingPreset.version || 1) + 1,
        modified: new Date().toISOString()
      };
      await this.putPreset(preset);
    } else if (existingPreset && conflictResolution === 'import_new') {
      // Create new preset with new ID
      const allPresets = await this.getAllPresets();
      const maxOrder = allPresets.reduce((max, preset) => Math.max(max, preset.listOrder || 0), -1);

      preset = {
        id: this.generateUUID(),
        title: `${data.title} (Imported)`,
        description: data.description || '',
        parameters: validatedParameters,
        isDefault: false,
        listOrder: maxOrder + 1,
        version: 1,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      };
      await this.putPreset(preset);
    } else if (!existingPreset) {
      // Create new preset with original ID
      const allPresets = await this.getAllPresets();
      const maxOrder = allPresets.reduce((max, preset) => Math.max(max, preset.listOrder || 0), -1);

      preset = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        parameters: validatedParameters,
        isDefault: false,
        listOrder: maxOrder + 1,
        version: data.version || 1,
        created: data.created || new Date().toISOString(),
        modified: new Date().toISOString()
      };
      await this.putPreset(preset);
    }

    return {
      status: 'success',
      preset
    };
  }
}

// Export singleton instance
export default new PresetDatabase();
