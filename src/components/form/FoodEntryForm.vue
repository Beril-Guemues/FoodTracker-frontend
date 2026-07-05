<template>
  <div class="food-entry-container">
    <h2>Mahlzeit eintragen</h2>
    <p>Wähle ein Produkt aus und gib die Menge ein.</p>

    <!-- ===== NEUE MAHLZEIT ANLEGEN ===== -->
    <div class="create-section">
      <button @click="showCreateForm = !showCreateForm" class="btn-toggle-create">
        {{ showCreateForm ? '– Formular schließen' : '+ Neue Mahlzeit anlegen' }}
      </button>

      <div v-if="showCreateForm" class="create-form">
        <div class="form-group">
          <label>Name</label>
          <input v-model="newRecipe.name" type="text" placeholder="z.B. meine Suppe" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Kalorien (kcal / 100g)</label>
            <input v-model.number="newRecipe.calories" type="number" placeholder="z.B. 100" min="0" />
          </div>
          <div class="form-group">
            <label>Protein (g / 100g)</label>
            <input v-model.number="newRecipe.protein" type="number" placeholder="z.B. 5" min="0" step="0.1" />
          </div>
          <div class="form-group">
            <label>Carbs (g / 100g)</label>
            <input v-model.number="newRecipe.carbs" type="number" placeholder="z.B. 10" min="0" step="0.1" />
          </div>
        </div>
        <button @click="createRecipe" :disabled="!canCreateRecipe" class="btn-track">
          Mahlzeit speichern
        </button>
        <p v-if="createErrorMessage" class="error">{{ createErrorMessage }}</p>
      </div>
    </div>

    <!-- ===== SUCHE (ALLE PRODUKTE) ===== -->
    <div class="search-section">
      <div class="search-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Produkt suchen..."
          @input="searchProducts"
        />
        <button @click="searchProducts" class="btn-search">Suchen</button>
      </div>

      <div v-if="searchResults.length > 0" class="search-results">
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

      <div v-if="searchQuery && searchResults.length === 0 && !isSearching" class="no-results">
        <p>Kein Produkt gefunden.</p>
      </div>
    </div>

    <!-- ===== AUSGEWÄHLTE MAHLZEIT ===== -->
    <div v-if="selectedProduct" class="selected-product">
      <h3>Ausgewählte Mahlzeit</h3>
      <div class="product-info">
        <span class="product-name">{{ selectedProduct.name }}</span>
        <span class="product-calories">{{ selectedProduct.calories }} kcal / 100g</span>
        <span class="product-nutrition">
          Protein: {{ selectedProduct.protein }}g | Carbs: {{ selectedProduct.carbs }}g
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
          <button @click="deleteEntry(entry.id)" class="btn-delete">X</button>
        </div>

        <div class="daily-total">
          <span>Heute insgesamt:</span>
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

// ===== STATE: ANLEGEN =====
const showCreateForm = ref(false)
const newRecipe = ref({ name: '', calories: null as number | null, protein: null as number | null, carbs: null as number | null })
const createErrorMessage = ref('')

const canCreateRecipe = computed(() => {
  return (
    newRecipe.value.name.trim() !== '' &&
    newRecipe.value.calories !== null &&
    newRecipe.value.protein !== null &&
    newRecipe.value.carbs !== null
  )
})

async function createRecipe() {
  createErrorMessage.value = ''
  if (!canCreateRecipe.value) {
    createErrorMessage.value = 'Bitte alle Felder ausfüllen.'
    return
  }

  try {
    await api.post('/products', {
      name: newRecipe.value.name.trim(),
      calories: newRecipe.value.calories,
      protein: newRecipe.value.protein,
      carbs: newRecipe.value.carbs,
    })

    newRecipe.value = { name: '', calories: null, protein: null, carbs: null }
    showCreateForm.value = false
    successMessage.value = '✅ Mahlzeit angelegt!'
    await loadProducts() // ← Liste neu laden
    setTimeout(() => { successMessage.value = '' }, 2000)
  } catch {
    createErrorMessage.value = 'Mahlzeit konnte nicht gespeichert werden.'
  }
}

// ===== STATE: SUCHE (ALLE PRODUKTE) =====
const searchQuery = ref('')
const searchResults = ref<Product[]>([])
const isSearching = ref(false)
const allProducts = ref<Product[]>([])

