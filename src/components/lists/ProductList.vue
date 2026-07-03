<template>
  <div class="product-list-container">
    <!-- ===== PRODUKTSUCHE ===== -->
    <div class="form-container">
      <h3>Produkt suchen</h3>

      <div class="search-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="z.B. Banane"
          @input="searchProducts"
        />
        <button @click="searchProducts" class="btn-search" :disabled="isSearching">
          {{ isSearching ? 'Suche...' : 'Suchen' }}
        </button>
      </div>

      <!-- Suchergebnisse (eigene Datenbank) -->
      <div v-if="searchResults.length > 0" class="search-results">
        <p><strong>Ergebnisse aus deiner Datenbank:</strong></p>
        <div
          v-for="product in searchResults"
          :key="product.id"
          class="result-item"
          @click="selectProduct(product)"
        >
          <span class="product-name">{{ product.name }}</span>
          <span class="product-calories">{{ product.calories }} kcal / 100g</span>
        </div>
      </div>

      <!-- Keine Ergebnisse → OpenFoodFacts -->
      <div v-if="searchQuery && searchResults.length === 0 && !isSearching && !offResults.length" class="no-results">
        <p>Kein Produkt in deiner Datenbank gefunden.</p>
        <button @click="searchOpenFoodFacts" class="btn-off">In OpenFoodFacts suchen</button>
      </div>

      <!-- OpenFoodFacts Ergebnisse -->
      <div v-if="offResults.length > 0" class="search-results">
        <p><strong>Ergebnisse aus OpenFoodFacts:</strong></p>
        <div
          v-for="result in offResults"
          :key="result.code"
          class="result-item"
          @click="selectOffProduct(result)"
        >
          <span class="product-name">{{ result.product_name }}</span>
          <span class="product-calories" v-if="result.nutriments">
            {{ Math.round(result.nutriments['energy-kcal_100g']) }} kcal / 100g
          </span>
        </div>
      </div>
    </div>

    <!-- ===== AUSGEWÄHLTES PRODUKT ===== -->
    <div v-if="selectedProduct" class="selected-product">
      <h3>Produkt hinzufügen</h3>

      <div class="form-group">
        <label>Produktname</label>
        <input v-model="selectedProduct.name" type="text" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Kalorien (kcal)</label>
          <input v-model.number="selectedProduct.calories" type="number" />
        </div>

        <div class="form-group">
          <label>Protein (g)</label>
          <input v-model.number="selectedProduct.protein" type="number" step="0.1" />
        </div>

        <div class="form-group">
          <label>Kohlenhydrate (g)</label>
          <input v-model.number="selectedProduct.carbs" type="number" step="0.1" />
        </div>
      </div>

      <button @click="saveProduct" class="btn-save">In Datenbank speichern</button>
      <button @click="cancelSelection" class="btn-cancel">Abbrechen</button>
    </div>

    <!-- ===== MEINE PRODUKTE ===== -->
    <h2>Meine Produkte</h2>

    <div v-if="isLoading" class="hint">Lade Produkte...</div>

    <ul v-if="!isLoading && products.length > 0">
      <li v-for="product in products" :key="product.id">
        <strong>{{ product.name }}</strong>
        <span>{{ product.calories }} kcal</span>
        <span>Protein: {{ product.protein }}g</span>
        <span>Carbs: {{ product.carbs }}g</span>
        <button @click="deleteProduct(product.id)" class="btn-delete">X</button>
      </li>
    </ul>

    <p v-if="!isLoading && products.length === 0" class="empty-message">
      Keine Produkte gespeichert.
    </p>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// ===== API =====
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

interface Product {
  id: number
  name: string
  calories: number
  protein: number
  carbs: number
}

interface OffProduct {
  code: string
  product_name: string
  nutriments?: {
    'energy-kcal_100g'?: number
    'proteins_100g'?: number
    'carbohydrates_100g'?: number
  }
}

// ===== STATE =====
const products = ref<Product[]>([])
const searchQuery = ref('')
const searchResults = ref<Product[]>([])
const offResults = ref<OffProduct[]>([])
const selectedProduct = ref<Product | null>(null)
const isLoading = ref(false)
const isSearching = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// ===== PRODUKTE LADEN =====
async function loadProducts() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(`${API_URL}/products`)
    if (!response.ok) throw new Error('Fehler beim Laden')
    products.value = await response.json()
  } catch {
    errorMessage.value = 'Produkte konnten nicht geladen werden.'
    products.value = []
  } finally {
    isLoading.value = false
  }
}

