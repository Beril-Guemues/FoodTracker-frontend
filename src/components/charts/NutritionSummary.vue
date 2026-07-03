<template>
  <div class="nutrition-summary">
    <h2>Kalorienbedarf & Wasserempfehlung</h2>

    <p v-if="!profileId" class="error">
      Kein Profil gefunden. Bitte zuerst ein Profil anlegen.
    </p>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div v-if="isLoading" class="hint">Lade Daten...</div>

    <div v-if="!isLoading && calorieNeed !== null && waterNeed !== null" class="results">
      <div class="result-card">
        <span class="label">Täglicher Kalorienbedarf</span>
        <span class="value">{{ calorieNeed.toFixed(0) }} kcal</span>
      </div>

      <div class="result-card">
        <span class="label">Empfohlene Wassermenge</span>
        <span class="value">{{ waterNeed.toFixed(2) }} L</span>
      </div>
    </div>

    <button v-if="profileId" @click="loadData" :disabled="isLoading">
      {{ isLoading ? 'Lädt...' : 'Aktualisieren' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const profileId = localStorage.getItem('userProfileId')

const calorieNeed = ref<number | null>(null)
const waterNeed = ref<number | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

async function loadData() {
  if (!profileId) return

  errorMessage.value = ''
  isLoading.value = true

  try {
    const [calorieResponse, waterResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/profiles/${profileId}/calorie-need`),
      fetch(`${API_BASE_URL}/profiles/${profileId}/water-need`),
    ])

    if (!calorieResponse.ok || !waterResponse.ok) {
      throw new Error('Daten konnten nicht geladen werden.')
    }

    calorieNeed.value = await calorieResponse.json()
    waterNeed.value = await waterResponse.json()
  } catch (err) {
    errorMessage.value =
      err instanceof Error ? err.message : 'Unbekannter Fehler beim Laden.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.nutrition-summary {
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.results {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #f9f9f9;
}

.label {
  font-weight: 600;
}

.value {
  color: #42b883;
  font-weight: 700;
  font-size: 1.1rem;
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

.hint {
  font-size: 0.85rem;
  color: #888;
}
</style>
