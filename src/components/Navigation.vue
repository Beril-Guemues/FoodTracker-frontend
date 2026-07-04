<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="nav-brand">FoodTracker</router-link>

      <div class="nav-links">
        <router-link to="/products" class="nav-link">Lebensmittel</router-link>
        <router-link to="/foodentry" class="nav-link">Mahlzeiten</router-link>
        <router-link to="/profile" class="nav-link">Profil</router-link>
        <router-link to="/goal" class="nav-link">Ziel</router-link>
        <router-link to="/nutrition" class="nav-link">Nährwerte</router-link>
        <router-link to="/progress" class="nav-link">Fortschritt</router-link>
        <button @click="logout" class="btn-logout">Abmelden</button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function logout() {
  localStorage.removeItem('user')
  localStorage.removeItem('userId')
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  background: #1a1a2e;
  padding: 14px 0;
  border-bottom: 3px solid #42b883;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
  letter-spacing: -0.5px;
  transition: color 0.2s;
}

.nav-brand:hover {
  color: #42b883;
}

.nav-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.nav-link {
  color: #a0aec0;
  text-decoration: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.06);
}

.nav-link.router-link-active {
  color: #42b883;
  background: rgba(66, 184, 131, 0.12);
}

.btn-logout {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  margin-left: 4px;
}

.btn-logout:hover {
  background: #c82333;
  transform: scale(1.02);
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .nav-links {
    justify-content: center;
    gap: 4px;
  }

  .nav-link {
    font-size: 0.8rem;
    padding: 4px 10px;
  }

  .btn-logout {
    font-size: 0.8rem;
    padding: 4px 12px;
  }
}

@media (max-width: 480px) {
  .nav-links {
    flex-wrap: wrap;
  }

  .nav-brand {
    text-align: center;
    font-size: 1.2rem;
  }

  .nav-link {
    font-size: 0.7rem;
    padding: 4px 8px;
  }

  .btn-logout {
    font-size: 0.7rem;
    padding: 4px 10px;
  }
}
</style>
