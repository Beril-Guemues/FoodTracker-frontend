<template>
  <div class="food-entry-container">
    <h2>📝 Mahlzeit eintragen</h2>
    <p>Wähle ein Produkt aus und gib die Menge ein.</p>

    <!-- ===== PRODUKTSUCHE ===== -->
    <div class="search-section">
      <div class="search-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Produkt suchen..."
          @input="searchProducts"
        />
        <button @click="searchProducts" class="btn-search">🔍 Suchen</button>
      </div>

      <!-- Suchergebnisse -->
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

      <!-- Keine Ergebnisse -->
      <div v-if="searchQuery && searchResults.length === 0 && !isSearching" class="no-results">
        <p>Kein Produkt gefunden.</p>
        <router-link to="/custom-food" class="btn-add">
          ➕ Eigenes Lebensmittel anlegen
        </router-link>
      </div>
    </div>

    <!-- ===== AUSGEWÄHLTES PRODUKT ===== -->
    <div v-if="selectedProduct" class="selected-product">
      <h3>Ausgewähltes Produkt</h3>
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
            <input
              v-model.number="amount"
              type="number"
              placeholder="z.B. 150"
              min="1"
              required
            />
          </div>

          <div class="form-group">
            <label>Datum</label>
            <input
              v-model="date"
              type="date"
              required
            />
          </div>
        </div>

        <div class="calculated-values">
          <span>🔥 {{ calculatedCalories }} kcal</span>
          <span>💪 {{ calculatedProtein }} g Protein</span>
          <span>🍞 {{ calculatedCarbs }} g Carbs</span>
        </div>

        <button @click="saveEntry" :disabled="!amount || amount <= 0" class="btn-save">
          Eintrag speichern
        </button>
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

// ===== STATE =====
const searchQuery = ref('')
const searchResults = ref<Product[]>([])
const isSearching = ref(false)
const selectedProduct = ref<Product | null>(null)
const amount = ref<number | null>(null)
const date = ref(new Date().toISOString().split('T')[0])
const entries = ref<FoodEntry[]>([])
const errorMessage = ref('')
const successMessage = ref('')
let nextEntryId = 1

// ===== PRODUCTS (aus localStorage) =====
const getProducts = (): Product[] => {
  const saved = localStorage.getItem('products')
  return saved ? JSON.parse(saved) : []
}

// ===== SEARCH =====
function searchProducts() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  const allProducts = getProducts()
  const query = searchQuery.value.toLowerCase().trim()

  searchResults.value = allProducts.filter(p =>
    p.name.toLowerCase().includes(query)
  )

  isSearching.value = false
}

// ===== SELECT PRODUCT =====
function selectProduct(product: Product) {
  selectedProduct.value = product
  searchResults.value = []
  searchQuery.value = ''
  amount.value = null
}

// ===== CALCULATIONS =====
const calculatedCalories = computed(() => {
  if (!selectedProduct.value || !amount.value) return 0
  return Math.round((amount.value / 100) * selectedProduct.value.calories)
})

const calculatedProtein = computed(() => {
  if (!selectedProduct.value || !amount.value) return 0
  return Math.round(((amount.value / 100) * selectedProduct.value.protein) * 10) / 10
})

const calculatedCarbs = computed(() => {
  if (!selectedProduct.value || !amount.value) return 0
  return Math.round(((amount.value / 100) * selectedProduct.value.carbs) * 10) / 10
})

// ===== ENTRIES =====
const getEntries = (): FoodEntry[] => {
  const saved = localStorage.getItem('foodEntries')
  return saved ? JSON.parse(saved) : []
}

const saveEntries = (data: FoodEntry[]) => {
  localStorage.setItem('foodEntries', JSON.stringify(data))
  entries.value = data
}

// ===== TODAY'S ENTRIES =====
const todayEntries = computed(() => {
  return entries.value.filter(e => e.date === date.value)
})

const dailyTotalCalories = computed(() => {
  return todayEntries.value.reduce((sum, e) => {
    return sum + Math.round((e.amount / 100) * e.product.calories)
  }, 0)
})

const dailyTotalProtein = computed(() => {
  return todayEntries.value.reduce((sum, e) => {
    return sum + Math.round(((e.amount / 100) * e.product.protein) * 10) / 10
  }, 0)
})

const dailyTotalCarbs = computed(() => {
  return todayEntries.value.reduce((sum, e) => {
    return sum + Math.round(((e.amount / 100) * e.product.carbs) * 10) / 10
  }, 0)
})

function calculateEntryCalories(entry: FoodEntry): number {
  return Math.round((entry.amount / 100) * entry.product.calories)
}

// ===== SAVE ENTRY =====
async function saveEntry() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!selectedProduct.value || !amount.value || amount.value <= 0) {
    errorMessage.value = '❌ Bitte Produkt und Menge angeben.'
    return
  }

  const newEntry: FoodEntry = {
    id: nextEntryId++,
    product: selectedProduct.value,
    amount: amount.value,
    date: date.value,
  }

  const allEntries = getEntries()
  allEntries.push(newEntry)
  saveEntries(allEntries)

  successMessage.value = '✅ Eintrag erfolgreich gespeichert!'
  selectedProduct.value = null
  amount.value = null

  setTimeout(() => {
    successMessage.value = ''
  }, 2000)
}

// ===== DELETE ENTRY =====
function deleteEntry(id: number) {
  const allEntries = getEntries()
  const filtered = allEntries.filter(e => e.id !== id)
  saveEntries(filtered)
}

// ===== INIT =====
onMounted(() => {
  entries.value = getEntries()

  // Maximale ID finden
  const allEntries = getEntries()
  if (allEntries.length > 0) {
    nextEntryId = Math.max(...allEntries.map(e => e.id)) + 1
  }
})

// Datum ändern → Einträge aktualisieren
watch(date, () => {
  // Nichts weiter nötig, computed aktualisiert sich
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

/* ===== SEARCH ===== */
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

.btn-add {
  display: inline-block;
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  margin-top: 8px;
  font-weight: 600;
}

.btn-add:hover {
  background: #5a6268;
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

.btn-save {
  padding: 12px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: #35a372;
}

.btn-save:disabled {
  background: #a0d9c1;
  cursor: not-allowed;
}

/* ===== TODAY ENTRIES ===== */
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

/* ===== MESSAGES ===== */
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

/* ===== RESPONSIVE ===== */
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
