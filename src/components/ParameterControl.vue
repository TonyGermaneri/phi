<template>
  <v-divider class="my-4"></v-divider>
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
    class="d-inline-block w-33 mx-0 pl-2"
    @update:model-value="$emit('update:modelValue', parseFloat($event) || 0)"
  ></v-text-field>
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
