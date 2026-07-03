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
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

          <button type="submit" :disabled="isLoading" class="btn-login">
            {{ isLoading ? 'Wird angemeldet...' : 'Anmelden' }}
          </button>
        </form>

        <div class="form-footer">
          <p>
            Noch keinen Account?
            <a href="#" @click.prevent="showRegister = true">Jetzt registrieren</a>
          </p>
        </div>
      </div>
    </div>

    <!-- ===== REGISTRIERUNG (Overlay) ===== -->
    <div v-if="showRegister" class="register-overlay" @click.self="showRegister = false">
      <div class="register-card">
        <button class="close-btn" @click="showRegister = false">✕</button>
        <h2>Konto erstellen</h2>
        <p>Beginne deine Reise zu einem gesünderen Leben</p>

        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="reg-email">E-Mail Adresse</label>
            <input
              id="reg-email"
              v-model="registerEmail"
              type="email"
              placeholder="deine@email.de"
              required
            />
          </div>

          <div class="form-group">
            <label for="reg-password">Passwort</label>
            <input
              id="reg-password"
              v-model="registerPassword"
              type="password"
              placeholder="Mindestens 6 Zeichen"
              required
              minlength="6"
            />
          </div>

          <div class="form-group">
            <label for="reg-confirm">Passwort bestätigen</label>
            <input
              id="reg-confirm"
              v-model="confirmPassword"
              type="password"
              placeholder="Passwort wiederholen"
              required
            />
          </div>

          <p v-if="registerError" class="error">{{ registerError }}</p>
          <p v-if="registerSuccess" class="success">{{ registerSuccess }}</p>

          <button type="submit" :disabled="isRegistering" class="btn-login">
            {{ isRegistering ? 'Wird registriert...' : 'Registrieren' }}
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

// ===== HARDCODED LOGIN =====
const VALID_EMAIL = 'beril@foodtracker.de'
const VALID_PASSWORD = '123456'

// ===== STATE =====
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

// ===== REGISTER =====
const showRegister = ref(false)
const registerEmail = ref('')
const registerPassword = ref('')
const confirmPassword = ref('')
const isRegistering = ref(false)
const registerError = ref('')
const registerSuccess = ref('')

// ===== LOGIN =====
async function handleLogin() {
  errorMessage.value = ''
  isLoading.value = true

  await new Promise(resolve => setTimeout(resolve, 500))

  if (email.value === VALID_EMAIL && password.value === VALID_PASSWORD) {
    localStorage.setItem('user', JSON.stringify({ id: 1, email: email.value }))
    localStorage.setItem('userId', '1')
    router.push('/')
  } else {
    errorMessage.value = 'Falsche E-Mail oder Passwort'
  }

  isLoading.value = false
}

// ===== REGISTER =====
async function handleRegister() {
  registerError.value = ''
  registerSuccess.value = ''

  if (registerPassword.value !== confirmPassword.value) {
    registerError.value = 'Passwörter stimmen nicht überein'
    return
  }

  if (registerPassword.value.length < 6) {
    registerError.value = 'Passwort muss mindestens 6 Zeichen haben'
    return
  }

  isRegistering.value = true
  await new Promise(resolve => setTimeout(resolve, 500))

  registerSuccess.value = 'Registrierung erfolgreich! Bitte anmelden.'
  registerEmail.value = ''
  registerPassword.value = ''
  confirmPassword.value = ''

  setTimeout(() => {
    showRegister.value = false
    registerSuccess.value = ''
  }, 2000)

  isRegistering.value = false
}
</script>

<style scoped>
/* ===== GRUNDLAGEN ===== */
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

/* ===== LINKE SEITE: BRANDING ===== */
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

/* ===== RECHTE SEITE: FORMULAR ===== */
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

/* ===== FORMULAR ===== */
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

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
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

/* ===== BUTTONS ===== */
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

/* ===== FORM FOOTER ===== */
.form-footer {
  text-align: center;
  margin-top: 24px;
  color: #888;
  font-size: 0.95rem;
}

.form-footer a {
  color: #42b883;
  text-decoration: none;
  font-weight: 600;
}

.form-footer a:hover {
  text-decoration: underline;
}

/* ===== MESSAGES ===== */
.error {
  color: #dc3545;
  text-align: center;
  margin: 8px 0 4px 0;
  font-size: 0.9rem;
}

.success {
  color: #28a745;
  text-align: center;
  margin: 8px 0 4px 0;
  font-size: 0.9rem;
}

/* ===== REGISTER OVERLAY ===== */
.register-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  z-index: 10000;
  animation: fadeIn 0.25s ease;
}

.register-card {
  background: white;
  padding: 40px 48px;
  border-radius: 20px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: slideUp 0.3s ease;
}

.register-card .close-btn {
  position: absolute;
  top: 16px;
  right: 20px;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #888;
  transition: color 0.2s;
}

.register-card .close-btn:hover {
  color: #333;
}

.register-card h2 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.register-card p {
  color: #888;
  margin-bottom: 24px;
}

.register-card .form-group input {
  padding: 12px 16px;
}

/* ===== ANIMATIONEN ===== */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* ===== RESPONSIVE ===== */
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
  .register-card {
    padding: 28px 20px;
  }

  .form-header h2 {
    font-size: 1.4rem;
  }

  .btn-login {
    padding: 12px;
    font-size: 0.95rem;
  }

  .input-wrapper input {
    padding: 10px 14px 10px 40px;
    font-size: 0.95rem;
  }
}
</style>
