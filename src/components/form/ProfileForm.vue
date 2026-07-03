<template>
  <form class="profile-form" @submit.prevent="submitProfile">
    <h2>Profil anlegen</h2>

    <FormField
      id="weight"
      label="Gewicht (kg)"
      type="number"
      v-model="profile.weight"
      :min="1"
      :step="0.1"
    />

    <FormField
      id="gender"
      label="Geschlecht"
      type="select"
      v-model="profile.gender"
      :options="[
        { value: 'male', label: 'Männlich' },
        { value: 'female', label: 'Weiblich' },
      ]"
    />

    <FormField
      id="age"
      label="Alter"
      type="number"
      v-model="profile.age"
      :min="1"
      :max="120"
    />

    <FormField
      id="height"
      label="Größe (cm)"
      type="number"
      v-model="profile.height"
      :min="1"
      :step="0.1"
    />

    <FormField
      id="targetWeight"
      label="Traumgewicht (kg)"
      type="number"
      v-model="profile.targetWeight"
      :min="1"
      :step="0.1"
    />

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>

    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Speichern...' : 'Profil speichern' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import FormField from '../shared/FormField.vue'

interface UserProfile {
  weight: number | null
  gender: string
  age: number | null
  height: number | null
  targetWeight: number | null
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const profile = reactive<UserProfile>({
  weight: null,
  gender: '',
  age: null,
  height: null,
  targetWeight: null,
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function submitProfile() {
  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })

    if (!response.ok) {
      throw new Error(`Fehler beim Speichern (Status ${response.status})`)
    }

    const savedProfile = await response.json()
    if (savedProfile?.id) {
      localStorage.setItem('userProfileId', String(savedProfile.id))
    }

    successMessage.value = 'Profil erfolgreich gespeichert!'
  } catch (err) {
    errorMessage.value =
      err instanceof Error ? err.message : 'Unbekannter Fehler beim Speichern.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.profile-form {
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
