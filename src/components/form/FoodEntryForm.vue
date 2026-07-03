<template>
  <form class="foodentry-form" @submit.prevent="submitEntry">
    <h2>Menge eintragen</h2>

    <div class="field">
      <label for="productSearch">Produkt suchen</label>
      <input
        id="productSearch"
        v-model="search"
        type="text"
        placeholder="z.B. Apfel"
        @input="selectedProductId = null"
      />
    </div>

    <div class="field">
      <label for="productSelect">Produkt auswählen</label>
      <select id="productSelect" v-model.number="selectedProductId" required>
        <option disabled :value="null">Bitte wählen</option>
        <option v-for="product in filteredProducts" :key="product.id" :value="product.id">
          {{ product.name }} ({{ product.calories }} kcal / 100g)
        </option>
      </select>
      <p v-if="filteredProducts.length === 0" class="hint">
        Kein Produkt gefunden. Über "Eigene Lebensmittel eintragen" kannst du es anlegen.
      </p>
    </div>

    <FormField
      id="amount"
      label="Menge (Stück oder Gramm)"
      type="number"
      v-model="amount"
      :min="0.1"
      :step="0.1"
    />

    <FormField id="date" label="Datum" type="date" v-model="date" />

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>

    <button type="submit" :disabled="isSubmitting || !selectedProductId">
      {{ isSubmitting ? 'Speichern...' : 'Eintrag speichern' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import FormField from '../shared/FormField.vue'

interface Product {
  id: number
  name: string
  calories: number
  protein: number
  carbs: number
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const products = ref<Product[]>([])
const search = ref('')
const selectedProductId = ref<number | null>(null)
const amount = ref<number | null>(null)
const date = ref<string>(new Date().toISOString().slice(0, 10)) // heute, YYYY-MM-DD

const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const filteredProducts = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return products.value
  return products.value.filter((p) => p.name.toLowerCase().includes(term))
})

onMounted(async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`)
    if (!response.ok) throw new Error('Produkte konnten nicht geladen werden.')
    products.value = await response.json()
  } catch (err) {
    errorMessage.value =
      err instanceof Error ? err.message : 'Fehler beim Laden der Produkte.'
  }
})

async function submitEntry() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!selectedProductId.value || !amount.value) {
    errorMessage.value = 'Bitte Produkt und Menge angeben.'
    return
  }

  isSubmitting.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/foodentries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product: { id: selectedProductId.value },
        amount: amount.value,
        date: date.value,
      }),
    })

    if (!response.ok) {
      throw new Error(`Fehler beim Speichern (Status ${response.status})`)
    }

    successMessage.value = 'Eintrag erfolgreich gespeichert!'
    selectedProductId.value = null
    amount.value = null
    search.value = ''
  } catch (err) {
    errorMessage.value =
      err instanceof Error ? err.message : 'Unbekannter Fehler beim Speichern.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.foodentry-form {
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

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

.hint {
  font-size: 0.85rem;
  color: #888;
}
</style>
