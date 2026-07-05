import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProductList from '@/components/lists/ProductList.vue'
import FoodEntryForm from '@/components/form/FoodEntryForm.vue'
import ProfileForm from '@/components/form/ProfileForm.vue'
import GoalForm from '@/components/form/GoalForm.vue'
import ProgressChart from '@/components/charts/ProgressChart.vue'
import NutritionSummary from '@/components/charts/NutritionSummary.vue'
import CustomFoodForm from '@/components/form/CustomFoodForm.vue'
import LoginView from '@/components/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false, requiresProfile: false },
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true, requiresProfile: true },
    },
    {
      path: '/products',
      name: 'products',
      component: ProductList,
      meta: { requiresAuth: true, requiresProfile: true },
    },
    {
      path: '/foodentry',
      name: 'foodentry',
      component: FoodEntryForm,
      meta: { requiresAuth: true, requiresProfile: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileForm,
      meta: { requiresAuth: true, requiresProfile: false },
    },
    {
      path: '/goal',
      name: 'goal',
      component: GoalForm,
      meta: { requiresAuth: true, requiresProfile: true },
    },
    {
      path: '/progress',
      name: 'progress',
      component: ProgressChart,
      meta: { requiresAuth: true, requiresProfile: true },
    },
    {
      path: '/nutrition',
      name: 'nutrition',
      component: NutritionSummary,
      meta: { requiresAuth: true, requiresProfile: true },
    },
    {
      path: '/custom-food',
      name: 'custom-food',
      component: CustomFoodForm,
      meta: { requiresAuth: true, requiresProfile: true },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: false, requiresProfile: false },
    },
  ],
})

// ===== AUTH GUARD (gefixt – ohne next) =====
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('user')
  const hasProfile = !!localStorage.getItem('userProfile')

  // 1. Wenn Login-Seite und bereits eingeloggt → Startseite
  if (to.path === '/login' && isAuthenticated) {
    next('/')
    return
  }

  // 2. Wenn Seite Auth braucht, aber nicht eingeloggt → Login
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  // 3. WENN EINGELOGGT UND KEIN PROFIL → PROFIL-SEITE
  if (isAuthenticated && !hasProfile && to.path !== '/profile') {
    next('/profile')
    return
  }

  // 4. WENN EINGELOGGT, PROFIL VORHANDEN, ABER KEIN ZIEL → ZIEL-SEITE
  const hasGoal = !!localStorage.getItem('userGoal')
  if (isAuthenticated && hasProfile && !hasGoal && to.path !== '/goal' && to.path !== '/profile') {
    next('/goal')
    return
  }

  // 5. Alles okay → weiter
  next()
})
export default router
