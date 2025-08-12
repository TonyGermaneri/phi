<template>
  <div class="parameter-control">
    <v-divider class="my-0"></v-divider>
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
    <div v-else-if="inputType === 'switch'" class="switch-control ml-7">
      <v-switch
        :model-value="modelValue"
        :label="title"
        :hint="description"
        persistent-hint
        color="primary"
        @update:model-value="$emit('update:modelValue', $event)"
      ></v-switch>
    </div>
    <div v-else class="slider-control ml-2" @dblclick.stop="$emit('update:modelValue', defaultValue)">
      <v-slider
        :model-value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        thumb-label
        :hint="description"
        persistent-hint
        class="pl-6 mt-2 d-inline-block ma-0"
        style="width: 90%"
        @update:model-value="$emit('update:modelValue', $event)"
      >
        <template v-slot:label>
          <div class="w-66 mx-0">{{ title + ': ' + modelValue.toFixed(Math.min(modelValue.toString().length, 4)) }}</div>
          <div class="w-33 mx-0 text-right"><slot></slot></div></template>
      </v-slider>
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
    defaultValue: { type: Number, default: 0 },
    options: { type: Object, default: [] },
  },
  emits: ['update:modelValue']
});
</script>
