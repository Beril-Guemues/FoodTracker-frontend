<template>
  <div class="product-list-container">
    <div class="form-container">
      <h3>➕ Neues Produkt hinzufügen</h3>
      <form @submit.prevent="saveProduct">
        <div class="form-group">
          <label>Produktname:</label>
          <input v-model="newProduct.name" type="text" placeholder="z.B. Banane" required />
        </div>
        <div class="form-group">
          <label>Kalorien (kcal):</label>
          <input v-model.number="newProduct.calories" type="number" placeholder="z.B. 89" required />
        </div>
        <div class="form-group">
          <label>Protein (g):</label>
          <input v-model.number="newProduct.protein" type="number" placeholder="z.B. 1.1" required />
        </div>
        <div class="form-group">
          <label>Kohlenhydrate (g):</label>
          <input v-model.number="newProduct.carbs" type="number" placeholder="z.B. 23" required />
        </div>
        <button type="submit" class="btn-submit">In Datenbank speichern</button>
      </form>
    </div>

    <h2>🍽️ Meine Produkte</h2>
    <ul v-if="products.length > 0">
      <li v-for="product in products" :key="product.id">
        <strong>{{ product.name }}</strong> - {{ product.calories }} kcal |
        Protein: {{ product.protein }}g | Carbs: {{ product.carbs }}g
      </li>
    </ul>
    <p v-else class="empty-message">Lade Produkte...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const products = ref([])
const newProduct = ref({
  name: '',
  calories: 0,
  protein: 0.0,
  carbs: 0.0
})

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`

const loadProducts = async () => {
  try {
    const response = await fetch(`${baseUrl}products`)
    if (response.ok) {
      products.value = await response.json()
    }
  } catch (error) {
    console.error('Fehler beim Laden:', error)
  }
}

const saveProduct = async () => {
  try {
    const response = await fetch(`${baseUrl}products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct.value)
    })
    if (response.ok) {
      alert('Erfolgreich gespeichert!')
      newProduct.value = { name: '', calories: 0, protein: 0.0, carbs: 0.0 }
      await loadProducts()
    } else {
      alert('Fehler beim Speichern.')
    }
  } catch (error) {
    console.error('Verbindungsfehler:', error)
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.product-list-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}
.form-container {
  background: #f9f9f9;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: left;
}
.form-group { margin-bottom: 10px; }
label { display: block; font-weight: bold; margin-bottom: 5px; }
input { width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
.btn-submit {
  background-color: #218838;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  margin-top: 10px;
}
.btn-submit:hover { background-color: #1e7e34; }
ul { list-style: none; padding: 0; }
li { background: #f5f5f5; margin: 10px 0; padding: 12px; border-radius: 8px; text-align: left; }
.empty-message { color: #777; font-style: italic; }
</style>
