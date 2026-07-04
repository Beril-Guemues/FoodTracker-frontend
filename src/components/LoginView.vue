<template>
  <div class="login-page">
    <!-- Linke Seite: Branding -->
    <div class="login-brand">
      <div class="brand-content">
        <h1>FoodTracker</h1>
        <p>Dein persönlicher Weg zu einer gesünderen Ernährung</p>
        <div class="brand-features">
          <div class="brand-feature">
            <span class="check">✓</span>
            <span>Mahlzeiten einfach tracken</span>
          </div>
          <div class="brand-feature">
            <span class="check">✓</span>
            <span>Persönliche Ziele setzen</span>
          </div>
          <div class="brand-feature">
            <span class="check">✓</span>
            <span>Fortschritt im Blick behalten</span>
          </div>
        </div>

        <!-- DEMO-HINWEIS -->
        <div class="demo-hint">
          <span class="demo-tag">Demo</span>
          <span>benutzer@foodtracker.de / 123456</span>
        </div>
      </div>
    </div>

    <!-- Rechte Seite: Login-Formular -->
    <div class="login-form-container">
      <div class="login-form">
        <div class="form-header">
          <h2>Willkommen zurück</h2>
          <p>Melde dich an, um deine Ernährung zu tracken</p>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">E-Mail Adresse</label>
            <div class="input-wrapper">
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="deine@email.de"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Passwort</label>
            <div class="input-wrapper">
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="Passwort"
                required
              />
            </div>
          </div>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

          <button type="submit" :disabled="isLoading" class="btn-login">
            {{ isLoading ? 'Wird angemeldet...' : 'Anmelden' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ===== DEMO-DATEN =====
const DEMO_EMAIL = 'benutzer@foodtracker.de'
const DEMO_PASSWORD = '123456'

// ===== STATE (vorausgefüllt) =====
const email = ref(DEMO_EMAIL)
const password = ref(DEMO_PASSWORD)
const isLoading = ref(false)
const errorMessage = ref('')

// ===== LOGIN =====
async function handleLogin() {
  errorMessage.value = ''
  isLoading.value = true

  await new Promise((resolve) => setTimeout(resolve, 500))

  if (email.value === DEMO_EMAIL && password.value === DEMO_PASSWORD) {
    localStorage.setItem('user', JSON.stringify({ id: 1, email: email.value }))
    localStorage.setItem('userId', '1')
    router.push('/')
  } else {
    errorMessage.value = 'Falsche E-Mail oder Passwort'
  }

  isLoading.value = false
}
</script>

<style scoped>
.login-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 0;
  padding: 0;
  z-index: 9999;
  background: white;
}

.login-brand {
  background: linear-gradient(135deg, #1a1a2e 0%, #42b883 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px;
  color: white;
}

.brand-content {
  max-width: 400px;
}

.brand-content h1 {
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.brand-content p {
  font-size: 1.1rem;
  opacity: 0.85;
  line-height: 1.6;
  margin-bottom: 32px;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.brand-feature {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
  opacity: 0.9;
}

.brand-feature .check {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 700;
}

/* ===== DEMO-HINWEIS ===== */
.demo-hint {
  margin-top: 32px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
  backdrop-filter: blur(4px);
}

.demo-tag {
  background: #42b883;
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.login-form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: white;
}

.login-form {
  width: 100%;
  max-width: 400px;
}

.form-header {
  margin-bottom: 32px;
}

.form-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.form-header p {
  color: #888;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
  font-size: 0.9rem;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e8ecf0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #fafbfc;
  box-sizing: border-box;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #42b883;
  background: white;
  box-shadow: 0 0 0 4px rgba(66, 184, 131, 0.1);
}

.btn-login {
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

.btn-login:hover {
  background: #35a372;
  transform: scale(1.01);
  box-shadow: 0 8px 24px rgba(66, 184, 131, 0.3);
}

.btn-login:disabled {
  background: #a0d9c1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error {
  color: #dc3545;
  text-align: center;
  margin: 8px 0 4px 0;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .login-brand {
    display: none;
  }

  .login-form-container {
    padding: 24px;
  }

  .login-form {
    padding: 0;
  }
}

@media (max-width: 480px) {
  .form-header h2 {
    font-size: 1.4rem;
  }

  .btn-login {
    padding: 12px;
    font-size: 0.95rem;
  }

  .input-wrapper input {
    padding: 10px 14px;
    font-size: 0.95rem;
  }
}
</style>