async function loadProducts() {
  try {
    const response = await api.get<Product[]>('/products')
    allProducts.value = response.data
    console.log('✅ Produkte geladen:', allProducts.value.length)
  } catch {
    errorMessage.value = 'Produkte konnten nicht geladen werden.'
  }
}

function searchProducts() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  const query = searchQuery.value.toLowerCase().trim()
  searchResults.value = allProducts.value.filter((p) => p.name.toLowerCase().includes(query))
  isSearching.value = false
}

// ===== STATE: TRACKEN =====
const selectedProduct = ref<Product | null>(null)
const amount = ref<number | null>(null)
const date = ref<string>(new Date().toISOString().split('T')[0] ?? '')
const todayEntries = ref<FoodEntry[]>([])
const errorMessage = ref('')
const successMessage = ref('')

function selectProduct(product: Product) {
  selectedProduct.value = product
  amount.value = null
  errorMessage.value = ''
  successMessage.value = ''
  searchResults.value = []
  searchQuery.value = ''
}

function cancelSelection() {
  selectedProduct.value = null
  amount.value = null
  errorMessage.value = ''
  successMessage.value = ''
}

// ===== BERECHNUNGEN =====
const calculatedCalories = computed(() => {
  if (!selectedProduct.value || !amount.value) return 0
  return Math.round((amount.value / 100) * selectedProduct.value.calories)
})

const calculatedProtein = computed(() => {
  if (!selectedProduct.value || !amount.value) return 0
  return Math.round((amount.value / 100) * selectedProduct.value.protein * 10) / 10
})

const calculatedCarbs = computed(() => {
  if (!selectedProduct.value || !amount.value) return 0
  return Math.round((amount.value / 100) * selectedProduct.value.carbs * 10) / 10
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

// ===== EINTRAG SPEICHERN =====
async function saveEntry() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!selectedProduct.value || !amount.value || amount.value <= 0) {
    errorMessage.value = 'Bitte Mahlzeit und Menge angeben.'
    return
  }

  try {
    await api.post('/foodentries', {
      product: selectedProduct.value,
      amount: amount.value,
      date: date.value,
    })

    successMessage.value = '✅ Eintrag erfolgreich gespeichert!'
    selectedProduct.value = null
    amount.value = null

    await loadEntriesForDate()

    setTimeout(() => {
      successMessage.value = ''
    }, 2000)
  } catch {
    errorMessage.value = '❌ Eintrag konnte nicht gespeichert werden.'
  }
}

async function deleteEntry(id: number) {
  try {
    await api.delete(`/foodentries/${id}`)
    await loadEntriesForDate()
  } catch {
    errorMessage.value = 'Eintrag konnte nicht gelöscht werden.'
  }
}

function calculateEntryCalories(entry: FoodEntry): number {
  return Math.round((entry.amount / 100) * entry.product.calories)
}

const dailyTotalCalories = computed(() =>
  todayEntries.value.reduce((sum, e) => sum + Math.round((e.amount / 100) * e.product.calories), 0)
)
const dailyTotalProtein = computed(() =>
  todayEntries.value.reduce((sum, e) => sum + Math.round((e.amount / 100) * e.product.protein * 10) / 10, 0)
)
const dailyTotalCarbs = computed(() =>
  todayEntries.value.reduce((sum, e) => sum + Math.round((e.amount / 100) * e.product.carbs * 10) / 10, 0)
)

// ===== INIT =====
onMounted(async () => {
  await loadProducts()
  await loadEntriesForDate()
})

watch(date, () => {
  loadEntriesForDate()
})
</script>

<style scoped>
.food-entry-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.food-entry-container > p {
  color: #888;
  margin-bottom: 24px;
}

/* ===== ANLEGEN ===== */
.create-section {
  margin-bottom: 24px;
}

.btn-toggle-create {
  padding: 10px 20px;
  background: #1a1a2e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 12px;
}

.btn-toggle-create:hover {
  background: #2a2a4e;
}

.create-form {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #eef2f6;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ===== SUCHE ===== */
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

.search-group input,
.create-form input {
  flex: 1;
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.search-group input:focus,
.create-form input:focus {
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
  padding: 16px;
  color: #888;
}

/* ===== AUSGEWÄHLTE MAHLZEIT ===== */
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
  padding: 12px;
  background: #218838;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
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
  .form-row {
    grid-template-columns: 1fr;
  }
  .search-group {
    flex-direction: column;
  }
  .daily-total {
    flex-wrap: wrap;
    gap: 8px;
  }
  .calculated-values {
    flex-wrap: wrap;
  }
}
</style>
