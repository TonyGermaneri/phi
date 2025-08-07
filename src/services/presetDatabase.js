/**
 * IndexedDB service for managing particle simulation presets
 * Handles storage and retrieval of user-created presets with metadata
 */

class PresetDatabase {
  constructor() {
    this.dbName = 'PhysarumPresets';
    this.version = 1;
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
        
        // Create presets store if it doesn't exist
        if (!db.objectStoreNames.contains('presets')) {
          const presetStore = db.createObjectStore('presets', { keyPath: 'id' });
          presetStore.createIndex('title', 'title', { unique: false });
          presetStore.createIndex('created', 'created', { unique: false });
          presetStore.createIndex('isDefault', 'isDefault', { unique: false });
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
        originalParameters: originalParameterLines ? [...originalParameterLines[i].slice(0, 26)] : [...presets[i]], // Store original for reset
        isDefault: true,
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
    const preset = {
      id: this.generateUUID(),
      title: title.trim(),
      description: description.trim(),
      parameters: [...parameters], // Deep copy
      isDefault: false,
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };

    await this.putPreset(preset);
    return preset;
  }

  /**
   * Update an existing preset
   */
  async updatePreset(id, title, description, parameters) {
    const existing = await this.getPreset(id);
    if (!existing) {
      throw new Error('Preset not found');
    }

    const updated = {
      ...existing,
      title: title.trim(),
      description: description.trim(),
      parameters: [...parameters], // Deep copy
      modified: new Date().toISOString()
    };

    await this.putPreset(updated);
    return updated;
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
      request.onsuccess = () => resolve(request.result);
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

    if (data.parameters.length !== 24) {
      throw new Error('Invalid preset format: must have exactly 24 parameters');
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
}

// Export singleton instance
export default new PresetDatabase();
