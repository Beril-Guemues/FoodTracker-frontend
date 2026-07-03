<template>
  <div class="home">
    <!-- ===== HERO ===== -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <span class="badge">🍽️ FoodTracker</span>
          <h1>Dein persönlicher<br><span class="highlight">Ernährungs-Tracker</span></h1>
          <p>Tracke deine Mahlzeiten, erreiche deine Ziele und fühle dich großartig.</p>
          <div class="hero-buttons">
            <router-link to="/foodentry" class="btn-primary">
              Heute tracken
            </router-link>
            <router-link to="/profile" class="btn-secondary">
              Profil einrichten
            </router-link>
          </div>
        </div>
        <div class="hero-image">
          <div class="stats-card">
            <div class="stat">
              <span class="stat-number">2,400</span>
              <span class="stat-label">kcal heute</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-number">85</span>
              <span class="stat-label">Protein g</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== FEATURES ===== -->
    <section class="features-section">
      <div class="section-header">
        <span class="section-tag">Features</span>
        <h2>Alles was du brauchst</h2>
        <p>Von der Mahlzeiten-Erfassung bis zur Fortschrittsanalyse</p>
      </div>

      <div class="features-grid">
        <div class="feature-card" @click="navigateTo('/products')">
          <div class="feature-icon">📦</div>
          <h3>Produkte suchen</h3>
          <p>Finde Lebensmittel in unserer Datenbank</p>
          <span class="feature-link">→</span>
        </div>

        <div class="feature-card" @click="navigateTo('/foodentry')">
          <div class="feature-icon">📝</div>
          <h3>Mahlzeit tracken</h3>
          <p>Erfasse was du isst mit wenigen Klicks</p>
          <span class="feature-link">→</span>
        </div>

        <div class="feature-card" @click="navigateTo('/profile')">
          <div class="feature-icon">👤</div>
          <h3>Dein Profil</h3>
          <p>Persönliche Daten für genaue Berechnungen</p>
          <span class="feature-link">→</span>
        </div>

        <div class="feature-card" @click="navigateTo('/goal')">
          <div class="feature-icon">🎯</div>
          <h3>Ziele setzen</h3>
          <p>Abnehmen, Zunehmen oder Muskeln aufbauen</p>
          <span class="feature-link">→</span>
        </div>

        <div class="feature-card" @click="navigateTo('/nutrition')">
          <div class="feature-icon">💧</div>
          <h3>Nährwerte</h3>
          <p>Kalorienbedarf & Wasserempfehlung</p>
          <span class="feature-link">→</span>
        </div>

        <div class="feature-card" @click="navigateTo('/progress')">
          <div class="feature-icon">📊</div>
          <h3>Fortschritt</h3>
          <p>Deine Erfolge im Überblick</p>
          <span class="feature-link">→</span>
        </div>
      </div>
    </section>

    <!-- ===== TAGESSTATISTIK ===== -->
    <section class="daily-stats">
      <div class="stats-container">
        <div class="stat-item">
          <span class="stat-value">{{ dailyCalories }} kcal</span>
          <span class="stat-label">Heute aufgenommen</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ dailyProtein }} g</span>
          <span class="stat-label">Protein</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ dailyCarbs }} g</span>
          <span class="stat-label">Kohlenhydrate</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { foodEntryApi, userProfileApi } from '@/api/client'

const router = useRouter()

const dailyCalories = ref(0)
const dailyProtein = ref(0)
const dailyCarbs = ref(0)

const navigateTo = (path: string) => {
  router.push(path)
}

