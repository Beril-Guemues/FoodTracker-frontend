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
      component: ProfileForm,
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
