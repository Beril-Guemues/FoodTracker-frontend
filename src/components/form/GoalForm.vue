<template>
  <div class="goal-container">
    <h2>🎯 Dein Ziel</h2>
    <p>Was möchtest du erreichen?</p>

    <form @submit.prevent="saveGoal">
      <!-- ===== ZIEL ===== -->
      <div class="form-group">
        <label>Dein Ziel</label>
        <div class="option-grid">
          <div
            v-for="option in goalOptions"
            :key="option.value"
            class="option-card"
            :class="{ active: goal === option.value }"
            @click="goal = option.value"
          >
            <span class="option-icon">{{ option.icon }}</span>
            <span class="option-label">{{ option.label }}</span>
          </div>
        </div>
      </div>

      <!-- ===== ZIEL-GEWICHT ===== -->
      <div class="form-group">
        <label>Welches Gewicht möchtest du erreichen? (kg)</label>
        <input
          v-model.number="targetWeight"
          type="number"
          placeholder="z.B. 65"
          min="30"
          max="300"
          required
        />
      </div>

      <!-- ===== TEMPO ===== -->
      <div class="form-group">
        <label>In welchem Tempo?</label>
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

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>

      <button type="submit" :disabled="isLoading || !goal || !tempo || !targetWeight">
        {{ isLoading ? 'Wird gespeichert...' : 'Ziel speichern' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goalOptions = [
  { value: 'lose', label: 'Abnehmen', icon: '⬇️' },
  { value: 'gain', label: 'Zunehmen', icon: '⬆️' },
  { value: 'muscle', label: 'Muskeln aufbauen', icon: '💪' },
  { value: 'healthy', label: 'Gesund ernähren', icon: '🥗' },
]

const tempoOptions = [
  { value: 'slow', label: 'Langsam', sub: 'Sanfte Veränderung' },
  { value: 'moderate', label: 'Mittel', sub: 'Ausgeglichen' },
  { value: 'fast', label: 'Schnell', sub: 'Maximale Ergebnisse' },
]

const goal = ref('')
const targetWeight = ref<number | null>(null)
const tempo = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(() => {
  const savedGoal = localStorage.getItem('userGoal')
  if (savedGoal) {
    try {
      const parsed = JSON.parse(savedGoal)
      goal.value = parsed.goal || ''
      targetWeight.value = parsed.targetWeight || null
      tempo.value = parsed.tempo || ''
    } catch {}
  }
})

async function saveGoal() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!goal.value) {
    errorMessage.value = '❌ Bitte wähle ein Ziel aus.'
    return
  }

  if (!targetWeight.value || targetWeight.value <= 0) {
    errorMessage.value = '❌ Bitte gib ein gültiges Ziel-Gewicht ein.'
    return
  }

  if (!tempo.value) {
    errorMessage.value = '❌ Bitte wähle ein Tempo aus.'
    return
  }

  isLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 500))

  try {
    const goalData = {
      goal: goal.value,
      targetWeight: targetWeight.value,
      tempo: tempo.value,
    }
    localStorage.setItem('userGoal', JSON.stringify(goalData))

    successMessage.value = '✅ Ziel erfolgreich gespeichert!'

    setTimeout(() => {
      router.push('/nutrition')
    }, 1000)
  } catch {
    errorMessage.value = '❌ Fehler beim Speichern'
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

.option-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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

.error {
  color: #dc3545;
  text-align: center;
  margin: 8px 0;
}

@media (max-width: 640px) {
  .option-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tempo-grid {
    grid-template-columns: 1fr;
  }

  h2 {
    font-size: 1.6rem;
  }
}
</style>