const loadDailyStats = async () => {
  try {
    const response = await foodEntryApi.getAll()
    const entries = response.data

    // Heutige Einträge filtern
    const today = new Date().toISOString().split('T')[0]
    const todayEntries = entries.filter(e => e.date === today)

    // Summen berechnen
    let calories = 0, protein = 0, carbs = 0
    todayEntries.forEach(entry => {
      const factor = entry.amount / 100
      calories += factor * (entry.product?.calories || 0)
      protein += factor * (entry.product?.protein || 0)
      carbs += factor * (entry.product?.carbs || 0)
    })

    dailyCalories.value = Math.round(calories)
    dailyProtein.value = Math.round(protein * 10) / 10
    dailyCarbs.value = Math.round(carbs * 10) / 10
  } catch {
    // Falls keine Einträge, bleiben Werte bei 0
  }
}

onMounted(() => {
  loadDailyStats()
})
</script>

<style scoped>
/* ===== GRUNDLAGEN ===== */
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

/* ===== HERO ===== */
.hero-section {
  padding: 40px 0 60px;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-text .badge {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(66, 184, 131, 0.12);
  color: #42b883;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.hero-text h1 {
  font-size: 3.2rem;
  font-weight: 700;
  line-height: 1.2;
  color: #1a1a2e;
  margin-bottom: 16px;
}

.hero-text .highlight {
  color: #42b883;
}

.hero-text p {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 28px;
}

.hero-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-primary {
  padding: 14px 32px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-primary:hover {
  background: #35a372;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(66, 184, 131, 0.3);
}

.btn-secondary {
  padding: 14px 32px;
  background: transparent;
  color: #1a1a2e;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-secondary:hover {
  border-color: #42b883;
  color: #42b883;
  transform: translateY(-2px);
}

/* Hero Image / Stats Card */
.hero-image {
  display: flex;
  justify-content: center;
}

.stats-card {
  background: white;
  padding: 32px 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 40px;
  align-items: center;
  border: 1px solid #f0f0f0;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2.4rem;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 0.85rem;
  color: #888;
}

.stat-divider {
  width: 1px;
  height: 50px;
  background: #e8ecf0;
}

/* ===== FEATURES ===== */
.features-section {
  padding: 60px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-tag {
  display: inline-block;
  padding: 4px 14px;
  background: rgba(66, 184, 131, 0.1);
  color: #42b883;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-header h2 {
  font-size: 2.4rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 8px 0;
}

.section-header p {
  color: #888;
  font-size: 1.05rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  background: white;
  padding: 28px 24px;
  border-radius: 16px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  border-color: #42b883;
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.feature-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 6px;
}

.feature-card p {
  font-size: 0.9rem;
  color: #888;
  line-height: 1.4;
}

.feature-link {
  position: absolute;
  bottom: 20px;
  right: 24px;
  font-size: 1.2rem;
  color: #42b883;
  opacity: 0;
  transition: all 0.3s;
}

.feature-card:hover .feature-link {
  opacity: 1;
  transform: translateX(4px);
}

/* ===== DAILY STATS ===== */
.daily-stats {
  background: white;
  border-radius: 16px;
  padding: 24px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
  margin-top: 40px;
}

.stats-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-item .stat-label {
  font-size: 0.85rem;
  color: #888;
}

.stats-container .stat-divider {
  height: 40px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 40px;
  }

  .hero-buttons {
    justify-content: center;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .hero-text h1 {
    font-size: 2.6rem;
  }

  .stats-card {
    padding: 24px 32px;
    gap: 24px;
  }

  .stat-number {
    font-size: 1.8rem;
  }
}

@media (max-width: 640px) {
  .features-grid {
    grid-template-columns: 1fr;
  }

  .hero-text h1 {
    font-size: 2rem;
  }

  .stats-container {
    flex-direction: column;
    gap: 12px;
  }

  .stats-container .stat-divider {
    display: none;
  }

  .stats-card {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .stat-divider {
    display: none;
  }

  .daily-stats {
    padding: 16px 20px;
  }

  .stat-value {
    font-size: 1.2rem;
  }
}

@media (min-width: 1400px) {
  .home {
    max-width: 1400px;
  }

  .hero-text h1 {
    font-size: 4rem;
  }

  .features-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
