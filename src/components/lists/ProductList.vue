<template>
  <div class="product-list-container">
    <h2>Lebensmittel suchen</h2>
    <p>Suche in der OpenFoodFacts-Datenbank.</p>

    <!-- ===== SUCHLEISTE ===== -->
    <div class="search-section">
      <div class="search-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="z.B. Banane"
          @input="searchProducts"
        />
        <button @click="searchProducts" class="btn-search">🔍 Suchen</button>
      </div>

      <!-- ===== SUCHEIGENISSE ===== -->
      <div v-if="searchResults.length > 0" class="search-results">
        <h3>Suchergebnisse</h3>
        <div
          v-for="product in searchResults"
          :key="product.code"
          class="result-item"
          @click="selectProduct(product)"
        >
          <div class="result-info">
            <span class="product-name">{{ product.product_name || 'Unbekannt' }}</span>
            <span class="product-calories" v-if="product.nutriments">
              {{ Math.round(product.nutriments['energy-kcal_100g'] || 0) }} kcal / 100g
            </span>
            <span class="product-detail" v-if="product.nutriments">
              Protein: {{ (product.nutriments['proteins_100g'] || 0).toFixed(1) }}g
            </span>
            <span class="product-detail" v-if="product.nutriments">
              Carbs: {{ (product.nutriments['carbohydrates_100g'] || 0).toFixed(1) }}g
            </span>
          </div>
          <span class="select-hint">👆 Klicken zum Hinzufügen</span>
        </div>
      </div>

      <div v-if="searchQuery && searchResults.length === 0 && !isSearching" class="no-results">
        <p>Kein Produkt gefunden.</p>
      </div>
    </div>

    <!-- ===== AUSGEWÄHLTES PRODUKT ===== -->
    <div v-if="selectedProduct" class="selected-product">
      <h3>Produkt hinzufügen</h3>
      <div class="product-info">
        <span class="product-name">{{ selectedProduct.product_name }}</span>
        <span class="product-calories" v-if="selectedProduct.nutriments">
          {{ Math.round(selectedProduct.nutriments['energy-kcal_100g'] || 0) }} kcal / 100g
        </span>
        <span class="product-nutrition" v-if="selectedProduct.nutriments">
          Protein: {{ (selectedProduct.nutriments['proteins_100g'] || 0).toFixed(1) }}g |
          Carbs: {{ (selectedProduct.nutriments['carbohydrates_100g'] || 0).toFixed(1) }}g
        </span>
      </div>

      <div class="entry-form">
        <div class="form-row">
          <div class="form-group">
            <label>Menge (g)</label>
            <input v-model.number="amount" type="number" placeholder="z.B. 150" min="1" required />
          </div>
          <div class="form-group">
            <label>Datum</label>
            <input v-model="date" type="date" required />
          </div>
        </div>

        <div class="calculated-values">
          <span>{{ calculatedCalories }} kcal</span>
          <span>{{ calculatedProtein }} g Protein</span>
          <span>{{ calculatedCarbs }} g Carbs</span>
        </div>

        <div class="button-row">
          <button @click="saveEntry" :disabled="!amount || amount <= 0" class="btn-track">
            Eintrag speichern
          </button>
          <button @click="cancelSelection" class="btn-cancel">Abbrechen</button>
        </div>
      </div>
    </div>

    <!-- ===== HEUTIGE EINTRÄGE ===== -->
    <div class="today-entries">
      <h3>Heutige Einträge</h3>

      <div v-if="todayEntries.length === 0" class="empty-state">
        <p>Noch keine Einträge für heute.</p>
      </div>

      <div v-else>
        <div v-for="entry in todayEntries" :key="entry.id" class="entry-item">
          <span class="entry-name">{{ entry.product.name }}</span>
          <span class="entry-amount">{{ entry.amount }} g</span>
          <span class="entry-calories">{{ calculateEntryCalories(entry) }} kcal</span>
          <button @click="deleteEntry(entry.id)" class="btn-delete">✕</button>
        </div>

        <div class="daily-total">
          <span>📊 Heute insgesamt:</span>
          <span>{{ dailyTotalCalories }} kcal</span>
          <span>{{ dailyTotalProtein }} g Protein</span>
          <span>{{ dailyTotalCarbs }} g Carbs</span>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { API_URL } from '@/api/config'

const api = axios.create({ baseURL: API_URL })

