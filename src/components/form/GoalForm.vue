<template>
  <div class="goal-container">
    <div class="goal-header">
      <h2>Dein Ziel</h2>
      <p>Was möchtest du erreichen?</p>
    </div>

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
  await new Promise((resolve) => setTimeout(resolve, 500))

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
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px 64px;
}

.goal-header {
  text-align: center;
  margin-bottom: 40px;
}

h2 {
  font-size: 2.8rem;
  font-weight: 800;
  color: #1a1a2e;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.goal-header p {
  color: #888;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 36px;
  background: white;
  padding: 24px;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f2f5;
}

.form-group label {
  display: block;
  font-weight: 700;
  font-size: 1.1rem;
  color: #1a1a2e;
  margin-bottom: 16px;
}

.form-group input {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e8ecf0;
  border-radius: 12px;
  font-size: 1.05rem;
  box-sizing: border-box;
  transition: all 0.2s ease;
  background: #fafbfc;
}

.form-group input:focus {
  outline: none;
  border-color: #42b883;
  background: white;
  box-shadow: 0 0 0 4px rgba(66, 184, 131, 0.1);
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.tempo-grid {
  grid-template-columns: repeat(3, 1fr);
}

.option-card {
  background: #fafbfc;
  border: 2px solid #eef2f6;
  border-radius: 14px;
  padding: 20px 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-card:hover {
  border-color: #42b883;
  background: #f0faf5;
  transform: translateY(-2px);
}

.option-card.active {
  border-color: #42b883;
  background: #e8f5ef;
  box-shadow: 0 4px 16px rgba(66, 184, 131, 0.25);
  transform: translateY(-2px);
}

.option-icon {
  display: block;
  font-size: 2.2rem;
  margin-bottom: 8px;
}

.option-label {
  display: block;
  font-weight: 600;
  font-size: 0.95rem;
  color: #1a1a2e;
}

.option-sub {
  display: block;
  font-size: 0.78rem;
  color: #888;
  margin-top: 4px;
}

.tempo-card {
  padding: 22px 12px;
}

button {
  width: 100%;
  padding: 16px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(66, 184, 131, 0.25);
}

button:hover:not(:disabled) {
  background: #35a372;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(66, 184, 131, 0.35);
}

button:disabled {
  background: #cfe8dc;
  cursor: not-allowed;
  box-shadow: none;
}

.success {
  color: #1e7e34;
  text-align: center;
  margin: 12px 0;
  font-weight: 600;
  padding: 12px;
  background: #eaf7ee;
  border-radius: 10px;
}

.error {
  color: #c0392b;
  text-align: center;
  margin: 12px 0;
  font-weight: 600;
  padding: 12px;
  background: #fdecea;
  border-radius: 10px;
}

@media (max-width: 640px) {
  .option-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tempo-grid {
    grid-template-columns: 1fr;
  }

  h2 {
    font-size: 2rem;
  }

  .form-group {
    padding: 18px;
  }
}
</style>
