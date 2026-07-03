<template>
  <form class="customfood-form" @submit.prevent="submitProduct">
    <h2>Eigenes Lebensmittel eintragen</h2>

    <FormField
      id="name"
      label="Name des Lebensmittels"
      type="text"
      v-model="name"
    />

    <FormField
      id="calories"
      label="Kalorien (kcal pro 100g)"
      type="number"
      v-model="calories"
      :min="0"
      :step="1"
    />

    <FormField
      id="protein"
      label="Protein (g pro 100g)"
      type="number"
      v-model="protein"
      :min="0"
      :step="0.1"
    />

    <FormField
      id="carbs"
      label="Kohlenhydrate (g pro 100g)"
      type="number"
      v-model="carbs"
      :min="0"
      :step="0.1"
    />

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>

    <button type="submit" :disabled="isSubmitting || !name">
      {{ isSubmitting ? 'Speichern...' : 'Lebensmittel speichern' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FormField from '@/components/FormField.vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const name = ref<string>('')
const calories = ref<number | null>(null)
const protein = ref<number | null>(null)
const carbs = ref<number | null>(null)

const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function submitProduct() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!name.value.trim()) {
    errorMessage.value = 'Bitte einen Namen angeben.'
    return
  }

  isSubmitting.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value.trim(),
        calories: calories.value ?? 0,
        protein: protein.value ?? 0,
        carbs: carbs.value ?? 0,
      }),
    })

    if (!response.ok) {
      throw new Error(`Fehler beim Speichern (Status ${response.status})`)
    }

    successMessage.value = 'Lebensmittel erfolgreich gespeichert!'
    name.value = ''
    calories.value = null
    protein.value = null
    carbs.value = null
  } catch (err) {
    errorMessage.value =
      err instanceof Error ? err.message : 'Unbekannter Fehler beim Speichern.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.customfood-form {
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

button {
  padding: 0.6rem 1rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:disabled {
  background-color: #a0d9c1;
  cursor: not-allowed;
}

.error {
  color: #d33;
}

.success {
  color: #2a2;
}
</style>
