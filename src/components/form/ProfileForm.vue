<template>
  <div class="profile-form-container">
    <h2>👤 Profil einrichten</h2>
    <p>Deine persönlichen Daten für genaue Berechnungen</p>

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
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Wird gespeichert...' : 'Profil speichern' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

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

onMounted(() => {
  const savedProfile = localStorage.getItem('userProfile')
  if (savedProfile) {
    try {
      const parsed = JSON.parse(savedProfile)
      profile.weight = parsed.weight
      profile.height = parsed.height
      profile.age = parsed.age
      profile.gender = parsed.gender
    } catch {}
  }
})

async function saveProfile() {
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  await new Promise(resolve => setTimeout(resolve, 500))

  if (!profile.weight || !profile.height || !profile.age || !profile.gender) {
    errorMessage.value = '❌ Bitte alle Felder ausfüllen'
    isLoading.value = false
    return
  }

  try {
    localStorage.setItem('userProfile', JSON.stringify(profile))
    localStorage.setItem('userProfileId', '1')
    successMessage.value = '✅ Profil erfolgreich gespeichert!'

    setTimeout(() => {
      router.push('/goal')
    }, 1000)
  } catch {
    errorMessage.value = '❌ Fehler beim Speichern'
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

h2 {
  color: #2c3e50;
  margin-bottom: 4px;
}

p {
  color: #888;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #42b883;
}

button {
  width: 100%;
  padding: 12px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
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
}

.error {
  color: #dc3545;
  text-align: center;
}
</style>
