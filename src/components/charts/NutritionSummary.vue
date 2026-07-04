<template>
  <div class="nutrition-container">
    <h2>Deine Nährwerte</h2>

    <div v-if="!profile" class="no-profile">
      <p>Bitte erstelle zuerst dein Profil.</p>
      <router-link to="/profile" class="btn">Zum Profil</router-link>
    </div>

    <div v-else>
      <!-- ===== NÄHRWERT-KARTEN ===== -->
      <div class="nutrition-grid">
        <!-- KALORIEN -->
        <div class="nutrition-card">
          <span class="value">{{ calorieNeed }}</span>
          <span class="unit">kcal</span>
          <span class="label">Täglicher Kalorienbedarf</span>
        </div>

        <!-- PROTEIN -->
        <div class="nutrition-card">
          <span class="value">{{ proteinNeed }}</span>
          <span class="unit">g</span>
          <span class="label">Täglicher Proteinbedarf</span>
        </div>

        <!-- KOHLENHYDRATE -->
        <div class="nutrition-card">
          <span class="value">{{ carbNeed }}</span>
          <span class="unit">g</span>
          <span class="label">Täglicher Kohlenhydratbedarf</span>
        </div>

        <!-- WASSER -->
        <div class="nutrition-card">
          <span class="value">{{ waterNeed }}</span>
          <span class="unit">L</span>
          <span class="label">Wasserempfehlung</span>
        </div>

        <!-- ZIEL-GEWICHT -->
        <div class="nutrition-card">
          <span class="value">{{ targetWeight }}</span>
          <span class="unit">kg</span>
          <span class="label">Dein Ziel-Gewicht</span>
        </div>
      </div>

      <!-- ===== KREISDIAGRAMME ===== -->
      <div class="chart-section">
        <h3>Heutiger Fortschritt</h3>

        <div v-if="todayEntries.length === 0" class="no-entries">
          <p>Heute hast du noch nichts gegessen.</p>
          <router-link to="/foodentry" class="btn">Jetzt Mahlzeit tracken</router-link>
        </div>

        <div v-else class="chart-grid">
          <!-- Kalorien -->
          <div class="chart-card">
            <canvas ref="caloriesChartRef"></canvas>
            <div class="chart-label">
              <span class="chart-value">{{ todayCalories }} / {{ calorieNeed }} kcal</span>
              <span class="chart-percent">{{ caloriesPercent }}%</span>
            </div>
          </div>

          <!-- Protein -->
          <div class="chart-card">
            <canvas ref="proteinChartRef"></canvas>
            <div class="chart-label">
              <span class="chart-value">{{ todayProtein }} / {{ proteinNeed }} g</span>
              <span class="chart-percent">{{ proteinPercent }}%</span>
            </div>
          </div>

          <!-- Kohlenhydrate -->
          <div class="chart-card">
            <canvas ref="carbsChartRef"></canvas>
            <div class="chart-label">
              <span class="chart-value">{{ todayCarbs }} / {{ carbNeed }} g</span>
              <span class="chart-percent">{{ carbsPercent }}%</span>
            </div>
          </div>
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

// ===== PROFILE =====
const profile = ref<UserProfile | null>(null)
const calorieNeed = ref(0)
const waterNeed = ref('0')

async function loadProfile() {
  const profileId = localStorage.getItem('userProfileId')
  if (!profileId) return

  try {
    const response = await api.get<UserProfile>(`/profiles/${profileId}`)
    profile.value = response.data

    // Kalorien- und Wasserbedarf direkt vom Backend holen
    const calorieResponse = await api.get<number>(`/profiles/${profileId}/calorie-need`)
    calorieNeed.value = Math.round(calorieResponse.data)

    const waterResponse = await api.get<number>(`/profiles/${profileId}/water-need`)
    waterNeed.value = waterResponse.data.toFixed(2)
  } catch (error) {
    console.error('Profil konnte nicht geladen werden:', error)
  }
}

// ===== ZIEL-GEWICHT (jetzt aus Profil, nicht mehr aus Goal-localStorage) =====
const targetWeight = computed(() => {
  return profile.value?.targetWeight ?? '—'
})

// ===== TODAY'S ENTRIES (vom Backend) =====
const todayEntries = ref<FoodEntry[]>([])
const todayDate = new Date().toISOString().split('T')[0]

async function loadTodayEntries() {
  try {
    const response = await api.get<FoodEntry[]>('/foodentries/date', {
      params: { date: todayDate },
    })
    todayEntries.value = response.data
  } catch (error) {
    console.error('Einträge konnten nicht geladen werden:', error)
  }
}

// ===== TODAY TOTALS =====
const todayCalories = computed(() => {
  return todayEntries.value.reduce((sum, e) => {
    return sum + Math.round((e.amount / 100) * e.product.calories)
  }, 0)
})

const todayProtein = computed(() => {
  return todayEntries.value.reduce((sum, e) => {
    return sum + Math.round((e.amount / 100) * e.product.protein * 10) / 10
  }, 0)
})

