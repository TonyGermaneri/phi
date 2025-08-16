<template>
  <div v-if="!drawer" :class="['control-icons', drawerIconClass]">
    <v-icon @click="toggleDrawer" class="cog-icon">mdi-cog</v-icon>
    <v-icon @click="randomizeParameters" class="randomize-icon" title="Randomize parameters by deviation % - (Shortcut: r)">mdi-dice-multiple</v-icon>
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
      <v-card-actions>
        <v-btn @click="showAboutDialog = true; showHelpDialog = false">About</v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="showHelpDialog = false">Close</v-btn>
      </v-card-actions>
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
        <span v-if="currentPreset">{{ currentPreset.title }}<span v-if="hasUnsavedChanges" class="unsaved-indicator">*</span></span>
      </h4>
      <div v-if="currentPreset" class="ml-4 text-caption text-medium-emphasis d-inline-block">
        {{ currentPreset.description }}
      </div>

      <v-spacer></v-spacer>
      <v-icon @click="showHelpDialog = !showHelpDialog" :class="['help-icon', 'float-right', 'mr-3']" title="Help - (Shortcut: ?)">mdi-help-box-outline</v-icon>
      <v-spacer></v-spacer>
    </div>
    <v-tabs v-model="tabs">
      <v-tab v-for="tab in allTabs" :key="tab">
        {{ tab }}
        <v-icon v-if="groups.indexOf(tab) != -1" @click.stop.capture="randomizeGroup(tab)">mdi-dice-multiple</v-icon>
      </v-tab>
    </v-tabs>
    <v-tabs-window v-model="tabs" class="mx-4">
      <!-- Presets tab -->
      <v-tabs-window-item key="preset">
        <div class="mt-4">
          <!-- Playlist Controls -->
          <div class="playlist-controls mb-4">
            <div class="d-flex align-center mb-2">
              <v-btn
                icon
                size="small"
                @click="togglePlaylist"
                :color="isPlaylistPlaying ? 'primary' : 'default'"
                class="mr-2"
                :title="isPlaylistPlaying ? 'Pause Playlist' : 'Play Playlist'"
              >
                <v-icon>{{ isPlaylistPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                @click="previousPresetPlaylist"
                class="mr-2"
                title="Previous Preset"
              >
                <v-icon>mdi-skip-previous</v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                @click="nextPresetPlaylist"
                class="mr-2"
                title="Next Preset"
              >
                <v-icon>mdi-skip-next</v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                @click="toggleLoop"
                :color="isLooping ? 'primary' : 'default'"
                class="mr-2"
                title="Toggle Loop"
              >
                <v-icon>mdi-repeat</v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                @click="toggleShuffle"
                :color="isShuffling ? 'primary' : 'default'"
                title="Toggle Shuffle"
              >
                <v-icon>mdi-shuffle</v-icon>
              </v-btn>
            </div>
            <!-- Convergence Rate Slider -->
            <v-slider
              v-model="convergenceRateControl"
              :min="0.001"
              :max="0.1"
              :step="0.0005"
              thumb-label
              track-color="rgba(255, 255, 255, 0.2)"
              color="secondary"
              class="convergence-rate-slider"
              @update:model-value="updateConvergenceRate"
            >
              <template v-slot:prepend>
                <span class="text-caption">Convergence</span>
              </template>
              <template v-slot:append>
                <span class="text-caption">{{ convergenceRateControl }}</span>
              </template>
            </v-slider>

            <!-- Preset Duration Slider -->
            <v-slider
              v-model="presetDurationControl"
              :min="1"
              :max="120"
              :step="0.1"
              thumb-label
              track-color="rgba(255, 255, 255, 0.2)"
              color="accent"
              class="preset-duration-slider"
              @update:model-value="updatePresetDuration"
            >
              <template v-slot:prepend>
                <span class="text-caption">Preset Time</span>
              </template>
              <template v-slot:append>
                <span class="text-caption">{{ presetDurationControl }}s</span>
              </template>
            </v-slider>
          </div>

          <!-- Randomization Deviation Slider -->
          <v-slider
            v-model="randomizeDeviation"
            :min="0.1"
            :max="100"
            :step="0.1"
            thumb-label
            track-color="rgba(255, 255, 255, 0.2)"
            color="primary"
            class="randomize-deviation-slider"
          >
            <template v-slot:prepend>
              <span class="text-caption">{{ randomizeDeviation }}%</span>
            </template>
            <template v-slot:append>
              <v-icon @click="randomizeParameters" :class="['randomize-icon']" title="Randomize parameters by deviation % - (Shortcut: r)">mdi-dice-multiple</v-icon>
            </template>
          </v-slider>
          <v-btn
            color="success"
            size="small"
            class="mr-2 mb-2"
            @click="createNewFromDefault"
            title="Create new preset with default parameters"
          >
            <v-icon left>mdi-plus-box</v-icon>
            New
          </v-btn>
          <v-btn
            color="primary"
            size="small"
            class="mr-2 mb-2"
            @click="saveCurrentPreset"
            :disabled="!canOverwriteCurrentPreset"
            :variant="hasUnsavedChanges ? 'elevated' : 'text'"
          >
            <v-icon left>mdi-content-save</v-icon>
            Save<span v-if="hasUnsavedChanges" class="unsaved-indicator">*</span>
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
            class="mr-2 mb-2"
            @click="triggerFileUpload"
          >
            <v-icon left>mdi-upload</v-icon>
            Import
          </v-btn>
          <v-btn
            color="warning"
            size="small"
            class="mb-2"
            @click="captureLerpAsPreset"
            title="Capture current lerp state as new preset - stops lerp transformation (Shortcut: c)"
          >
            <v-icon left>mdi-target</v-icon>
            Capture
          </v-btn>
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            style="display: none"
            @change="handleFileUpload"
          />
        </div>

        <v-list :style="{height: isMobileDevice ? '' : 'calc(100vh - 420px)', overflowY: 'auto'}">
          <v-list-item
            v-for="(preset, index) in availablePresets"
            :key="preset.id || index"
            :class="{ 'v-list-item--active': currentPresetIndex === index, 'ma-0': true, 'pa-0': true }"
            @click="selectPreset(index)"
          >
            <!-- Desktop Layout -->
            <div v-if="!isMobileDevice" class="desktop-preset-layout" :style="getPresetItemStyle(index)">
              <div class="d-flex" :style="getPresetItemConvergenceStyle(index)">
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
                      {{ preset.title }}<span v-if="currentPresetIndex === index && hasUnsavedChanges" class="unsaved-indicator">*</span>
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
                      title="Click to edit description"
                    >
                      {{ preset.description }}
                      <v-icon size="small" class="edit-icon">mdi-pencil</v-icon>
                    </span>
                  </div>

                  <!-- Add description option for presets without one -->
                  <div v-else class="preset-description-container">
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
                    @click.stop="copyParameterHashByParams(preset)"
                    class="ml-2"
                    title="Copy preset"
                  >
                    <v-icon size="small">mdi-content-copy</v-icon>
                  </v-btn>
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
                    <v-icon size="small">mdi-content-duplicate</v-icon>
                  </v-btn>
                  <v-btn
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
                  <div class="mobile-preset-title">{{ preset.title }}<span v-if="currentPresetIndex === index && hasUnsavedChanges" class="unsaved-indicator">*</span></div>
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
                      @click.stop="copyParameterHashByParams(preset)"
                      class="mobile-action-btn"
                      title="Copy preset hash"
                    >
                      <v-icon left size="small">mdi-content-copy</v-icon>
                      Copy to Clipboard
                    </v-btn>
                    <v-btn
                      variant="text"
                      size="small"
                      @click.stop="duplicatePreset(preset)"
                      class="mobile-action-btn"
                    >
                      <v-icon left size="small">mdi-content-duplicate</v-icon>
                      Duplicate
                    </v-btn>
                  </div>
                  <div class="mobile-action-row">
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

      <!-- History tab -->
      <v-tabs-window-item key="history">


        <!-- Parameter Hash Input -->
        <div class="mx-4 mt-3 mb-2" >
          <div class="d-flex align-center">
            <v-text-field
              v-model="parameterHash"
              label="Parameter Hash"
              variant="outlined"
              density="compact"
              class="parameter-hash-input"
              @click="selectHashInput"
              @focus="selectHashInput"
              hide-details
              style="font-family: monospace; font-size: 0.85em;"
            ></v-text-field>
            <v-btn
              @click="copyParameterHash"
              icon="mdi-content-copy"
              variant="text"
              size="small"
              class="ml-2"
              title="Copy parameter hash"
            ></v-btn>
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            Compressed parameter state - copy/paste to share configurations
          </div>
        </div>

        <div class="mt-4">
          <div class="d-flex align-center mb-3">
            <h4 class="text-h6">
              Parameter History
            </h4>
            <v-spacer></v-spacer>
            <v-btn
              v-if="parameterHistory.length > 0"
              size="small"
              variant="outlined"
              color="error"
              @click="clearHistory"
            >
              <v-icon left>mdi-trash-can</v-icon>
              Clear
            </v-btn>
          </div>

          <div v-if="parameterHistory.length === 0" class="text-center py-8 text-medium-emphasis">
            <v-icon size="64" class="mb-4">mdi-history</v-icon>
            <p>No parameter changes recorded yet.</p>
            <p class="text-caption">Make some parameter adjustments to see them here!</p>
          </div>

          <v-list v-else class="history-list">
            <v-list-item
              v-for="(entry, index) in parameterHistory"
              :key="entry.id"
              :class="{
                'history-item-current': !isViewingHistory && index === 0,
                'history-item-selected': isViewingHistory && index === currentHistoryIndex
              }"
              @click="revertToHistoryState(index)"
            >
              <template v-slot:prepend>
                <v-icon
                  :color="!isViewingHistory && index === 0 ? 'primary' : (isViewingHistory && index === currentHistoryIndex ? 'secondary' : 'default')"
                >
                  {{ !isViewingHistory && index === 0 ? 'mdi-clock-outline' : (isViewingHistory && index === currentHistoryIndex ? 'mdi-clock-check' : 'mdi-clock') }}
                </v-icon>
              </template>

              <v-list-item-title>
                {{ entry.title }}
                <v-chip
                  v-if="!isViewingHistory && index === 0"
                  size="small"
                  color="primary"
                  class="ml-2"
                >
                  Current
                </v-chip>
                <v-chip
                  v-else-if="isViewingHistory && index === currentHistoryIndex"
                  size="small"
                  color="secondary"
                  class="ml-2"
                >
                  Viewing
                </v-chip>
              </v-list-item-title>

              <v-list-item-subtitle>
                {{ formatHistoryTime(entry.timestamp) }}
                <br>
                <span class="text-caption">{{ getHistoryChangeSummary(entry) }}</span>
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  @click.stop="deleteHistoryEntry(index)"
                >
                  <v-icon size="small">mdi-close</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </div>
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
          :default-value="control.default"
          :input-type="control.inputType || 'slider'"
          @update:model-value="updateParameter(control, $event)"
        >
          <v-icon
            @click="toggleLock(control.index)"
            :icon="isLocked(control) ? 'mdi-lock-open' : 'mdi-lock'"
            :color="isLocked(control) ? 'primary' : 'red'"
            ></v-icon>
          <v-icon @click="randomizeSingle(control.index)">mdi-dice-multiple</v-icon>
        </ParameterControl>
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
import pako from 'pako';
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
      hasUnsavedChanges: false,
      savedParameters: [], // Store the last saved state for comparison
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
      // Parameter hash functionality
      parameterHash: '',
      isUpdatingHash: false, // Prevent circular updates
      isMobileDevice: isMobile,
      showMobileActions: null, // Track which preset's mobile actions are expanded
      // Randomization settings
      randomizeDeviation: 10, // Default 10% deviation
      excludedFromRandomization: [24, 25, 26, 27, 28, 29, 31], // lightness base/multiplier, contrast base/multiplier, chromatic aberration strength/offset, invert
      // Playlist functionality
      isPlaylistPlaying: false,
      isLooping: false,
      isShuffling: false,
      playlistInterval: null,
      playlistSpeed: 3000, // milliseconds between presets
      shuffleOrder: [],
      shuffleIndex: 0,
      convergenceRateControl: 0.005, // Control for simulation convergence rate
      presetDurationControl: 25, // Control for how long each preset stays active (in seconds)
      // Progress tracking
      playlistProgress: 0, // 0-100 representing progress through current preset
      convergenceProgress: 0, // 0-100 representing convergence to target preset
      progressInterval: null, // For updating progress indicators
      keyboardShortcuts: [
        { key: 'H', description: 'Toggle Controls Panel' },
        { key: '[, ]', description: 'Previous, Next Preset' },
        { key: 'P', description: 'Pause/Resume Simulation' },
        { key: '.', description: 'Step Forward (when paused)' },
        { key: 'R', description: 'Randomize Parameters (by deviation %)' },
        { key: 'SPACE', description: 'Toggle Fullscreen' },
        { key: 'S', description: 'Save Current Preset' },
        { key: 'C', description: 'Capture Lerp as Preset' },
        { key: 'L', description: 'Revert to Saved Preset' },
        { key: 'ENTER', description: 'Play/Pause Playlist' },
        { key: 'SHIFT+L', description: 'Toggle Loop' },
        { key: 'SHIFT+S', description: 'Toggle Shuffle' },
        { key: 'CMD+Z, CMD+SHIFT+Z', description: 'Undo/Redo Last Change' },
        { key: '? or /', description: 'Show This Help' }
      ],
      // Parameter history tracking
      parameterHistory: [],
      maxHistoryEntries: 1000,
      currentHistoryIndex: -1, // -1 means we're at the latest state
      isViewingHistory: false,
      // Debounce settings for history
      historyDebounceTime: 500, // milliseconds to wait before adding to history
      historyDebounceTimer: null,
      pendingHistoryChange: null, // Store pending change info
      // Last state saving
      lastStateDebounceTime: 1000, // milliseconds to wait before saving last state
      lastStateDebounceTimer: null
    };
  },
  computed: {
    isLocked() {
      return (control) => {
        return this.excludedFromRandomization.indexOf(control.index) == -1;
      }
    },
    currentPreset() {
      return this.availablePresets[this.currentPresetIndex];
    },
    groups() {
      return [...new Set(this.simControls.map(control => control.group))];
    },
    allTabs() {
      return ['preset', 'history', ...this.groups];
    },
    groupControls() {
      return (group) => {
        return this.simControls.filter(c => c.group == group);
      };
    },
    canOverwriteCurrentPreset() {
      const currentPreset = this.availablePresets[this.currentPresetIndex];
      return currentPreset;
    }
  },
  methods: {
    toggleLock(index) {
      const i = this.excludedFromRandomization.indexOf(index);
      if (i == -1) {
        return this.excludedFromRandomization.push(index);
      }
      this.excludedFromRandomization.splice(i, 1);
    },
    toggleDrawer() {
      this.drawer = !this.drawer;
    },
    toggleMobileActions(presetId) {
      this.showMobileActions = this.showMobileActions === presetId ? null : presetId;
    },
    // Playlist control methods
    togglePlaylist() {
      if (this.isPlaylistPlaying) {
        this.stopPlaylist();
      } else {
        this.startPlaylist();
      }
    },
    startPlaylist() {
      this.isPlaylistPlaying = true;
      if (this.isShuffling && this.shuffleOrder.length === 0) {
        this.generateShuffleOrder();
      }
      this.playlistInterval = setInterval(() => {
        this.nextPresetPlaylist();
      }, this.playlistSpeed);
      this.startProgressTracking();
      this.showMessage('Playlist started');
    },
    stopPlaylist() {
      this.isPlaylistPlaying = false;
      if (this.playlistInterval) {
        clearInterval(this.playlistInterval);
        this.playlistInterval = null;
      }
      this.playlistProgress = 0; // Reset playlist progress but keep convergence tracking
      this.showMessage('Playlist stopped');
    },
    nextPresetPlaylist() {
      if (this.availablePresets.length === 0) return;

      let nextIndex;
      if (this.isShuffling) {
        this.shuffleIndex = (this.shuffleIndex + 1) % this.shuffleOrder.length;
        if (this.shuffleIndex === 0 && !this.isLooping) {
          this.stopPlaylist();
          return;
        }
        nextIndex = this.shuffleOrder[this.shuffleIndex];
      } else {
        nextIndex = this.currentPresetIndex + 1;
        if (nextIndex >= this.availablePresets.length) {
          if (this.isLooping) {
            nextIndex = 0;
          } else {
            this.stopPlaylist();
            return;
          }
        }
      }

      this.selectPreset(nextIndex);
      this.playlistProgress = 0; // Reset progress for new preset
    },
    previousPresetPlaylist() {
      if (this.availablePresets.length === 0) return;

      let prevIndex;
      if (this.isShuffling) {
        this.shuffleIndex = this.shuffleIndex > 0 ? this.shuffleIndex - 1 : this.shuffleOrder.length - 1;
        prevIndex = this.shuffleOrder[this.shuffleIndex];
      } else {
        prevIndex = this.currentPresetIndex - 1;
        if (prevIndex < 0) {
          prevIndex = this.isLooping ? this.availablePresets.length - 1 : 0;
        }
      }

      this.selectPreset(prevIndex);
    },
    toggleLoop() {
      this.isLooping = !this.isLooping;
      this.showMessage(this.isLooping ? 'Loop enabled' : 'Loop disabled');
    },
    toggleShuffle() {
      this.isShuffling = !this.isShuffling;
      if (this.isShuffling) {
        this.generateShuffleOrder();
        this.showMessage('Shuffle enabled');
      } else {
        this.shuffleOrder = [];
        this.shuffleIndex = 0;
        this.showMessage('Shuffle disabled');
      }
    },
    generateShuffleOrder() {
      this.shuffleOrder = Array.from({ length: this.availablePresets.length }, (_, i) => i);
      // Fisher-Yates shuffle
      for (let i = this.shuffleOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.shuffleOrder[i], this.shuffleOrder[j]] = [this.shuffleOrder[j], this.shuffleOrder[i]];
      }
      // Find current preset in shuffle order
      this.shuffleIndex = this.shuffleOrder.indexOf(this.currentPresetIndex);
    },
    updateConvergenceRate(value) {
      if (this.simulation && this.simulation.params) {
        this.simulation.params.convergenceRate = value;
      }
    },
    updatePresetDuration(value) {
      this.playlistSpeed = value * 1000; // Convert seconds to milliseconds
      // If playlist is currently playing, restart the interval with new timing
      if (this.isPlaylistPlaying) {
        this.stopPlaylist();
        this.startPlaylist();
      }
    },
    // Progress tracking methods
    getPresetItemStyle(index) {
      if (!this.isPlaylistPlaying || this.currentPresetIndex !== index) {
        return {};
      }
      // Create a vertical gradient showing playlist progress
      const progress = this.playlistProgress;
      return {
        background: `linear-gradient(to bottom,
          rgba(0, 0, 238, 0.4) 0%,
          rgba(0, 0, 238, 0.4) ${progress}%,
          rgba(255, 255, 255, 0.05) ${progress}%,
          rgba(255, 255, 255, 0.05) 100%)`
      };
    },
    // Progress tracking methods
    getPresetItemConvergenceStyle(index) {
      // Create a horizontal gradient showing convergence progress
      if (this.currentPresetIndex != index) {
        return {};
      }
      const progress = this.convergenceProgress;
      return {
        background: `linear-gradient(to right,
          rgba(150, 0, 150, 0.5) 0%,
          rgba(150, 0, 150, 0.5) ${progress}%,
          rgba(255, 255, 255, 0.05) ${progress}%,
          rgba(255, 255, 255, 0.05) 100%)`
      };
    },
    startProgressTracking() {
      this.playlistProgress = 0;
      // Create interval only for playlist progress (time-based)
      if (!this.progressInterval) {
        this.progressInterval = setInterval(() => {
          if (this.isPlaylistPlaying) {
            this.playlistProgress += (100 / (this.playlistSpeed / 50));
            if (this.playlistProgress >= 100) {
              this.playlistProgress = 0;
            }
          }
        }, 50); // Update every 50ms for smooth playlist animation
      }
    },
    stopProgressTracking() {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
      this.playlistProgress = 0;
    },
    toggleFullscreen() {
      if (this.isFullscreen) {
        document.exitFullscreen();
      } else {
        document.body.requestFullscreen();
      }
      this.isFullscreen = !this.isFullscreen;
    },
    // Helper method to generate a random value for a control
    generateRandomValueForControl(control) {
      if (control.inputType === 'switch') {
        return Math.random() < 0.5;
      }

      const currentValue = this.currentParameters[control.index] || control.default || 0;
      const min = control.min || 0;
      const max = control.max || 100;

      // Calculate deviation range as percentage of current value
      const deviationPercent = this.randomizeDeviation / 100;
      const valueRange = max - min;
      const deviationAmount = Math.max(valueRange * 0.01, Math.abs(currentValue) * deviationPercent);

      // Generate random value within deviation range
      const minDeviation = Math.max(min, currentValue - deviationAmount);
      const maxDeviation = Math.min(max, currentValue + deviationAmount);

      let randomValue = Math.random() * (maxDeviation - minDeviation) + minDeviation;

      if (control.step) {
        randomValue = Math.round(randomValue / control.step) * control.step;
      }

      return randomValue;
    },

    // Helper method to perform common randomization setup and cleanup
    performRandomization(controls, historyMessage, successMessage) {
      if (!this.simulation || !this.simControls) {
        return false;
      }

      // Clear any pending debounced history changes before randomizing
      this.clearPendingHistory();

      // Store previous parameters for history
      const previousParameters = [...this.currentParameters];

      // Generate and apply random values for the specified controls
      for (const control of controls) {
        const randomValue = this.generateRandomValueForControl(control);
        this.simulation.updateParameter(control.index, randomValue);
        this.currentParameters[control.index] = randomValue;
      }

      // Add to history
      this.addToHistory(historyMessage, previousParameters);

      // Save last state after randomization
      this.debouncedSaveLastState();

      // Check for unsaved changes after randomization
      this.checkForUnsavedChanges();

      // Show feedback message
      if (successMessage) {
        this.showMessage(successMessage);
      }

      return true;
    },

    randomizeParameters() {
      // Get all unlocked controls
      const unlockedControls = this.simControls.filter(control =>
        !this.excludedFromRandomization.includes(control.index)
      );

      this.performRandomization(
        unlockedControls,
        `Randomized parameters (${this.randomizeDeviation}% deviation)`,
        null // No success message for global randomization
      );
    },

    randomizeSingle(controlIndex) {
      // Find the control by index
      const control = this.simControls.find(c => c.index === controlIndex);
      if (!control) {
        console.warn(`Control with index ${controlIndex} not found`);
        return;
      }

      // Skip if this parameter is excluded from randomization
      if (this.excludedFromRandomization.includes(control.index)) {
        this.showMessage(`Parameter "${control.title}" is locked from randomization`);
        return;
      }

      this.performRandomization(
        [control],
        `Randomized "${control.title}" (${this.randomizeDeviation}% deviation)`,
        `Randomized "${control.title}"`
      );
    },

    randomizeGroup(groupName) {
      // Get all controls in this group
      const groupControls = this.simControls.filter(c => c.group === groupName);
      if (groupControls.length === 0) {
        console.warn(`No controls found for group "${groupName}"`);
        return;
      }

      // Filter out locked controls
      const unlockedControls = groupControls.filter(control =>
        !this.excludedFromRandomization.includes(control.index)
      );

      if (unlockedControls.length === 0) {
        this.showMessage(`All parameters in "${groupName}" group are locked`);
        return;
      }

      // Create detailed messages
      const lockedCount = groupControls.length - unlockedControls.length;
      const historyMessage = lockedCount > 0
        ? `Randomized "${groupName}" group (${unlockedControls.length}/${groupControls.length} parameters, ${lockedCount} locked)`
        : `Randomized "${groupName}" group (${unlockedControls.length} parameters)`;

      const successMessage = lockedCount > 0
        ? `Randomized "${groupName}" group (${lockedCount} parameters locked)`
        : `Randomized "${groupName}" group`;

      this.performRandomization(unlockedControls, historyMessage, successMessage);
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
          if (this.isPlaylistPlaying) {
            this.previousPresetPlaylist();
          } else {
            this.previousPreset();
          }
          event.preventDefault();
          break;
        case ']':
          if (this.isPlaylistPlaying) {
            this.nextPresetPlaylist();
          } else {
            this.nextPreset();
          }
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
          this.randomizeParameters();
          this.showMessage(`Parameters randomized (±${this.randomizeDeviation}%)`);
          break;
        case ' ':
          this.toggleFullscreen();
          event.preventDefault();
          break;
        case 's':
          if (event.metaKey || event.ctrlKey) {
            // CMD/CTRL+S saves the current preset
            this.saveCurrentPresetKeyboard();
            event.preventDefault();
          } else if (event.shiftKey) {
            this.toggleShuffle();
          } else {
            this.saveCurrentPresetKeyboard();
          }
          event.preventDefault();
          break;
        case 'c':
          if (event.shiftKey || event.metaKey || event.ctrlKey) {
            return;
          }
          this.captureLerpAsPreset();
          event.preventDefault();
          break;
        case 'z':
          if (event.metaKey || event.ctrlKey) {
            if (event.shiftKey) {
              // CMD/CTRL+SHIFT+Z for redo
              this.redoLastChange();
            } else {
              // CMD/CTRL+Z for undo
              this.undoLastChange();
            }
            event.preventDefault();
          }
          break;
        case 'l':
          if (event.shiftKey) {
            this.toggleLoop();
          } else {
            this.revertToSavedPreset();
          }
          event.preventDefault();
          break;
        case 'enter':
          this.togglePlaylist();
          event.preventDefault();
          break;
      }
    },
    showMessage(message) {
      this.snackbarMessage = message;
      if (this.isFullscreen) { return; }
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

        // Reset unsaved changes flag since we reverted to saved state
        this.hasUnsavedChanges = false;
        this.showMessage(`Reverted to saved: ${currentPreset.title}`);
      } else {
        this.showMessage('No saved version to revert to');
      }
    },
    animate() {
      if (this.simulation.params.update) {
        this.simulation.draw();
        this.convergenceProgress = this.simulation.params.lerpTime * 100;
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
        // Store previous parameters for history if this is the first change in a sequence
        let previousParameters = null;
        if (!this.pendingHistoryChange) {
          previousParameters = [...this.currentParameters];
        }

        // Update simulation immediately (no debounce for real-time feedback)
        this.simulation.updateParameter(control.index, value);
        this.currentParameters[control.index] = value;

        // Set up debounced history tracking
        const controlName = control.title || control.name || `Parameter ${control.index}`;
        this.debouncedAddToHistory(controlName, previousParameters);

        // Set up debounced last state saving
        this.debouncedSaveLastState();

        // Check if we have unsaved changes by comparing with saved state
        this.checkForUnsavedChanges();
      }
    },
    checkForUnsavedChanges() {
      if (this.savedParameters.length === 0) {
        // No saved state yet, consider any changes as unsaved
        this.hasUnsavedChanges = this.currentParameters.some(param => param !== undefined);
        return;
      }

      // Compare current parameters with saved parameters
      this.hasUnsavedChanges = this.currentParameters.some((param, index) =>
        param !== this.savedParameters[index]
      );
    },
    updateSystemParameter(control, value) {
      if (this.simulation) {
        this.simulation.updateSystemParameter(control.name, value);

        // System parameter changes could be considered as changes needing save
        // depending on your requirements, you might want to track these too
        this.checkForUnsavedChanges();
      }
    },
    async selectPreset(index) {
      if (this.simulation && index >= 0 && index < this.availablePresets.length) {
        // Clear any pending debounced history changes before switching presets
        this.clearPendingHistory();

        // Store previous parameters for history
        const previousParameters = [...this.currentParameters];

        this.currentPresetIndex = index;

        // Get the preset ID to reload from database
        const presetId = this.availablePresets[index].id;

        try {
          // Reload the preset from the database to get the fresh saved state
          const freshPreset = await this.presetDatabase.getPreset(presetId);
          if (freshPreset && freshPreset.parameters) {
            // Update the local preset data with fresh database values
            this.availablePresets[index] = { ...freshPreset };

            // Update the simulation parameter set with fresh data
            this.simulation.parameterSets[index] = new Float32Array(freshPreset.parameters);

            // Set the preset in simulation with fresh parameters
            this.simulation.setPreset(index);
            this.updateCurrentParameters();

            // Add to history
            this.addToHistory(`Loaded preset: ${freshPreset.title}`, previousParameters);

            // Save last state after preset change
            this.debouncedSaveLastState();

            // Store the saved state for change detection and reset unsaved changes
            this.savedParameters = [...freshPreset.parameters];
            this.hasUnsavedChanges = false; // No unsaved changes since we loaded fresh from DB

            // Store original parameters for revert functionality
            this.originalPresetParameters[freshPreset.id] = [...freshPreset.parameters];
          } else {
            // Fallback to existing behavior if database read fails
            this.simulation.setPreset(index);
            this.updateCurrentParameters();

            const preset = this.availablePresets[index];
            if (preset && preset.parameters) {
              // Add to history
              this.addToHistory(`Loaded preset: ${preset.title}`, previousParameters);

              // Save last state after preset change
              this.debouncedSaveLastState();

              this.savedParameters = [...preset.parameters];
              this.hasUnsavedChanges = false;
            }
          }
        } catch (error) {
          console.error('Failed to reload preset from database:', error);
          // Fallback to existing behavior if database read fails
          this.simulation.setPreset(index);
          this.updateCurrentParameters();

          const preset = this.availablePresets[index];
          if (preset && preset.parameters) {
            // Save last state after preset change
            this.debouncedSaveLastState();

            this.savedParameters = [...preset.parameters];
            this.hasUnsavedChanges = false;
          }
        }

        // Reset progress indicators when manually changing presets
        if (this.isPlaylistPlaying) {
          this.playlistProgress = 0;
        }
        this.convergenceProgress = 0;
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
      // Get the comprehensive list of default presets from the database
      const defaultPresetConfigs = this.presetDatabase.getDefaultPresetConfigurations();

      try {
        for (const config of defaultPresetConfigs) {
          await this.presetDatabase.saveUserPreset(config.name, config.description, config.parameters);
          this.simulation.addParameterSet(config.parameters);
        }

        // Reload presets after creating defaults
        await this.loadAllPresets();
      } catch (error) {
        console.error('Failed to create default presets:', error);
      }
    },
    async saveCurrentPreset() {
      const currentPreset = this.availablePresets[this.currentPresetIndex];
      if (!currentPreset) {
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

        // Update saved state and clear unsaved changes flag
        this.savedParameters = [...currentParams];
        this.hasUnsavedChanges = false;
      } catch (error) {
        console.error('Failed to save preset:', error);
      }
    },
    async createNewFromDefault() {
      try {
        // Create new preset from default using the preset database
        const newPreset = await this.presetDatabase.createNewPresetFromDefault();

        // Add to local presets list at the beginning (top)
        this.availablePresets.unshift(newPreset);

        // Add to simulation parameter sets at the beginning
        this.simulation.parameterSets.unshift(new Float32Array(newPreset.parameters));

        // Select the new preset (it's now at index 0)
        this.currentPresetIndex = 0;

        // Apply the default parameters to the simulation immediately
        for (let i = 0; i < newPreset.parameters.length; i++) {
          this.simulation.updateParameter(i, newPreset.parameters[i]);
        }

        // Update current parameters and saved state
        this.currentParameters = [...newPreset.parameters];
        this.savedParameters = [...newPreset.parameters];
        this.hasUnsavedChanges = false;

        // Show success message
        this.showMessage(`Created new preset "${newPreset.title}" with default parameters`);

      } catch (error) {
        console.error('Failed to create new preset from default:', error);
        this.showMessage('Failed to create new preset from default parameters');
      }
    },
    async captureLerpAsPreset() {
      if (!this.simulation || !this.simulation.lerpParams) {
        this.showMessage('No lerp parameters available to capture');
        return;
      }

      try {
        // Get the current lerp parameters
        const lerpParams = Array.from(this.simulation.lerpParams);

        // Generate a timestamp-based title for the captured preset
        const timestamp = new Date().toLocaleString();
        const presetTitle = `Lerp Capture ${timestamp}`;
        const presetDescription = 'Captured from lerp transformation state';

        // Save as new preset using the existing preset database
        const newPreset = await this.presetDatabase.saveUserPreset(
          presetTitle,
          presetDescription,
          lerpParams
        );

        // Add to local presets list
        this.availablePresets.push(newPreset);

        // Add to simulation parameter sets
        this.simulation.addParameterSet(lerpParams);

        // Select the new preset
        this.currentPresetIndex = this.availablePresets.length - 1;
        this.simulation.setPreset(this.currentPresetIndex);

        // Store previous parameters for history
        const previousParameters = [...this.currentParameters];

        // Update current parameters to match the captured lerp state
        this.currentParameters = [...lerpParams];

        // Add to history
        this.addToHistory('Captured lerp as preset', previousParameters);

        // Save last state after capturing lerp
        this.debouncedSaveLastState();

        // Update saved state since we just created a new preset with captured parameters
        this.savedParameters = [...lerpParams];
        this.hasUnsavedChanges = false;

        // Show success message
        this.showMessage(`Captured lerp state as: ${presetTitle}`);

      } catch (error) {
        console.error('Failed to capture lerp as preset:', error);
        this.showMessage('Failed to capture lerp state');
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

        // Update saved state since we just created a new preset with current parameters
        this.savedParameters = [...currentParams];
        this.hasUnsavedChanges = false;

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
          this.editingField === 'description' ? newValue : preset.description
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
    },

    // History management methods
    addToHistory(changeDescription, previousParameters) {
      // If we're viewing history and make a change, return to current state
      // but preserve the full history stack
      if (this.isViewingHistory) {
        this.isViewingHistory = false;
        this.currentHistoryIndex = -1;
      }

      const historyEntry = {
        id: Date.now() + Math.random(), // Unique ID
        title: changeDescription,
        timestamp: new Date(),
        parameters: [...this.currentParameters], // Deep copy
        previousParameters: previousParameters ? [...previousParameters] : null
      };

      // Add to beginning of history (most recent first)
      this.parameterHistory.unshift(historyEntry);

      // Limit history size
      if (this.parameterHistory.length > this.maxHistoryEntries) {
        this.parameterHistory = this.parameterHistory.slice(0, this.maxHistoryEntries);
      }
    },

    clearPendingHistory() {
      // Clear any pending debounced history changes
      if (this.historyDebounceTimer) {
        clearTimeout(this.historyDebounceTimer);
        this.historyDebounceTimer = null;
      }
      this.pendingHistoryChange = null;
    },

    debouncedAddToHistory(changeDescription, previousParameters) {
      // Store the change information for debouncing
      if (!this.pendingHistoryChange) {
        this.pendingHistoryChange = {
          description: changeDescription,
          previousParameters: previousParameters
        };
      }

      // Clear existing timer
      if (this.historyDebounceTimer) {
        clearTimeout(this.historyDebounceTimer);
      }

      // Set new timer
      this.historyDebounceTimer = setTimeout(() => {
        if (this.pendingHistoryChange) {
          this.addToHistory(
            `Changed ${this.pendingHistoryChange.description}`,
            this.pendingHistoryChange.previousParameters
          );
          this.pendingHistoryChange = null;
        }
        this.historyDebounceTimer = null;
      }, this.historyDebounceTime);
    },

    debouncedSaveLastState() {
      // Clear existing timer
      if (this.lastStateDebounceTimer) {
        clearTimeout(this.lastStateDebounceTimer);
      }

      // Set new timer
      this.lastStateDebounceTimer = setTimeout(async () => {
        try {
          // Get the currently selected preset ID
          const selectedPresetId = this.availablePresets[this.currentPresetIndex]?.id || null;
          await this.presetDatabase.saveLastState(this.currentParameters, selectedPresetId);
        } catch (error) {
          console.error('Failed to save last state:', error);
        }
        this.lastStateDebounceTimer = null;
      }, this.lastStateDebounceTime);
    },

    revertToHistoryState(index) {
      if (index >= 0 && index < this.parameterHistory.length) {
        const historyEntry = this.parameterHistory[index];

        // Set viewing history state
        this.isViewingHistory = true;
        this.currentHistoryIndex = index;

        // Apply the historical parameters
        this.currentParameters = [...historyEntry.parameters];

        // Update simulation
        if (this.simulation) {
          for (let i = 0; i < historyEntry.parameters.length; i++) {
            if (historyEntry.parameters[i] !== undefined) {
              this.simulation.updateParameter(i, historyEntry.parameters[i]);
            }
          }
        }

        // Save last state after history revert
        this.debouncedSaveLastState();

        // Don't mark as unsaved changes since we're just viewing history
        this.hasUnsavedChanges = false;
      }
    },

    returnToCurrentState() {
      if (this.isViewingHistory && this.parameterHistory.length > 0) {
        // Return to the most recent state (index 0)
        const currentEntry = this.parameterHistory[0];
        this.isViewingHistory = false;
        this.currentHistoryIndex = -1;

        // Apply the current parameters
        this.currentParameters = [...currentEntry.parameters];

        // Update simulation
        if (this.simulation) {
          for (let i = 0; i < currentEntry.parameters.length; i++) {
            if (currentEntry.parameters[i] !== undefined) {
              this.simulation.updateParameter(i, currentEntry.parameters[i]);
            }
          }
        }

        // Save last state after returning to current
        this.debouncedSaveLastState();

        // Check for unsaved changes
        this.checkForUnsavedChanges();
      }
    },

    deleteHistoryEntry(index) {
      this.parameterHistory.splice(index, 1);

      // If we were viewing a deleted entry, adjust the current index
      if (this.isViewingHistory) {
        if (index === this.currentHistoryIndex) {
          // We deleted the currently viewed entry, return to current state
          this.returnToCurrentState();
        } else if (index < this.currentHistoryIndex) {
          // Adjust index since we removed an entry before our current one
          this.currentHistoryIndex--;
        }
      }
    },

    clearHistory() {
      this.parameterHistory = [];
      this.isViewingHistory = false;
      this.currentHistoryIndex = -1;
    },

    formatHistoryTime(timestamp) {
      const now = new Date();
      const diff = now - timestamp;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
      } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      } else {
        return 'Just now';
      }
    },

    getHistoryChangeSummary(entry) {
      if (!entry.previousParameters) {
        return 'Initial state';
      }

      const changes = [];
      for (let i = 0; i < Math.max(entry.parameters.length, entry.previousParameters.length); i++) {
        if (entry.parameters[i] !== entry.previousParameters[i]) {
          // Find the control name for this index
          const control = this.simControls.find(c => c.index === i);
          if (control) {
            changes.push(control.title || control.name || `Parameter ${i}`);
          }
        }
      }

      if (changes.length === 0) {
        return 'No changes detected';
      } else if (changes.length === 1) {
        return `Changed ${changes[0]}`;
      } else if (changes.length <= 3) {
        return `Changed ${changes.join(', ')}`;
      } else {
        return `Changed ${changes.length} parameters`;
      }
    },

    // Undo/Redo functionality
    undoLastChange() {
      if (this.parameterHistory.length === 0) {
        this.showMessage('No history to undo');
        return;
      }

      if (this.isViewingHistory) {
        // If we're already viewing history, go to the next entry (further back)
        if (this.currentHistoryIndex < this.parameterHistory.length - 1) {
          this.revertToHistoryState(this.currentHistoryIndex + 1);
          this.showMessage(`Undo: ${this.parameterHistory[this.currentHistoryIndex].title}`);
        } else {
          this.showMessage('Nothing more to undo');
        }
      } else {
        // Start viewing history from the second entry (index 1)
        // Index 0 is the current state, index 1 is the previous state
        if (this.parameterHistory.length > 1) {
          this.revertToHistoryState(1);
          this.showMessage(`Undo: ${this.parameterHistory[1].title}`);
        } else {
          this.showMessage('Nothing to undo');
        }
      }
    },

    redoLastChange() {
      if (!this.isViewingHistory) {
        this.showMessage('Nothing to redo');
        return;
      }

      if (this.currentHistoryIndex > 0) {
        // Go to a more recent entry (lower index)
        this.revertToHistoryState(this.currentHistoryIndex - 1);
        this.showMessage(`Redo: ${this.parameterHistory[this.currentHistoryIndex].title}`);
      } else {
        // Return to current state (index 0 is most recent)
        this.returnToCurrentState();
        this.showMessage('Returned to current state');
      }
    },

    // Parameter hash methods
    compressParametersToHash(parameters) {
      try {
        // Convert parameters to Float32Array for consistent binary representation
        const floatArray = new Float32Array(parameters);
        // Convert to binary data
        const binaryData = new Uint8Array(floatArray.buffer);
        // Compress with zlib
        const compressed = pako.deflate(binaryData);
        // Convert to base64
        return btoa(String.fromCharCode.apply(null, compressed));
      } catch (error) {
        console.error('Failed to compress parameters:', error);
        return '';
      }
    },

    compressPresetToHash(preset) {
      try {
        // Create a data structure that includes parameters, name, and description
        const presetData = {
          title: preset.title || '',
          description: preset.description || '',
          parameters: preset.parameters || []
        };

        // Convert to JSON string and then to binary data
        const jsonString = JSON.stringify(presetData);
        const textEncoder = new TextEncoder();
        const binaryData = textEncoder.encode(jsonString);

        // Compress with zlib
        const compressed = pako.deflate(binaryData);
        // Convert to base64
        return btoa(String.fromCharCode.apply(null, compressed));
      } catch (error) {
        console.error('Failed to compress preset:', error);
        return '';
      }
    },

    decompressHashToParameters(hash) {
      try {
        if (!hash || hash.trim() === '') {
          return null;
        }

        // Try to decompress as new format first (JSON with preset data)
        try {
          // Convert from base64
          const binaryString = atob(hash);
          const compressed = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            compressed[i] = binaryString.charCodeAt(i);
          }

          // Decompress with zlib
          const decompressed = pako.inflate(compressed);

          // Try to decode as UTF-8 text (new format)
          const textDecoder = new TextDecoder();
          const jsonString = textDecoder.decode(decompressed);
          const presetData = JSON.parse(jsonString);

          // If successful, return the preset data object
          if (presetData && typeof presetData === 'object' && presetData.parameters) {
            return presetData;
          }
        } catch (newFormatError) {
          // If new format fails, try legacy format
        }

        // Fallback to legacy format (just parameters as Float32Array)
        const binaryString = atob(hash);
        const compressed = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          compressed[i] = binaryString.charCodeAt(i);
        }

        // Decompress with zlib
        const decompressed = pako.inflate(compressed);
        // Convert back to Float32Array
        const floatArray = new Float32Array(decompressed.buffer);
        // Convert to regular array
        return Array.from(floatArray);
      } catch (error) {
        console.error('Failed to decompress hash:', error);
        return null;
      }
    },

    updateParameterHash() {
      if (this.isUpdatingHash) return;

      this.isUpdatingHash = true;

      // If we have a current preset, include its title and description in the hash
      const currentPreset = this.availablePresets[this.currentPresetIndex];
      if (currentPreset) {
        const presetData = {
          title: currentPreset.title || '',
          description: currentPreset.description || '',
          parameters: this.currentParameters
        };
        this.parameterHash = this.compressPresetToHash(presetData);
      } else {
        // Fallback to parameters-only format
        this.parameterHash = this.compressParametersToHash(this.currentParameters);
      }

      this.$nextTick(() => {
        this.isUpdatingHash = false;
      });
    },

    applyParameterHash() {
      if (this.isUpdatingHash) return;

      const decompressedData = this.decompressHashToParameters(this.parameterHash);
      if (decompressedData) {
        this.isUpdatingHash = true;

        // Store previous parameters for history
        const previousParameters = [...this.currentParameters];

        let parameters;
        let historyMessage = 'Applied parameter hash';

        // Check if it's the new format (object with preset data) or legacy format (array)
        if (Array.isArray(decompressedData)) {
          // Legacy format - just parameters
          parameters = decompressedData;
        } else if (decompressedData.parameters && Array.isArray(decompressedData.parameters)) {
          // New format - preset object with title, description, and parameters
          parameters = decompressedData.parameters;

          // Update history message to include preset info
          if (decompressedData.title) {
            historyMessage = `Applied preset: ${decompressedData.title}`;
          }

          // Show message about the applied preset
          const titleInfo = decompressedData.title ? ` "${decompressedData.title}"` : '';
          const descInfo = decompressedData.description ? ` - ${decompressedData.description}` : '';
          this.showMessage(`Applied preset${titleInfo}${descInfo}`);
        } else {
          // Invalid format
          this.isUpdatingHash = false;
          return;
        }

        // Apply parameters to simulation
        for (let i = 0; i < parameters.length && i < this.simControls.length; i++) {
          if (parameters[i] !== undefined) {
            this.simulation.updateParameter(i, parameters[i]);
            this.currentParameters[i] = parameters[i];
          }
        }

        // Add to history
        this.addToHistory(historyMessage, previousParameters);

        // Save last state after hash application
        this.debouncedSaveLastState();

        // Check for unsaved changes
        this.checkForUnsavedChanges();

        this.$nextTick(() => {
          this.isUpdatingHash = false;
        });
      }
    },
    copyToClipboard(val) {
      navigator.clipboard.writeText(val).then(() => {
        this.showMessage('Preset hash copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy hash:', err);
        this.showMessage('Failed to copy hash');
      });
    },
    copyParameterHashByParams(presetOrParams) {
      // Check if it's a preset object with title/description or just parameters
      if (presetOrParams && typeof presetOrParams === 'object' &&
          (presetOrParams.title !== undefined || presetOrParams.description !== undefined || presetOrParams.parameters !== undefined)) {
        // It's a preset object - use the new compression format
        this.copyToClipboard(this.compressPresetToHash(presetOrParams));
      } else {
        // It's just parameters - use the legacy format
        this.copyToClipboard(this.compressParametersToHash(presetOrParams));
      }
    },
    copyParameterHash(params) {
      if (this.parameterHash) {
        this.copyToClipboard(this.parameterHash);
      }
    },
    selectHashInput(event) {
      event.target.select();
    },

    async createPresetFromHash(presetData) {
      try {
        this.isUpdatingHash = true;

        // Store previous parameters for history
        const previousParameters = [...this.currentParameters];

        // Generate a unique title if one with the same name already exists
        let finalTitle = presetData.title || 'Imported Preset';
        let counter = 1;
        while (this.availablePresets.some(preset => preset.title === finalTitle)) {
          finalTitle = `${presetData.title || 'Imported Preset'} (${counter})`;
          counter++;
        }

        // Create new preset using the preset database
        const newPreset = await this.presetDatabase.saveUserPreset(
          finalTitle,
          presetData.description || 'Imported from parameter hash',
          presetData.parameters
        );

        // Add to local presets list
        this.availablePresets.push(newPreset);

        // Add to simulation parameter sets
        this.simulation.addParameterSet(presetData.parameters);

        // Select the new preset
        this.currentPresetIndex = this.availablePresets.length - 1;
        this.simulation.setPreset(this.currentPresetIndex);

        // Apply the parameters to current state
        for (let i = 0; i < presetData.parameters.length && i < this.simControls.length; i++) {
          if (presetData.parameters[i] !== undefined) {
            this.simulation.updateParameter(i, presetData.parameters[i]);
            this.currentParameters[i] = presetData.parameters[i];
          }
        }

        // Add to history
        this.addToHistory(`Created preset from hash: ${finalTitle}`, previousParameters);

        // Save last state after preset creation
        this.debouncedSaveLastState();

        // Update saved state since we just created a new preset
        this.savedParameters = [...presetData.parameters];
        this.hasUnsavedChanges = false;

        // Show success message
        this.showMessage(`Created new preset: ${finalTitle}`);

        this.$nextTick(() => {
          this.isUpdatingHash = false;
        });

      } catch (error) {
        console.error('Failed to create preset from hash:', error);
        this.showMessage('Failed to create preset from hash');
        this.isUpdatingHash = false;
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
    // Sync convergence rate control with simulation
    'simulation.params.convergenceRate': {
      handler(newConvergenceRate) {
        if (newConvergenceRate !== undefined && newConvergenceRate !== this.convergenceRateControl) {
          this.convergenceRateControl = newConvergenceRate;
        }
      }
    },
    // Cancel editing when clicking on a different preset
    currentPresetIndex() {
      this.cancelEdit();
      // Update shuffle index if shuffling
      if (this.isShuffling && this.shuffleOrder.length > 0) {
        this.shuffleIndex = this.shuffleOrder.indexOf(this.currentPresetIndex);
      }
    },
    // Watch for parameter changes and update hash
    currentParameters: {
      handler() {
        if (!this.isUpdatingHash) {
          this.updateParameterHash();
        }
      },
      deep: true
    },
    // Watch for hash changes and apply parameters
    parameterHash() {
      if (!this.isUpdatingHash && this.parameterHash && this.parameterHash.trim() !== '') {
        // First check if this is a preset with title/description that should create a new record
        const decompressedData = this.decompressHashToParameters(this.parameterHash);

        if (decompressedData && !Array.isArray(decompressedData) &&
            decompressedData.parameters && Array.isArray(decompressedData.parameters) &&
            (decompressedData.title || decompressedData.description)) {
          // This is a compressed preset with metadata - create a new preset record
          this.createPresetFromHash(decompressedData);
        } else {
          // Regular parameter hash - just apply the parameters
          this.applyParameterHash();
        }
      }
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

    // Load and apply last state if it exists
    try {
      const lastState = await this.presetDatabase.loadLastState();
      if (lastState && lastState.parameters && lastState.parameters.length > 0) {
        // If we have a selected preset ID, try to find and preselect that preset
        if (lastState.selectedPresetId) {
          const presetIndex = this.availablePresets.findIndex(preset => preset.id === lastState.selectedPresetId);
          if (presetIndex !== -1) {
            this.currentPresetIndex = presetIndex;
          }
        }

        // Apply last state parameters to simulation
        for (let i = 0; i < lastState.parameters.length; i++) {
          if (lastState.parameters[i] !== undefined) {
            this.simulation.updateParameter(i, lastState.parameters[i]);
          }
        }
        this.currentParameters = [...lastState.parameters];

        // Add initial history entry for last state
        this.addToHistory('Loaded last state', null);

        // Mark as having unsaved changes since last state differs from preset
        this.hasUnsavedChanges = true;
      } else {
        // No last state, use current preset
        this.updateCurrentParameters();
      }
    } catch (error) {
      console.error('Failed to load last state:', error);
      // Fall back to normal preset loading
      this.updateCurrentParameters();
    }

    // Initialize saved state
    if (this.availablePresets.length > 0 && this.availablePresets[this.currentPresetIndex]) {
      const currentPreset = this.availablePresets[this.currentPresetIndex];
      if (currentPreset.parameters) {
        this.savedParameters = [...currentPreset.parameters];

        // Add initial history entry only if we didn't load last state
        if (!this.parameterHistory.length) {
          this.hasUnsavedChanges = false;
          this.addToHistory(`Initial state: ${currentPreset.title}`, null);
        }
      }
    }

    // Initialize convergence rate control with simulation's initial value
    if (this.simulation && this.simulation.params) {
      this.convergenceRateControl = this.simulation.params.convergenceRate;
    }

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
    this.showMessage(`Press ? for help`);
  },

  beforeUnmount() {
    // Stop playlist
    this.stopPlaylist();

    // Stop progress tracking
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }

    // Clear any pending history debounce timer
    this.clearPendingHistory();

    // Clear any pending last state debounce timer
    if (this.lastStateDebounceTimer) {
      clearTimeout(this.lastStateDebounceTimer);
      this.lastStateDebounceTimer = null;
    }

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

.unsaved-indicator {
  color: #ff6b6b;
  font-weight: bold;
  margin-left: 4px;
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

/* Randomization settings styles */
.randomize-settings {
  border: 1px solid rgba(98, 0, 238, 0.3);
}

.randomize-deviation-slider {
  margin: 0 !important;
}

.randomize-deviation-slider .v-slider-track__fill {
  background: linear-gradient(90deg, #6200ee, #bb86fc) !important;
}

.randomize-deviation-slider .v-slider-thumb {
  background: #bb86fc !important;
}

/* Playlist controls styles */
.playlist-controls {
  border: 1px solid rgba(98, 0, 238, 0.3);
  border-radius: 8px;
  padding: 12px;
  background: rgba(98, 0, 238, 0.1);
}

.playlist-controls .v-btn {
  transition: all 0.2s ease;
}

.playlist-controls .v-btn:hover {
  transform: scale(1.05);
}

.lerp-time-slider {
  margin: 8px 0 0 0 !important;
}

.lerp-time-slider .v-slider-track__fill {
  background: linear-gradient(90deg, #ff6b35, #f7931e) !important;
}

.lerp-time-slider .v-slider-thumb {
  background: #f7931e !important;
}

.convergence-rate-slider {
  margin: 8px 0 0 0 !important;
}

.convergence-rate-slider .v-slider-track__fill {
  background: linear-gradient(90deg, #ff6b35, #f7931e) !important;
}

.convergence-rate-slider .v-slider-thumb {
  background: #f7931e !important;
}

.preset-duration-slider {
  margin: 4px 0 0 0 !important;
}

.preset-duration-slider .v-slider-track__fill {
  background: linear-gradient(90deg, #4caf50, #8bc34a) !important;
}

.preset-duration-slider .v-slider-thumb {
  background: #4caf50 !important;
}

/* Progress indicators styles */
.convergence-progress {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
}

.convergence-progress .v-progress-linear {
  border-radius: 3px;
}

/* Enhanced preset list item styles for progress tracking */
.v-list-item {
  transition: background 0.3s ease;
  overflow: hidden;
  position: relative;
}

.v-list-item--active {
  border: 0px solid rgba(98, 0, 238, 0.5) !important;
}

/* History List Styles */
.history-list {
  max-height: calc(100vh - 257px);
  overflow-y: auto;
  overflow-y: scroll !important;
}

.history-item-current {
  border-left: 4px solid rgba(98, 0, 238, 0.8) !important;
  background: rgba(98, 0, 238, 0.1) !important;
}

.history-item-selected {
  border-left: 4px solid rgba(255, 193, 7, 0.8) !important;
  background: rgba(255, 193, 7, 0.1) !important;
}

.history-list .v-list-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-list .v-list-item:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.history-list .v-list-item-title {
  font-weight: 500;
}

.history-list .v-list-item-subtitle {
  opacity: 0.7;
  font-size: 0.75rem;
}

.history-item-current {
  background-color: rgba(33, 150, 243, 0.1) !important;
  border-left: 3px solid #2196f3;
}

.history-item-selected {
  background-color: rgba(255, 193, 7, 0.1) !important;
  border-left: 3px solid #ffc107;
}

.history-list .v-list-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.history-list .v-list-item:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

.unsaved-indicator {
  color: #ff6b35;
  font-weight: bold;
}

</style>
