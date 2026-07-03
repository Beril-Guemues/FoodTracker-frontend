<template>
  <div class="progress-chart">
    <h2>Fortschrittsdiagramm</h2>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <div v-if="isLoading" class="hint">Lade Daten...</div>

    <div v-if="!isLoading && dailyStats.length > 0" class="chart">
      <div v-for="day in dailyStats" :key="day.date" class="day-column">
        <div class="bars">
          <div
            class="bar calories"
            :style="{ height: barHeight(day.calories, maxCalories) + 'px' }"
            :title="`${day.calories.toFixed(0)} kcal`"
          ></div>
          <div
            class="bar protein"
            :style="{ height: barHeight(day.protein, maxProtein) + 'px' }"
            :title="`${day.protein.toFixed(1)} g Protein`"
          ></div>
        </div>
        <span class="day-label">{{ formatDate(day.date) }}</span>
      </div>
    </div>

    <div v-if="!isLoading && dailyStats.length === 0" class="hint">
      Noch keine Einträge vorhanden.
    </div>

    <div class="legend">
      <span class="legend-item"><span class="dot calories"></span> Kalorien (kcal)</span>
      <span class="legend-item"><span class="dot protein"></span> Protein (g)</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

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
  date: string // ISO-Format YYYY-MM-DD
}

interface DailyStat {
  date: string
  calories: number
  protein: number
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const MAX_BAR_HEIGHT = 150 // px

const entries = ref<FoodEntry[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

// Annahme: "amount" ist in Gramm angegeben (siehe Product.calories = kcal pro 100g)
const dailyStats = computed<DailyStat[]>(() => {
  const grouped = new Map<string, { calories: number; protein: number }>()

  for (const entry of entries.value) {
    if (!entry.product || !entry.date) continue

    const factor = entry.amount / 100
    const calories = factor * entry.product.calories
    const protein = factor * entry.product.protein

    const existing = grouped.get(entry.date) ?? { calories: 0, protein: 0 }
    existing.calories += calories
    existing.protein += protein
    grouped.set(entry.date, existing)
  }

  return Array.from(grouped.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7) // letzte 7 Tage mit Einträgen
})

const maxCalories = computed(() =>
  Math.max(1, ...dailyStats.value.map((d) => d.calories))
)
const maxProtein = computed(() =>
  Math.max(1, ...dailyStats.value.map((d) => d.protein))
)

function barHeight(value: number, max: number): number {
  return Math.max(2, (value / max) * MAX_BAR_HEIGHT)
}

function formatDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-')
  return `${day}.${month}.`
}

async function loadEntries() {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/foodentries`)
    if (!response.ok) throw new Error('Daten konnten nicht geladen werden.')
    entries.value = await response.json()
  } catch (err) {
    errorMessage.value =
      err instanceof Error ? err.message : 'Unbekannter Fehler beim Laden.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadEntries)
</script>

<style scoped>
.progress-chart {
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  border-bottom: 2px solid #ccc;
  padding: 0 0.5rem;
}

.day-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 150px;
}

.bar {
  width: 14px;
  border-radius: 3px 3px 0 0;
  transition: height 0.2s ease;
}

.bar.calories {
  background-color: #42b883;
}

.bar.protein {
  background-color: #3576c9;
}

.day-label {
  font-size: 0.75rem;
  color: #666;
}

.legend {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  font-size: 0.85rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.dot.calories {
  background-color: #42b883;
}

.dot.protein {
  background-color: #3576c9;
}

.error {
  color: #d33;
}

.hint {
  font-size: 0.85rem;
  color: #888;
}
</style>