const todayCarbs = computed(() => {
  return todayEntries.value.reduce((sum, e) => {
    return sum + Math.round((e.amount / 100) * e.product.carbs * 10) / 10
  }, 0)
})

// ===== PROTEIN / CARB BEDARF (noch lokal, kein Backend-Endpoint dafür vorhanden) =====
const proteinNeed = computed(() => {
  if (!profile.value) return 0
  return Math.round(profile.value.weight * 1.2)
})

const carbNeed = computed(() => {
  if (!calorieNeed.value) return 0
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

// ===== CHARTS =====
const caloriesChartRef = ref<HTMLCanvasElement | null>(null)
const proteinChartRef = ref<HTMLCanvasElement | null>(null)
const carbsChartRef = ref<HTMLCanvasElement | null>(null)

let caloriesChart: Chart | null = null
let proteinChart: Chart | null = null
let carbsChart: Chart | null = null

function createChart(
  canvas: HTMLCanvasElement,
  value: number,
  max: number,
  label: string,
  color: string,
) {
  const percent = Math.min((value / max) * 100, 100)
  const remaining = Math.max(100 - percent, 0)

  return new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Erreicht', 'Verbleibend'],
      datasets: [
        {
          data: [percent, remaining],
          backgroundColor: [color, '#eef2f6'],
          borderWidth: 0,
        },
      ],
    },
    options: {
      cutout: '75%',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              if (context.dataIndex === 0) {
                return `Erreicht: ${Math.round(value)} ${label}`
              } else {
                return `Verbleibend: ${Math.round(max - value)} ${label}`
              }
            },
          },
        },
      },
    },
  })
}

function initCharts() {
  if (caloriesChart) {
    caloriesChart.destroy()
    caloriesChart = null
  }
  if (proteinChart) {
    proteinChart.destroy()
    proteinChart = null
  }
  if (carbsChart) {
    carbsChart.destroy()
    carbsChart = null
  }

  if (caloriesChartRef.value) {
    caloriesChart = createChart(
      caloriesChartRef.value,
      todayCalories.value,
      calorieNeed.value,
      'kcal',
      '#42b883',
    )
  }

  if (proteinChartRef.value) {
    proteinChart = createChart(
      proteinChartRef.value,
      todayProtein.value,
      proteinNeed.value,
      'g Protein',
      '#4a9eff',
    )
  }

  if (carbsChartRef.value) {
    carbsChart = createChart(
      carbsChartRef.value,
      todayCarbs.value,
      carbNeed.value,
      'g Carbs',
      '#f59e0b',
    )
  }
}

// ===== WATCH =====
watch([todayCalories, todayProtein, todayCarbs, calorieNeed, proteinNeed, carbNeed], () => {
  nextTick(() => initCharts())
})

// ===== INIT =====
onMounted(async () => {
  await loadProfile()
  await loadTodayEntries()
  setTimeout(() => {
    initCharts()
  }, 300)
})
</script>

<style scoped>
.nutrition-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

h2 {
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 40px;
}

/* ===== NÄHRWERT-KARTEN ===== */
.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  max-width: 1100px;
  margin: 0 auto 48px;
}

.nutrition-card {
  background: white;
  padding: 24px 16px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #eef2f6;
  transition: transform 0.2s;
}

.nutrition-card:hover {
  transform: translateY(-4px);
}

.nutrition-card .value {
  display: block;
  font-size: 2.6rem;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.1;
}

.nutrition-card .unit {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: #42b883;
  margin-top: 2px;
}

.nutrition-card .label {
  display: block;
  font-size: 0.85rem;
  color: #888;
  margin-top: 6px;
}

/* ===== KREISDIAGRAMME ===== */
.chart-section {
  max-width: 1000px;
  margin: 0 auto;
}

.chart-section h3 {
  text-align: center;
  font-size: 1.4rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 24px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.chart-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #eef2f6;
}

.chart-card canvas {
  max-width: 180px;
  max-height: 180px;
  margin: 0 auto;
}

.chart-label {
  margin-top: 12px;
}

.chart-value {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a2e;
}

.chart-percent {
  display: block;
  font-size: 1.3rem;
  font-weight: 700;
  color: #42b883;
  margin-top: 2px;
}

/* ===== KEIN PROFIL ===== */
.no-profile {
  text-align: center;
  padding: 60px 40px;
  background: #f8fafc;
  border-radius: 16px;
  max-width: 500px;
  margin: 0 auto;
}

.no-profile p {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 16px;
}

/* ===== KEINE ENTRIES ===== */
.no-entries {
  text-align: center;
  padding: 40px 20px;
  background: #f8fafc;
  border-radius: 16px;
}

.no-entries p {
  font-size: 1rem;
  color: #888;
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

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .nutrition-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .chart-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .nutrition-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }

  .nutrition-card .value {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .nutrition-grid {
    grid-template-columns: 1fr;
  }

  .nutrition-card {
    padding: 16px;
  }

  .nutrition-card .value {
    font-size: 1.8rem;
  }

  h2 {
    font-size: 1.4rem;
  }

  .chart-card canvas {
    max-width: 140px;
    max-height: 140px;
  }
}
</style>
