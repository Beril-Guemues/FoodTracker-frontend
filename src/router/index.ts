import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProductList from '@/components/ProductList.vue'
import FoodEntryForm from '@/components/FoodEntryForm.vue'
import ProfileForm from '@/components/ProfileForm.vue'      // ← Vorhanden?
import GoalForm from '@/components/GoalForm.vue'
import ProgressChart from '@/components/ProgressChart.vue'
import NutritionSummary from '@/components/NutritionSummary.vue'
import CustomFoodForm from '@/components/CustomFoodForm.vue'
import Login from '@/components/Login.vue'                  // ← Wichtig!

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/products',
      name: 'products',
      component: ProductList,
      meta: { requiresAuth: true },
    },
    {
      path: '/foodentry',
      name: 'foodentry',
      component: FoodEntryForm,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileForm,          // ← MUSS existieren!
      meta: { requiresAuth: true },
    },
    {
      path: '/goal',
      name: 'goal',
      component: GoalForm,
      meta: { requiresAuth: true },
    },
    {
      path: '/progress',
      name: 'progress',
      component: ProgressChart,
      meta: { requiresAuth: true },
    },
    {
      path: '/nutrition',
      name: 'nutrition',
      component: NutritionSummary,
      meta: { requiresAuth: true },
    },
    {
      path: '/custom-food',
      name: 'custom-food',
      component: CustomFoodForm,
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

// ===== AUTH GUARD =====
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('user')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
