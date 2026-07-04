<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { API_URL } from '../../api/config' // Pfad ggf. anpassen je nach Speicherort deiner Datei

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

// ===== STATE =====
const searchQuery = ref('')
const searchResults = ref<Product[]>([])
const isSearching = ref(false)
const selectedProduct = ref<Product | null>(null)
const amount = ref<number | null>(null)
const date = ref<string>(new Date().toISOString().split('T')[0] ?? '')
const todayEntries = ref<FoodEntry[]>([])
const errorMessage = ref('')
const successMessage = ref('')
const allProducts = ref<Product[]>([])

// ===== LOAD PRODUCTS FROM BACKEND =====
async function loadProducts() {
  try {
    const response = await api.get<Product[]>('/products')
    allProducts.value = response.data
  } catch (error) {
    console.error('Fehler beim Laden der Produkte:', error)
    errorMessage.value = 'Produkte konnten nicht geladen werden.'
  }
}

// ===== SEARCH (client-seitig auf geladenen Produkten) =====
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

// ===== SELECT PRODUCT =====
function selectProduct(product: Product) {
  selectedProduct.value = product
  searchResults.value = []
  searchQuery.value = ''
  amount.value = null
}

// ===== CALCULATIONS (unverändert) =====
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

// ===== LOAD TODAY'S ENTRIES FROM BACKEND =====
async function loadEntriesForDate() {
  try {
    const response = await api.get<FoodEntry[]>('/foodentries/date', {
      params: { date: date.value },
    })
    todayEntries.value = response.data
  } catch (error) {
    console.error('Fehler beim Laden der Einträge:', error)
    errorMessage.value = 'Einträge konnten nicht geladen werden.'
  }
}

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

function calculateEntryCalories(entry: FoodEntry): number {
  return Math.round((entry.amount / 100) * entry.product.calories)
}

// ===== SAVE ENTRY (POST ans Backend) =====
async function saveEntry() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!selectedProduct.value || !amount.value || amount.value <= 0) {
    errorMessage.value = 'Bitte Produkt und Menge angeben.'
    return
  }

  try {
    await api.post('/foodentries', {
      product: { id: selectedProduct.value.id },
      amount: amount.value,
      date: date.value,
    })

    successMessage.value = 'Eintrag erfolgreich gespeichert!'
    selectedProduct.value = null
    amount.value = null

    await loadEntriesForDate() // Liste aktualisieren

    setTimeout(() => {
      successMessage.value = ''
    }, 2000)
  } catch (error) {
    console.error('Fehler beim Speichern:', error)
    errorMessage.value = 'Eintrag konnte nicht gespeichert werden.'
  }
}

// ===== DELETE ENTRY (DELETE ans Backend) =====
async function deleteEntry(id: number) {
  try {
    await api.delete(`/foodentries/${id}`)
    await loadEntriesForDate()
  } catch (error) {
    console.error('Fehler beim Löschen:', error)
    errorMessage.value = 'Eintrag konnte nicht gelöscht werden.'
  }
}

// ===== INIT =====
onMounted(() => {
  loadProducts()
  loadEntriesForDate()
})

// Datum ändern → Einträge neu vom Backend laden
watch(date, () => {
  loadEntriesForDate()
})
</script>
