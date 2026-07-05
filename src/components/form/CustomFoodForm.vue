<template>
  <div class="customfood-container">
    <h2>Eigenes Rezept / Mahlzeit anlegen</h2>
    <p>Lege ein eigenes Rezept oder eine Mahlzeit mit Nährwerten an.</p>

    <form class="customfood-form" @submit.prevent="submitProduct">
      <div class="form-group">
        <label for="name">Name des Rezepts / Mahlzeit</label>
        <input id="name" v-model="name" type="text" placeholder="z.B. Tomatensuppe" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="calories">Kalorien (kcal / 100g)</label>
          <input
            id="calories"
            v-model.number="calories"
            type="number"
            placeholder="z.B. 80"
            min="0"
            step="1"
            required
          />
        </div>

        <div class="form-group">
          <label for="protein">Protein (g / 100g)</label>
          <input
            id="protein"
            v-model.number="protein"
            type="number"
            placeholder="z.B. 2.5"
            min="0"
            step="0.1"
          />
        </div>

        <div class="form-group">
          <label for="carbs">Kohlenhydrate (g / 100g)</label>
          <input
            id="carbs"
            v-model.number="carbs"
            type="number"
            placeholder="z.B. 12"
            min="0"
            step="0.1"
          />
        </div>
      </div>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>

      <button type="submit" :disabled="isSubmitting || !name">
        {{ isSubmitting ? 'Speichern...' : 'Rezept speichern' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { API_URL } from '@/api/config'

const api = axios.create({ baseURL: API_URL })

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

  if (calories.value === null || calories.value < 0) {
    errorMessage.value = 'Bitte gib gültige Kalorien ein.'
    return
  }

  isSubmitting.value = true

  try {
    const response = await api.post('/products', {
      name: name.value.trim(),
      calories: calories.value ?? 0,
      protein: protein.value ?? 0,
      carbs: carbs.value ?? 0,
    })

    console.log('✅ Rezept gespeichert:', response.data)

    successMessage.value = '✅ Rezept erfolgreich gespeichert!'
    name.value = ''
    calories.value = null
    protein.value = null
    carbs.value = null

    setTimeout(() => {
      successMessage.value = ''
    }, 2000)
  } catch (err) {
    console.error('Fehler beim Speichern:', err)
    errorMessage.value = '❌ Fehler beim Speichern.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.customfood-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.customfood-container > p {
  color: #888;
  margin-bottom: 24px;
}

.customfood-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  margin-bottom: 4px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
  font-size: 0.95rem;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e8ecf0;
  border-radius: 10px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: all 0.2s ease;
  background: #fafbfc;
}

.form-group input:focus {
  outline: none;
  border-color: #42b883;
  background: white;
  box-shadow: 0 0 0 4px rgba(66, 184, 131, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

button {
  width: 100%;
  padding: 14px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
  box-shadow: 0 4px 16px rgba(66, 184, 131, 0.25);
}

button:hover:not(:disabled) {
  background: #35a372;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(66, 184, 131, 0.35);
}

button:disabled {
  background: #cfe8dc;
  cursor: not-allowed;
  box-shadow: none;
}

.error {
  color: #dc3545;
  text-align: center;
  margin: 8px 0;
  padding: 10px;
  background: #fde8e8;
  border-radius: 8px;
}

.success {
  color: #1e7e34;
  text-align: center;
  margin: 8px 0;
  padding: 10px;
  background: #eaf7ee;
  border-radius: 8px;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .customfood-container {
    padding: 16px;
  }

  h2 {
    font-size: 1.6rem;
  }
}
</style>