// ===== TYPES =====
interface OffProduct {
  code: string
  product_name: string
  nutriments?: {
    'energy-kcal_100g'?: number
    'proteins_100g'?: number
    'carbohydrates_100g'?: number
  }
}

interface Product {
  id: number
  name: string
  calories: number
  protein: number
  carbs: number
}

interface FoodEntry {
  id: number
  product: Product
  amount: number
  date: string
}

// ===== STATE =====
const searchQuery = ref('')
const searchResults = ref<OffProduct[]>([])
const isSearching = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const selectedProduct = ref<OffProduct | null>(null)
const amount = ref<number | null>(null)
const date = ref<string>(new Date().toISOString().split('T')[0] ?? '')
const todayEntries = ref<FoodEntry[]>([])

// ===== OPENFOODFACTS SUCHEN =====
async function searchProducts() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isSearching.value = true

  try {
    const response = await api.get('/api/proxy/openfoodfacts', {
      params: { query: searchQuery.value }
    })

    const data = response.data
    searchResults.value = data.products?.filter(
      (p: OffProduct) => p.product_name && p.nutriments
    ) || []
  } catch {
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

// ===== PRODUKT AUSWÄHLEN =====
function selectProduct(product: OffProduct) {
  console.log('🟢 Produkt ausgewählt:', product.product_name)
  selectedProduct.value = product
  amount.value = null
  errorMessage.value = ''
  successMessage.value = ''
  searchResults.value = []
  searchQuery.value = ''
}

// ===== ABBRECHEN =====
function cancelSelection() {
  selectedProduct.value = null
  amount.value = null
  errorMessage.value = ''
  successMessage.value = ''
}

// ===== BERECHNUNGEN =====
const calculatedCalories = computed(() => {
  if (!selectedProduct.value || !amount.value) return 0
  const calories = selectedProduct.value.nutriments?.['energy-kcal_100g'] || 0
  return Math.round((amount.value / 100) * calories)
})

const calculatedProtein = computed(() => {
  if (!selectedProduct.value || !amount.value) return 0
  const protein = selectedProduct.value.nutriments?.['proteins_100g'] || 0
  return Math.round((amount.value / 100) * protein * 10) / 10
})

const calculatedCarbs = computed(() => {
  if (!selectedProduct.value || !amount.value) return 0
  const carbs = selectedProduct.value.nutriments?.['carbohydrates_100g'] || 0
  return Math.round((amount.value / 100) * carbs * 10) / 10
})

// ===== EINTRÄGE LADEN =====
async function loadEntriesForDate() {
  try {
    const response = await api.get<FoodEntry[]>('/foodentries/date', {
      params: { date: date.value },
    })
    todayEntries.value = response.data
  } catch {
    errorMessage.value = 'Einträge konnten nicht geladen werden.'
  }
}

async function saveEntry() {
  console.log('🟢 saveEntry() wurde aufgerufen!')
  errorMessage.value = ''
  successMessage.value = ''

  if (!selectedProduct.value || !amount.value || amount.value <= 0) {
    errorMessage.value = 'Bitte Menge angeben.'
    return
  }

  try {
    // 1. Produkt speichern
    const productData = {
      name: selectedProduct.value.product_name || '',
      calories: Math.round(selectedProduct.value.nutriments?.['energy-kcal_100g'] || 0),
      protein: Math.round((selectedProduct.value.nutriments?.['proteins_100g'] || 0) * 10) / 10,
      carbs: Math.round((selectedProduct.value.nutriments?.['carbohydrates_100g'] || 0) * 10) / 10,
    }
    console.log('📤 Sende Produkt:', JSON.stringify(productData, null, 2))

    const productResponse = await api.post('/products', productData)
    const savedProduct = productResponse.data
    console.log('✅ Produkt gespeichert:', savedProduct)

    // 2. FoodEntry speichern (KOMPLETTES Produkt!)
    const entryData = {
      product: savedProduct,  // ← KOMPLETTES Produkt!
      amount: amount.value,
      date: date.value,
    }
    console.log('📤 Sende FoodEntry:', JSON.stringify(entryData, null, 2))

    await api.post('/foodentries', entryData)

    successMessage.value = '✅ Eintrag erfolgreich gespeichert!'
    selectedProduct.value = null
    amount.value = null

    await loadEntriesForDate()

    setTimeout(() => {
      successMessage.value = ''
    }, 2000)
  } catch (error: any) {
    console.error('❌ Fehler:', error.response?.data || error.message)
    console.error('❌ Status:', error.response?.status)
    errorMessage.value = '❌ Eintrag konnte nicht gespeichert werden.'
  }
}

// ===== EINTRAG LÖSCHEN =====
async function deleteEntry(id: number) {
  try {
    await api.delete(`/foodentries/${id}`)
    await loadEntriesForDate()
  } catch {
    errorMessage.value = 'Eintrag konnte nicht gelöscht werden.'
  }
}

// ===== HELPER =====
function calculateEntryCalories(entry: FoodEntry): number {
  return Math.round((entry.amount / 100) * entry.product.calories)
}

// ===== TAGES-TOTALS =====
const dailyTotalCalories = computed(() => {
  return todayEntries.value.reduce((sum, e) => {
    return sum + Math.round((e.amount / 100) * e.product.calories)
  }, 0)
})

const dailyTotalProtein = computed(() => {
  return todayEntries.value.reduce((sum, e) => {
    return sum + Math.round((e.amount / 100) * e.product.protein * 10) / 10
  }, 0)
})

const dailyTotalCarbs = computed(() => {
  return todayEntries.value.reduce((sum, e) => {
    return sum + Math.round((e.amount / 100) * e.product.carbs * 10) / 10
  }, 0)
})

// ===== WATCH =====
watch(date, () => {
  loadEntriesForDate()
})

// ===== INIT =====
onMounted(() => {
  loadEntriesForDate()
})
</script>

<style scoped>
.product-list-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.product-list-container > p {
  color: #888;
  margin-bottom: 24px;
}

.search-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #eef2f6;
  margin-bottom: 24px;
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
  padding: 10px 20px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.btn-search:hover {
  background: #35a372;
}

.search-results {
  margin-top: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.search-results h3 {
  margin-bottom: 8px;
  font-size: 1.1rem;
  color: #1a1a2e;
}

.result-item {
  padding: 10px 14px;
  background: white;
  border: 1px solid #eef2f6;
  border-radius: 8px;
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover {
  border-color: #42b883;
  background: #f0faf5;
}

.result-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.product-name {
  font-weight: 600;
  min-width: 100px;
}

.product-calories {
  color: #42b883;
  font-weight: 600;
}

.product-detail {
  color: #888;
  font-size: 0.9rem;
}

.select-hint {
  color: #888;
  font-size: 0.8rem;
  font-style: italic;
}

.no-results {
  text-align: center;
  padding: 16px;
  color: #888;
}

.selected-product {
  background: #e8f5ef;
  border: 2px solid #42b883;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.selected-product h3 {
  margin-bottom: 12px;
  color: #1a1a2e;
}

.product-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 1.1rem;
}

.product-nutrition {
  color: #888;
  font-size: 0.9rem;
}

.entry-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.form-group input {
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #42b883;
}

.calculated-values {
  display: flex;
  gap: 20px;
  padding: 10px 0;
  font-weight: 600;
  color: #1a1a2e;
}

.button-row {
  display: flex;
  gap: 12px;
}

.btn-track {
  padding: 12px 24px;
  background: #218838;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-track:hover {
  background: #1e7e34;
}

.btn-track:disabled {
  background: #a0d9c1;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 12px 24px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #5a6268;
}

.today-entries {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #eef2f6;
  margin-top: 24px;
}

.today-entries h3 {
  margin-bottom: 16px;
  color: #1a1a2e;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #888;
}

.entry-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 6px;
}

.entry-name {
  flex: 1;
  font-weight: 600;
}

.entry-amount {
  color: #888;
}

.entry-calories {
  font-weight: 600;
  color: #42b883;
}

.btn-delete {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 12px;
}

.btn-delete:hover {
  background: #c82333;
}

.daily-total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px solid #eef2f6;
  display: flex;
  gap: 20px;
  font-weight: 600;
  color: #1a1a2e;
  flex-wrap: wrap;
}

.success {
  color: #28a745;
  text-align: center;
  margin: 12px 0;
}

.error {
  color: #dc3545;
  text-align: center;
  margin: 12px 0;
}

@media (max-width: 640px) {
  .search-group {
    flex-direction: column;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .result-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .daily-total {
    flex-direction: column;
    gap: 4px;
  }

  .button-row {
    flex-direction: column;
  }
}
</style>
