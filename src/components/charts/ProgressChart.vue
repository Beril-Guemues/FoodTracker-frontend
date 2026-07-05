<template>
  <div class="progress-container">
    <h2>Dein Fortschritt</h2>
    <p>Deine heutige Kalorien-, Protein- und Kohlenhydrat-Aufnahme.</p>

    <!-- ===== FEHLERMELDUNG ===== -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div v-if="!profile" class="no-data">
      <p>Bitte erstelle zuerst dein Profil.</p>
      <router-link to="/profile" class="btn">Zum Profil</router-link>
    </div>

    <div v-else-if="!userGoal" class="no-data">
      <p>Bitte lege zuerst dein Ziel fest.</p>
      <router-link to="/goal" class="btn">Zum Ziel</router-link>
    </div>

    <div v-else-if="entries.length === 0" class="no-data">
      <p>Noch keine Mahlzeiten getrackt.</p>
      <router-link to="/foodentry" class="btn">Jetzt Mahlzeit tracken</router-link>
    </div>

    <!-- ===== NORMALE ANZEIGE ===== -->
    <div v-else>
      <!-- 3 Kreisdiagramme -->
      <div class="donuts-section">
        <div class="donut-card">
          <h4>Kalorien</h4>
          <div class="donut-wrapper">
            <canvas ref="caloriesDonutRef"></canvas>
            <div class="donut-center">
              <span class="donut-value">{{ todayCalories.toFixed(0) }}</span>
              <span class="donut-unit">/ {{ calorieNeed }} kcal</span>
            </div>
          </div>
          <span class="donut-percent">{{ caloriesPercent }}%</span>
        </div>

        <div class="donut-card">
          <h4>Protein</h4>
          <div class="donut-wrapper">
            <canvas ref="proteinDonutRef"></canvas>
            <div class="donut-center">
              <span class="donut-value">{{ todayProtein.toFixed(1) }}</span>
              <span class="donut-unit">/ {{ proteinNeed }} g</span>
            </div>
          </div>
          <span class="donut-percent">{{ proteinPercent }}%</span>
        </div>

        <div class="donut-card">
          <h4>Kohlenhydrate</h4>
          <div class="donut-wrapper">
            <canvas ref="carbsDonutRef"></canvas>
            <div class="donut-center">
              <span class="donut-value">{{ todayCarbs.toFixed(1) }}</span>
              <span class="donut-unit">/ {{ carbNeed }} g</span>
            </div>
          </div>
          <span class="donut-percent">{{ carbsPercent }}%</span>
        </div>
      </div>

      <!-- Zusammenfassung -->
      <div class="summary">
        <div class="summary-card">
          <span class="summary-value">{{ totalCalories }}</span>
          <span class="summary-label">Kalorien (heute)</span>
        </div>
        <div class="summary-card">
          <span class="summary-value">{{ totalProtein.toFixed(1) }}</span>
          <span class="summary-label">Protein (heute)</span>
        </div>
        <div class="summary-card">
          <span class="summary-value">{{ totalCarbs.toFixed(1) }}</span>
          <span class="summary-label">Carbs (heute)</span>
        </div>
        <div class="summary-card">
          <span class="summary-value">{{ todayCalories.toFixed(0) }}</span>
          <span class="summary-label">Heutige Kalorien</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import axios from 'axios'
import { API_URL } from '@/api/config'

Chart.register(...registerables)

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

interface UserProfile {
  id: number
  weight: number
  gender: string
  age: number
  height: number
  targetWeight: number
}

// ===== STATE =====
const entries = ref<FoodEntry[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const profile = ref<UserProfile | null>(null)
const userGoal = ref<any>(null)

// ===== CHART REFS =====
const caloriesDonutRef = ref<HTMLCanvasElement | null>(null)
const proteinDonutRef = ref<HTMLCanvasElement | null>(null)
const carbsDonutRef = ref<HTMLCanvasElement | null>(null)

let caloriesDonut: Chart | null = null
let proteinDonut: Chart | null = null
let carbsDonut: Chart | null = null

// ===== PROFIL VOM BACKEND LADEN =====
async function loadProfile() {
  const profileId = localStorage.getItem('userProfileId')
  if (!profileId) {
    errorMessage.value = 'Kein Profil gefunden. Bitte erstelle zuerst ein Profil.'
    return
  }

  try {
    const response = await api.get<UserProfile>(`/profiles/${profileId}`)
    profile.value = response.data
    errorMessage.value = ''
  } catch {
    errorMessage.value = 'Fehler beim Laden des Profils.'
  }
}

// ===== ZIEL LADEN =====
function loadGoal() {
  try {
    const savedGoal = localStorage.getItem('userGoal')
    if (savedGoal) {
      userGoal.value = JSON.parse(savedGoal)
    }
  } catch {
    userGoal.value = null
  }
}

// ===== FOOD ENTRIES VOM BACKEND LADEN =====
async function loadEntries() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get<FoodEntry[]>('/foodentries')
    entries.value = response.data
  } catch {
    errorMessage.value = 'Fehler beim Laden der Einträge.'
  } finally {
    isLoading.value = false
  }
}

// ===== TODAY'S DATE =====
const todayDate = new Date().toISOString().split('T')[0]

// ===== TODAY TOTALS =====
const todayEntries = computed(() => {
  return entries.value.filter(e => e.date === todayDate && e.product)
})

const todayCalories = computed(() => {
  return todayEntries.value.reduce((sum, e) => {
    return sum + (e.amount / 100) * e.product.calories
  }, 0)
})

const todayProtein = computed(() => {
  return todayEntries.value.reduce((sum, e) => {
    return sum + (e.amount / 100) * e.product.protein
  }, 0)
})

