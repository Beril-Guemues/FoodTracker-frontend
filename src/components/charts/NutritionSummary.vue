<template>
  <div class="nutrition-container">
    <h2>Deine Nährwerte</h2>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div v-if="!profile" class="no-profile">
      <p>Bitte erstelle zuerst dein Profil.</p>
      <router-link to="/profile" class="btn">Zum Profil</router-link>
    </div>

    <div v-else-if="!userGoal" class="no-profile">
      <p>Bitte lege zuerst dein Ziel fest.</p>
      <router-link to="/goal" class="btn">Zum Ziel</router-link>
    </div>

    <div v-else>
      <div class="nutrition-grid">
        <div class="nutrition-card">
          <span class="value">{{ calorieNeed }}</span>
          <span class="unit">kcal</span>
          <span class="label">Täglicher Kalorienbedarf</span>
        </div>

        <div class="nutrition-card">
          <span class="value">{{ proteinNeed }}</span>
          <span class="unit">g</span>
          <span class="label">Täglicher Proteinbedarf</span>
        </div>

        <div class="nutrition-card">
          <span class="value">{{ carbNeed }}</span>
          <span class="unit">g</span>
          <span class="label">Täglicher Kohlenhydratbedarf</span>
        </div>

        <div class="nutrition-card">
          <span class="value">{{ waterNeed }}</span>
          <span class="unit">L</span>
          <span class="label">Wasserempfehlung</span>
        </div>

        <div class="nutrition-card">
          <span class="value">{{ targetWeightDisplay }}</span>
          <span class="unit">kg</span>
          <span class="label">Dein Ziel-Gewicht</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { API_URL } from '@/api/config'

const api = axios.create({ baseURL: API_URL })

// ===== STATE =====
const profile = ref<any>(null)
const userGoal = ref<any>(null)
const errorMessage = ref('')

// ===== PROFIL LADEN =====
async function loadProfile() {
  const profileId = localStorage.getItem('userProfileId')
  if (!profileId) {
    errorMessage.value = 'Kein Profil gefunden. Bitte erstelle zuerst ein Profil.'
    return
  }

  try {
    const response = await api.get(`/profiles/${profileId}`)
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
      console.log('✅ userGoal geladen:', userGoal.value)
    } else {
      console.log('❌ Kein userGoal in localStorage')
    }
  } catch (error) {
    console.error('Fehler beim Laden von userGoal:', error)
    userGoal.value = null
  }
}

// ===== ZIEL-GEWICHT ANZEIGE =====
const targetWeightDisplay = computed(() => {
  if (userGoal.value && userGoal.value.targetWeight) {
    return userGoal.value.targetWeight
  }
  return '—'
})

// ===== BMR (Grundumsatz) =====
const baseCalorieNeed = computed(() => {
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

// ===== KALORIEN-ANPASSUNG (KOMBINATION) =====
const tempoAdjustment = computed(() => {
  if (!userGoal.value || !profile.value) return 0

  const mainGoal = userGoal.value.mainGoal
  const tempo = userGoal.value.tempo
  const currentWeight = profile.value.weight
  const targetWeight = userGoal.value.targetWeight

  if (!targetWeight || targetWeight <= 0) return 0

  // 1. Differenz berechnen
  const weightDiff = targetWeight - currentWeight

  // 2. Tempo-Faktor
  let tempoFactor = 0
  if (tempo === 'slow') tempoFactor = 0.5
  else if (tempo === 'moderate') tempoFactor = 1.0
  else if (tempo === 'fast') tempoFactor = 1.5

  // 3. Defizit pro kg
  const baseDeficit = 50
  const totalDeficit = Math.abs(weightDiff) * baseDeficit * tempoFactor

  // 4. Begrenzung
  let adjustment = Math.min(Math.round(totalDeficit), 1000)

  // 5. Richtung
  if (mainGoal === 'lose') {
    adjustment = -adjustment
  } else if (mainGoal === 'gain') {
    adjustment = adjustment
  }

  console.log('📊 weightDiff:', weightDiff)
  console.log('📊 tempoFactor:', tempoFactor)
  console.log('📊 adjustment:', adjustment)

  return adjustment
})

const calorieNeed = computed(() => {
  const result = baseCalorieNeed.value + tempoAdjustment.value
  return Math.max(Math.round(result), 1200)
})

// ===== PROTEIN =====
const proteinNeed = computed(() => {
  if (!profile.value) return 0
  const weight = profile.value.weight

  let factor = 1.2
  if (userGoal.value?.buildMuscle === true) {
    factor = 1.6
  } else if (userGoal.value?.mainGoal === 'lose') {
    factor = 1.4
  }

  return Math.round(weight * factor)
})

// ===== KOHLENHYDRATE =====
const carbNeed = computed(() => {
  if (!profile.value) return 0
  const calories = calorieNeed.value

  let carbRatio = 0.5
  if (userGoal.value?.mainGoal === 'lose') {
    carbRatio = 0.40
  } else if (userGoal.value?.mainGoal === 'gain' && userGoal.value?.buildMuscle === true) {
    carbRatio = 0.55
  }

  return Math.round(calories * carbRatio / 4)
})

// ===== WASSER =====
const waterNeed = computed(() => {
  if (!profile.value) return 0
  return (profile.value.weight * 0.035).toFixed(2)
})

// ===== INIT =====
onMounted(async () => {
  await loadProfile()
  loadGoal()
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

.error-message {
  background: #fde8e8;
  color: #dc3545;
  padding: 16px 20px;
  border-radius: 12px;
  text-align: center;
  font-size: 1rem;
  margin-bottom: 20px;
  border: 1px solid #f5c6cb;
}

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

@media (max-width: 1024px) {
  .nutrition-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .nutrition-grid {
    grid-template-columns: repeat(2, 1fr);
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
}
</style>
