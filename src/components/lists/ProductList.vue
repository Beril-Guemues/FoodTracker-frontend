<template>
  <div class="product-list-container">
    <div class="form-container">
      <h3>🔍 Produkt suchen</h3>
      <div class="search-group">
        <input v-model="searchQuery" type="text" placeholder="z.B. Banane" @keyup.enter="searchProduct" />
        <button @click="searchProduct" class="btn-search">Suchen</button>
      </div>

      <div v-if="searchResults.length > 0" class="search-results">
        <p><strong>Ergebnisse:</strong></p>
        <ul>
          <li v-for="result in searchResults" :key="result.code" @click="selectProduct(result)" class="result-item">
            {{ result.product_name }}
            <span v-if="result.nutriments">
              ({{ Math.round(result.nutriments['energy-kcal_100g']) }} kcal/100g)
            </span>
          </li>
        </ul>
      </div>

      <div v-if="newProduct.name" class="selected-product">
        <h3>➕ Produkt hinzufügen</h3>
        <div class="form-group">
          <label>Produktname:</label>
          <input v-model="newProduct.name" type="text" />
        </div>
        <div class="form-group">
          <label>Kalorien (kcal):</label>
          <input v-model.number="newProduct.calories" type="number" />
        </div>
        <div class="form-group">
          <label>Protein (g):</label>
          <input v-model.number="newProduct.protein" type="number" />
        </div>
        <div class="form-group">
          <label>Kohlenhydrate (g):</label>
          <input v-model.number="newProduct.carbs" type="number" />
        </div>
        <button @click="saveProduct" class="btn-submit">In Datenbank speichern</button>
      </div>
    </div>

    <h2>🍽️ Meine Produkte</h2>
    <ul v-if="products.length > 0">
      <li v-for="product in products" :key="product.id">
        <strong>{{ product.name }}</strong> - {{ product.calories }} kcal |
        Protein: {{ product.protein }}g | Carbs: {{ product.carbs }}g
      </li>
    </ul>
    <p v-else class="empty-message">Noch keine Produkte gespeichert.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const products = ref([])
const searchQuery = ref('')
const searchResults = ref([])
const newProduct = ref({
  name: '',
  calories: 0,
  protein: 0.0,
  carbs: 0.0
})

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`

const searchProduct = async () => {
  if (!searchQuery.value) return
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchQuery.value)}&search_simple=1&action=process&json=1&page_size=5&lc=de`
    )
    const data = await response.json()
    searchResults.value = data.products.filter(p => p.product_name && p.nutriments)
  } catch (error) {
    console.error('Fehler bei der Suche:', error)
  }
}

const selectProduct = (result) => {
  newProduct.value = {
    name: result.product_name,
    calories: Math.round(result.nutriments['energy-kcal_100g'] || 0),
    protein: Math.round((result.nutriments['proteins_100g'] || 0) * 10) / 10,
    carbs: Math.round((result.nutriments['carbohydrates_100g'] || 0) * 10) / 10
  }
  searchResults.value = []
  searchQuery.value = ''
}

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
.search-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.search-group input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.btn-search {
  background-color: #007bff;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-search:hover { background-color: #0056b3; }
.search-results {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}
.result-item {
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  list-style: none;
}
.result-item:hover { background-color: #e9ecef; }
.selected-product { margin-top: 15px; }
.form-group { margin-bottom: 10px; }
label { display: block; font-weight: bold; margin-bottom: 5px; }
input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}
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
li {
  background: #f5f5f5;
  margin: 10px 0;
  padding: 12px;
  border-radius: 8px;
  text-align: left;
}
.empty-message { color: #777; font-style: italic; }
</style>