// ===== PRODUKTE SUCHEN (eigene DB) =====
async function searchProducts() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    offResults.value = []
    return
  }

  isSearching.value = true
  offResults.value = []
  errorMessage.value = ''

  try {
    const response = await fetch(
      `${API_URL}/products/search?q=${encodeURIComponent(searchQuery.value)}`
    )
    if (!response.ok) throw new Error('Suche fehlgeschlagen')
    searchResults.value = await response.json()
  } catch {
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

// ===== OPENFOODFACTS SUCHEN =====
async function searchOpenFoodFacts() {
  if (!searchQuery.value.trim()) return

  isSearching.value = true

  try {
    const response = await fetch(
      `https://de.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchQuery.value)}&search_simple=1&action=process&json=1&page_size=5`
    )
    const data = await response.json()
    offResults.value = data.products.filter(
      (p: OffProduct) => p.product_name && p.nutriments
    )
  } catch {
    errorMessage.value = 'OpenFoodFacts-Suche fehlgeschlagen.'
    offResults.value = []
  } finally {
    isSearching.value = false
  }
}

// ===== PRODUKT AUSWÄHLEN =====
function selectProduct(product: Product) {
  selectedProduct.value = { ...product }
  searchResults.value = []
  searchQuery.value = ''
}

function selectOffProduct(result: OffProduct) {
  selectedProduct.value = {
    id: Date.now(),
    name: result.product_name || '',
    calories: Math.round(result.nutriments?.['energy-kcal_100g'] || 0),
    protein: Math.round((result.nutriments?.['proteins_100g'] || 0) * 10) / 10,
    carbs: Math.round((result.nutriments?.['carbohydrates_100g'] || 0) * 10) / 10,
  }
  offResults.value = []
  searchQuery.value = ''
}

// ===== PRODUKT SPEICHERN =====
async function saveProduct() {
  if (!selectedProduct.value || !selectedProduct.value.name.trim()) {
    errorMessage.value = 'Bitte einen Namen eingeben.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: selectedProduct.value.name.trim(),
        calories: selectedProduct.value.calories || 0,
        protein: selectedProduct.value.protein || 0,
        carbs: selectedProduct.value.carbs || 0,
      }),
    })

    if (!response.ok) throw new Error('Fehler beim Speichern')

    successMessage.value = 'Produkt gespeichert!'
    selectedProduct.value = null
    await loadProducts()

    setTimeout(() => {
      successMessage.value = ''
    }, 2000)
  } catch {
    errorMessage.value = 'Fehler beim Speichern.'
  } finally {
    isLoading.value = false
  }
}

// ===== PRODUKT LÖSCHEN =====
async function deleteProduct(id: number) {
  if (!confirm('Produkt wirklich löschen?')) return

  isLoading.value = true

  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Fehler beim Löschen')
    await loadProducts()
  } catch {
    errorMessage.value = 'Fehler beim Löschen.'
  } finally {
    isLoading.value = false
  }
}

// ===== ABBRECHEN =====
function cancelSelection() {
  selectedProduct.value = null
  offResults.value = []
  searchResults.value = []
  searchQuery.value = ''
}

// ===== INIT =====
onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.product-list-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* ===== FORMULAR ===== */
.form-container {
  background: #f8fafc;
  border: 1px solid #eef2f6;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.form-container h3 {
  margin-bottom: 16px;
  color: #1a1a2e;
}

.search-group {
  display: flex;
  gap: 10px;
}

.search-group input {
  flex: 1;
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.search-group input:focus {
  outline: none;
  border-color: #42b883;
}

.btn-search {
  padding: 10px 24px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-search:hover {
  background: #35a372;
}

.btn-search:disabled {
  background: #a0d9c1;
  cursor: not-allowed;
}

.btn-off {
  padding: 8px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 8px;
}

.btn-off:hover {
  background: #5a6268;
}

/* ===== SEARCH RESULTS ===== */
.search-results {
  margin-top: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.result-item {
  padding: 10px 14px;
  background: white;
  border: 1px solid #eef2f6;
  border-radius: 8px;
  margin-bottom: 6px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  transition: all 0.2s;
}

.result-item:hover {
  border-color: #42b883;
  background: #f0faf5;
}

.product-name {
  font-weight: 600;
}

.product-calories {
  color: #888;
  font-size: 0.9rem;
}

.no-results {
  text-align: center;
  padding: 12px;
  color: #888;
}

/* ===== SELECTED PRODUCT ===== */
.selected-product {
  background: #e8f5ef;
  border: 2px solid #42b883;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.selected-product h3 {
  margin-bottom: 16px;
  color: #1a1a2e;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 4px;
}

.form-group input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #42b883;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.btn-save {
  width: 100%;
  padding: 12px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 8px;
}

.btn-save:hover {
  background: #35a372;
}

.btn-cancel {
  width: 100%;
  padding: 10px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 6px;
}

.btn-cancel:hover {
  background: #c82333;
}

/* ===== PRODUCT LIST ===== */
ul {
  list-style: none;
  padding: 0;
}

li {
  background: white;
  border: 1px solid #eef2f6;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

li strong {
  flex: 1;
  min-width: 100px;
}

li span {
  color: #555;
  font-size: 0.9rem;
}

.btn-delete {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-delete:hover {
  background: #c82333;
}

.empty-message {
  text-align: center;
  color: #888;
  padding: 40px 0;
}

.hint {
  text-align: center;
  color: #888;
  padding: 20px 0;
}

.success {
  color: #28a745;
  text-align: center;
  margin-top: 8px;
}

.error {
  color: #dc3545;
  text-align: center;
  margin-top: 8px;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .search-group {
    flex-direction: column;
  }

  li {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
