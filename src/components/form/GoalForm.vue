<template>
  <form class="goal-form" @submit.prevent="submitGoal">
    <h2>Ziel anlegen</h2>

    <FormField
      id="goalType"
      label="Was ist dein Ziel?"
      type="select"
      v-model="goalType"
      :options="[
        { value: 'abnehmen', label: 'Abnehmen' },
        { value: 'zunehmen', label: 'Zunehmen' },
        { value: 'muskeln_aufbauen', label: 'Muskeln aufbauen' },
        { value: 'gesund_ernaehren', label: 'Gesund ernähren' },
      ]"
    />

    <p v-if="!profileId" class="error">
      Kein Profil gefunden. Bitte zuerst ein Profil anlegen.
    </p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>

    <button type="submit" :disabled="isSubmitting || !profileId">
      {{ isSubmitting ? 'Speichern...' : 'Ziel speichern' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FormField from '../shared/FormField.vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const goalType = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Angelegtes Profil wird von ProfileForm.vue in localStorage gespeichert
const profileId = localStorage.getItem('userProfileId')

async function submitGoal() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!profileId) {
    errorMessage.value = 'Kein Profil gefunden. Bitte zuerst ein Profil anlegen.'
    return
  }

  isSubmitting.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: goalType.value,
        userProfile: { id: Number(profileId) },
      }),
    })

    if (!response.ok) {
      throw new Error(`Fehler beim Speichern (Status ${response.status})`)
    }

    successMessage.value = 'Ziel erfolgreich gespeichert!'
  } catch (err) {
    errorMessage.value =
      err instanceof Error ? err.message : 'Unbekannter Fehler beim Speichern.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.goal-form {
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