const todayCarbs = computed(() => {
  return todayEntries.value.reduce((sum, e) => {
    return sum + (e.amount / 100) * e.product.carbs
  }, 0)
})

// ===== BEREICHNUNGEN =====
const calorieNeed = computed(() => {
  if (!profile.value) return 0
  const p = profile.value
  let bmr
  if (p.gender === 'female') {
    bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age - 161
  } else {
    bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + 5
  }
  return Math.round(bmr * 1.2)
})

const proteinNeed = computed(() => {
  if (!profile.value) return 0
  return Math.round(profile.value.weight * 1.2)
})

const carbNeed = computed(() => {
  if (!profile.value) return 0
  return Math.round((calorieNeed.value * 0.5) / 4)
})

// ===== PROZENTE =====
const caloriesPercent = computed(() => {
  if (calorieNeed.value === 0) return 0
  return Math.min(Math.round((todayCalories.value / calorieNeed.value) * 100), 100)
})

const proteinPercent = computed(() => {
  if (proteinNeed.value === 0) return 0
  return Math.min(Math.round((todayProtein.value / proteinNeed.value) * 100), 100)
})

const carbsPercent = computed(() => {
  if (carbNeed.value === 0) return 0
  return Math.min(Math.round((todayCarbs.value / carbNeed.value) * 100), 100)
})

// ===== SUMMARY STATS =====
const totalCalories = computed(() => {
  return todayEntries.value.reduce((sum, e) => {
    return sum + (e.amount / 100) * e.product.calories
  }, 0)
})

const totalProtein = computed(() => {
  return todayEntries.value.reduce((sum, e) => {
    return sum + (e.amount / 100) * e.product.protein
  }, 0)
})

const totalCarbs = computed(() => {
  return todayEntries.value.reduce((sum, e) => {
    return sum + (e.amount / 100) * e.product.carbs
  }, 0)
})

// ===== DONUT CHARTS =====
function createDonut(canvas: HTMLCanvasElement, value: number, max: number, color: string) {
  const eaten = Math.min(value, max)
  const remaining = Math.max(max - eaten, 0)

  return new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Erreicht', 'Verbleibend'],
      datasets: [{
        data: [eaten, remaining],
        backgroundColor: [color, '#eef2f6'],
        borderWidth: 0,
      }]
    },
    options: {
      cutout: '75%',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.dataIndex === 0) {
                return `Erreicht: ${Math.round(value)}`
              } else {
                return `Verbleibend: ${Math.round(remaining)}`
              }
            }
          }
        }
      }
    }
  })
}

function initDonuts() {
  if (caloriesDonut) { caloriesDonut.destroy(); caloriesDonut = null }
  if (proteinDonut) { proteinDonut.destroy(); proteinDonut = null }
  if (carbsDonut) { carbsDonut.destroy(); carbsDonut = null }

  if (caloriesDonutRef.value && calorieNeed.value > 0) {
    caloriesDonut = createDonut(
      caloriesDonutRef.value,
      todayCalories.value,
      calorieNeed.value,
      '#42b883'
    )
  }

  if (proteinDonutRef.value && proteinNeed.value > 0) {
    proteinDonut = createDonut(
      proteinDonutRef.value,
      todayProtein.value,
      proteinNeed.value,
      '#4a9eff'
    )
  }

  if (carbsDonutRef.value && carbNeed.value > 0) {
    carbsDonut = createDonut(
      carbsDonutRef.value,
      todayCarbs.value,
      carbNeed.value,
      '#f59e0b'
    )
  }
}

watch([todayCalories, todayProtein, todayCarbs, calorieNeed, proteinNeed, carbNeed], () => {
  nextTick(() => initDonuts())
})

// ===== INIT =====
onMounted(async () => {
  await loadProfile()
  loadGoal()
  await loadEntries()
  setTimeout(() => {
    initDonuts()
  }, 300)
})
</script>

<style scoped>
.progress-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

h2 {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.progress-container > p {
  text-align: center;
  color: #888;
  font-size: 1rem;
  margin-bottom: 32px;
}

/* ===== FEHLERMELDUNG ===== */
.error-message {
  background: #fde8e8;
  color: #dc3545;
  padding: 16px 20px;
  border-radius: 10px;
  text-align: center;
  font-size: 1rem;
  margin-bottom: 20px;
  border: 1px solid #f5c6cb;
}

.donuts-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.donut-card {
  background: white;
  padding: 20px 16px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #eef2f6;
}

.donut-card h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 12px;
}

.donut-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.donut-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: #1a1a2e;
  line-height: 1.2;
}

.donut-unit {
  font-size: 0.7rem;
  color: #888;
}

.donut-percent {
  display: block;
  margin-top: 8px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #42b883;
}

.summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.summary-card {
  background: white;
  padding: 20px 16px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #eef2f6;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.summary-value {
  display: block;
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a1a2e;
}

.summary-label {
  display: block;
  font-size: 0.85rem;
  color: #888;
  margin-top: 4px;
}

.no-data {
  text-align: center;
  padding: 60px 40px;
  background: #f8fafc;
  border-radius: 16px;
}

.no-data p {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 16px;
}

.btn {
  display: inline-block;
  padding: 10px 28px;
  background: #42b883;
  color: white;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s;
}

.btn:hover {
  background: #35a372;
}

@media (max-width: 768px) {
  .donuts-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .summary {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .summary {
    grid-template-columns: 1fr;
  }

  .donut-wrapper {
    width: 120px;
    height: 120px;
  }

  .donut-value {
    font-size: 1.1rem;
  }

  h2 {
    font-size: 1.6rem;
  }
}
</style>
