<template>
  <v-slider
    :model-value="modelValue"
    :min="min"
    :max="max"
    :step="step"
    thumb-label
    :label="title"
    :hint="description"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template v-slot:append>
      <v-text-field
        :model-value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        type="number"
        variant="outlined"
        density="compact"
        hide-details
        @update:model-value="$emit('update:modelValue', parseFloat($event) || 0)"
      ></v-text-field>
    </template>
  </v-slider>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ParameterControl',
  props: {
    modelValue: Number,
    title: String,
    description: String,
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 0.1 }
  },
  emits: ['update:modelValue']
});
</script>
