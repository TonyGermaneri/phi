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

    // Fallback default parameters (32 parameters based on the example in ControlPanel.vue)
    return [0.000, 4.000, 0.300, 0.100, 51.32, 20.00, 0.410, 4.000, 0.000, 0.100, 6.000, 0.100, 0.000, 0.000, 0.400, 0.705, 1.000, 0.300, 0.250, 8.0, 0.200, 0.800, 0.700, 0.300, 0.600, 0.000, 1.000, 0.000, 0.200, 0.010, 1.00, 0.00];
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
