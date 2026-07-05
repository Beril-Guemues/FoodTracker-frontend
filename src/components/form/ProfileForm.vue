<template>
  <div class="profile-form-container">
    <h2 class="page-title">Profil einrichten</h2>
    <p class="page-subtitle">Deine persönlichen Daten für genaue Berechnungen</p>

    <!-- ===== FEHLERMELDUNG ===== -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="saveProfile">
      <div class="form-group">
        <label>Gewicht (kg)</label>
        <input v-model.number="profile.weight" type="number" placeholder="z.B. 70" required />
      </div>

      <div class="form-group">
        <label>Größe (cm)</label>
        <input v-model.number="profile.height" type="number" placeholder="z.B. 175" required />
      </div>

      <div class="form-group">
        <label>Alter</label>
        <input v-model.number="profile.age" type="number" placeholder="z.B. 25" required />
      </div>

      <div class="form-group">
        <label>Geschlecht</label>
        <select v-model="profile.gender" required>
          <option value="">Bitte wählen</option>
          <option value="male">Männlich</option>
          <option value="female">Weiblich</option>
        </select>
      </div>

      <p v-if="successMessage" class="success">{{ successMessage }}</p>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Wird gespeichert...' : 'Profil speichern' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { API_URL } from '@/api/config'

const api = axios.create({ baseURL: API_URL })
const router = useRouter()

const profile = reactive({
  weight: null as number | null,
  height: null as number | null,
  age: null as number | null,
  gender: '' as string,
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// ===== BEIM LADEN: Vorhandenes Profil aus Backend holen =====
onMounted(async () => {
  const profileId = localStorage.getItem('userProfileId')
  if (!profileId) return

  try {
    const response = await api.get(`/profiles/${profileId}`)
    const data = response.data
    profile.weight = data.weight
    profile.height = data.height
    profile.age = data.age
    profile.gender = data.gender
    errorMessage.value = ''
  } catch {
    errorMessage.value = 'Profil konnte nicht geladen werden.'
  }
})

// ===== SPEICHERN: Profil ans Backend senden =====
async function saveProfile() {
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  if (
    !profile.weight ||
    !profile.height ||
    !profile.age ||
    !profile.gender
  ) {
    errorMessage.value = 'Bitte alle Felder ausfüllen.'
    isLoading.value = false
    return
  }

  try {
    const response = await api.post('/profiles', {
      weight: profile.weight,
      height: profile.height,
      age: profile.age,
      gender: profile.gender,
      targetWeight: 0,
    })

    localStorage.setItem('userProfileId', String(response.data.id))

    successMessage.value = '✅ Profil erfolgreich gespeichert!'

    setTimeout(() => {
      router.push('/goal')
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
.profile-form-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

/* ===== GRÖSSERE ÜBERSCHRIFT ===== */
.page-title {
  font-size: 2.4rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 4px;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #888;
  margin-bottom: 28px;
}

/* ===== FEHLERMELDUNG ===== */
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

/* ===== FORMULAR ===== */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
  font-size: 1rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e8ecf0;
  border-radius: 10px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: all 0.2s ease;
  background: #fafbfc;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #42b883;
  background: white;
  box-shadow: 0 0 0 4px rgba(66, 184, 131, 0.1);
}

button {
  width: 100%;
  padding: 14px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
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
</style>
