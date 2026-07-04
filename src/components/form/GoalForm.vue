<template>
  <div class="goal-container">
    <h2>Dein Ziel</h2>
    <p>Was möchtest du erreichen?</p>

    <!-- ===== FEHLERMELDUNG ===== -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="saveGoal">
      <!-- ===== SCHRITT 1: HAUPTZIEL ===== -->
      <div class="form-group">
        <label>1. Möchtest du abnehmen oder zunehmen?</label>
        <div class="option-grid">
          <div
            v-for="option in mainGoalOptions"
            :key="option.value"
            class="option-card"
            :class="{ active: mainGoal === option.value }"
            @click="mainGoal = option.value"
          >
            <span class="option-icon">{{ option.icon }}</span>
            <span class="option-label">{{ option.label }}</span>
          </div>
        </div>
      </div>

      <!-- ===== SCHRITT 2: ZIEL-GEWICHT ===== -->
      <div class="form-group">
        <label>2. Welches Gewicht möchtest du erreichen? (kg)</label>
        <input
          v-model.number="targetWeight"
          type="number"
          placeholder="z.B. 65"
          min="30"
          max="300"
          required
        />
        <span class="hint">Aktuelles Gewicht: {{ currentWeight }} kg</span>
      </div>

      <!-- ===== SCHRITT 3: MUSKELN OPTIONAL ===== -->
      <div class="form-group">
        <label>3. Möchtest du zusätzlich Muskeln aufbauen?</label>
        <div class="option-grid">
          <div
            class="option-card"
            :class="{ active: buildMuscle === true }"
            @click="buildMuscle = true"
          >
            <span class="option-icon">✅</span>
            <span class="option-label">Ja</span>
          </div>
          <div
            class="option-card"
            :class="{ active: buildMuscle === false }"
            @click="buildMuscle = false"
          >
            <span class="option-icon">❌</span>
            <span class="option-label">Nein</span>
          </div>
        </div>
      </div>

      <!-- ===== SCHRITT 4: TEMPO ===== -->
      <div class="form-group">
        <label>4. In welchem Tempo?</label>
        <div class="option-grid tempo-grid">
          <div
            v-for="option in tempoOptions"
            :key="option.value"
            class="option-card tempo-card"
            :class="{ active: tempo === option.value }"
            @click="tempo = option.value"
          >
            <span class="option-label">{{ option.label }}</span>
            <span class="option-sub">{{ option.sub }}</span>
          </div>
        </div>
      </div>

      <p v-if="successMessage" class="success">{{ successMessage }}</p>

      <button type="submit" :disabled="isLoading || !mainGoal || !tempo || !targetWeight">
        {{ isLoading ? 'Wird gespeichert...' : 'Ziel speichern' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { API_URL } from '@/api/config'

const api = axios.create({ baseURL: API_URL })
const router = useRouter()

// ===== MAPPING =====
const goalTypeMap: Record<string, string> = {
  lose: 'abnehmen',
  gain: 'zunehmen',
  muscle: 'muskeln_aufbauen',
}

const goalTypeMapReverse: Record<string, string> = {
  abnehmen: 'lose',
  zunehmen: 'gain',
  muskeln_aufbauen: 'muscle',
}

// ===== OPTIONEN =====
const mainGoalOptions = [
  { value: 'lose', label: 'Abnehmen', icon: '⬇️' },
  { value: 'gain', label: 'Zunehmen', icon: '⬆️' },
]

const tempoOptions = [
  { value: 'slow', label: 'Langsam', sub: 'Sanfte Veränderung' },
  { value: 'moderate', label: 'Mittel', sub: 'Ausgeglichen' },
  { value: 'fast', label: 'Schnell', sub: 'Maximale Ergebnisse' },
]

// ===== STATE =====
const mainGoal = ref('')
const targetWeight = ref<number | null>(null)
const buildMuscle = ref<boolean | null>(null)
const tempo = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const currentWeight = ref<number | null>(null)
const profileId = ref<string | null>(null)

// ===== BEIM LADEN =====
onMounted(async () => {
  profileId.value = localStorage.getItem('userProfileId')

  if (profileId.value) {
    try {
      const response = await api.get(`/profiles/${profileId.value}`)
      currentWeight.value = response.data.weight

      // ===== KOMPLETTES PROFIL FÜR SPÄTER MERKEN =====
      localStorage.setItem('fullProfile', JSON.stringify(response.data))
    } catch {
      console.error('Profil konnte nicht geladen werden.')
    }
  }

  // Vorhandenes Ziel aus Backend laden
  if (profileId.value) {
    try {
      const response = await api.get('/goals')
      const goals = response.data as Array<{ type: string; userProfile: { id: number } }>
      const existingGoal = goals.find((g) => g.userProfile?.id === Number(profileId.value))

      if (existingGoal) {
        const mapped = goalTypeMapReverse[existingGoal.type]
        if (mapped) mainGoal.value = mapped
      }
    } catch {
      console.error('Ziel konnte nicht geladen werden.')
    }
  }

  // Extra-Daten aus localStorage laden
  const savedExtra = localStorage.getItem('goalExtras')
  if (savedExtra) {
    try {
      const parsed = JSON.parse(savedExtra)
      targetWeight.value = parsed.targetWeight ?? null
      buildMuscle.value = parsed.buildMuscle ?? null
      tempo.value = parsed.tempo ?? ''
    } catch {}
  }
})

// ===== SPEICHERN =====
async function saveGoal() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!mainGoal.value) {
    errorMessage.value = 'Bitte wähle Abnehmen oder Zunehmen.'
    return
  }

  if (!targetWeight.value || targetWeight.value <= 0) {
    errorMessage.value = 'Bitte gib ein gültiges Ziel-Gewicht ein.'
    return
  }

  if (buildMuscle.value === null) {
    errorMessage.value = 'Bitte wähle Ja oder Nein für Muskeln aufbauen.'
    return
  }

  if (!tempo.value) {
    errorMessage.value = 'Bitte wähle ein Tempo aus.'
    return
  }

  const profileId = localStorage.getItem('userProfileId')
  if (!profileId) {
    errorMessage.value = 'Bitte lege zuerst dein Profil an.'
    return
  }

  // ===== VALIDIERUNG =====
  if (currentWeight.value !== null) {
    const current = currentWeight.value
    const target = targetWeight.value

    if (mainGoal.value === 'lose' && target >= current) {
      errorMessage.value = 'Bei "Abnehmen" muss das Ziel-Gewicht niedriger sein als dein aktuelles Gewicht (' + current + ' kg).'
      return
    }

    if (mainGoal.value === 'gain' && target <= current) {
      errorMessage.value = 'Bei "Zunehmen" muss das Ziel-Gewicht höher sein als dein aktuelles Gewicht (' + current + ' kg).'
      return
    }
  }

  isLoading.value = true

  try {
    // ===== 1. KOMPLETTES PROFIL LADEN =====
    const profileResponse = await api.get(`/profiles/${profileId}`)
    const fullProfile = profileResponse.data

    // ===== 2. ZIELTYP BESTIMMEN =====
    let goalType = goalTypeMap[mainGoal.value]
    if (buildMuscle.value === true) {
      goalType = 'muskeln_aufbauen'
    }

    // ===== 3. ZIEL MIT KOMPLETTEM PROFIL SPEICHERN =====
    await api.post('/goals', {
      type: goalType,
      userProfile: fullProfile, // ← KOMPLETTES Profil!
    })

    // ===== 4. EXTRA-DATEN LOKAL SPEICHERN =====
    localStorage.setItem(
      'goalExtras',
      JSON.stringify({
        mainGoal: mainGoal.value,
        targetWeight: targetWeight.value,
        buildMuscle: buildMuscle.value,
        tempo: tempo.value,
      })
    )

    localStorage.setItem(
      'userGoal',
      JSON.stringify({
        mainGoal: mainGoal.value,
        targetWeight: targetWeight.value,
        buildMuscle: buildMuscle.value,
        tempo: tempo.value,
      })
    )

    successMessage.value = '✅ Ziel erfolgreich gespeichert!'

    setTimeout(() => {
      router.push('/nutrition')
    }, 1000)
  } catch (error) {
    console.error('Fehler beim Speichern:', error)
    errorMessage.value = '❌ Fehler beim Speichern.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.goal-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 40px 20px;
}

h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.goal-container > p {
  color: #888;
  font-size: 1rem;
  margin-bottom: 32px;
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

.form-group {
  margin-bottom: 32px;
}

.form-group label {
  display: block;
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 12px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #42b883;
}

.hint {
  display: block;
  font-size: 0.85rem;
  color: #888;
  margin-top: 6px;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.tempo-grid {
  grid-template-columns: repeat(3, 1fr);
}

.option-card {
  background: #f8fafc;
  border: 2px solid #eef2f6;
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-card:hover {
  border-color: #42b883;
  background: #f0faf5;
}

.option-card.active {
  border-color: #42b883;
  background: #e8f5ef;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.2);
}

.option-icon {
  display: block;
  font-size: 2rem;
  margin-bottom: 4px;
}

.option-label {
  display: block;
  font-weight: 600;
  font-size: 0.95rem;
  color: #1a1a2e;
}

.option-sub {
  display: block;
  font-size: 0.75rem;
  color: #888;
  margin-top: 2px;
}

.tempo-card {
  padding: 20px 12px;
}

button {
  width: 100%;
  padding: 14px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

button:hover {
  background: #35a372;
}

button:disabled {
  background: #a0d9c1;
  cursor: not-allowed;
}

.success {
  color: #28a745;
  text-align: center;
  margin: 8px 0;
}

@media (max-width: 640px) {
  .option-grid {
    grid-template-columns: 1fr;
  }

  .tempo-grid {
    grid-template-columns: 1fr;
  }

  h2 {
    font-size: 1.6rem;
  }
}
</style>
