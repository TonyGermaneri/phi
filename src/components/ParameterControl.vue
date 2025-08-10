<template>
  <div class="parameter-control">
    <v-divider class="my-4"></v-divider>
    <!-- Switch input for boolean values -->
    <div v-if="inputType === 'select'" class="switch-control ml-2">
      <v-select
        :model-value="modelValue"
        :label="title"
        :hint="description"
        :items="options"
        persistent-hint
        color="primary"
        @update:model-value="$emit('update:modelValue', $event)"
      >

      </v-select>
    </div>
    <div v-else-if="inputType === 'switch'" class="switch-control ml-2">
      <v-switch
        :model-value="modelValue"
        :label="title"
        :hint="description"
        persistent-hint
        color="primary"
        @update:model-value="$emit('update:modelValue', $event)"
      ></v-switch>
    </div>

    <!-- Regular slider and text field for numeric values -->
    <div v-else class="slider-control ml-2">
      <v-slider
        :model-value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        thumb-label
        :label="title"
        :hint="description"
        persistent-hint
        class="pl-4 mt-2 d-inline-block w-66 ma-0"
        @update:model-value="$emit('update:modelValue', $event)"
      ></v-slider>
      <v-text-field
        :model-value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        density="compact"
        hide-details
        class="d-inline-block w-33 mx-0 pl-4"
        @update:model-value="$emit('update:modelValue', parseFloat($event) || 0)"
      ></v-text-field>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ParameterControl',
  props: {
    modelValue: [Number, Boolean],
    title: String,
    description: String,
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 0.1 },
    inputType: { type: String, default: 'slider' },
    options: { type: Object, default: [] },
  },
  emits: ['update:modelValue']
});
</script>
