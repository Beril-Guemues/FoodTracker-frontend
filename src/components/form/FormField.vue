<template>
  <div class="field">
    <label :for="id">{{ label }}</label>

    <select v-if="type === 'select'" :id="id" v-model="modelValueProxy" required>
      <option disabled value="">Bitte wählen</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>

    <input
      v-else
      :id="id"
      v-model="modelValueProxy"
      :type="type"
      :min="min"
      :max="max"
      :step="step"
      required
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SelectOption {
  value: string
  label: string
}

const props = defineProps<{
  id: string
  label: string
  type?: string // 'text' | 'number' | 'select' | ...
  modelValue: string | number | null
  min?: number
  max?: number
  step?: number
  options?: SelectOption[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
}>()

const modelValueProxy = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

label {
  font-weight: 600;
}

input,
select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}
</style>
