import axios from 'axios'
import { API_URL } from './config'
import type { Product, FoodEntry, Goal, UserProfile } from '@/types'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const productApi = {
  getAll: () => api.get<Product[]>('/products'),
  search: (query: string) => api.get<Product[]>(`/products/search?q=${encodeURIComponent(query)}`),
  getById: (id: number) => api.get<Product>(`/products/${id}`),
  create: (data: Omit<Product, 'id'>) => api.post<Product>('/products', data),
  update: (id: number, data: Product) => api.put<Product>(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
}

export const foodEntryApi = {
  getAll: () => api.get<FoodEntry[]>('/foodentries'),
  getByDate: (date: string) => api.get<FoodEntry[]>(`/foodentries/date?date=${date}`),
  getById: (id: number) => api.get<FoodEntry>(`/foodentries/${id}`),
  create: (data: Omit<FoodEntry, 'id'>) => api.post<FoodEntry>('/foodentries', data),
  update: (id: number, data: FoodEntry) => api.put<FoodEntry>(`/foodentries/${id}`, data),
  delete: (id: number) => api.delete(`/foodentries/${id}`),
}

export const goalApi = {
  getAll: () => api.get<Goal[]>('/goals'),
  getByUser: (userId: number) => api.get<Goal[]>(`/goals/user/${userId}`),
  getById: (id: number) => api.get<Goal>(`/goals/${id}`),
  create: (data: Omit<Goal, 'id'>) => api.post<Goal>('/goals', data),
  update: (id: number, data: Goal) => api.put<Goal>(`/goals/${id}`, data),
  delete: (id: number) => api.delete(`/goals/${id}`),
}

export const userProfileApi = {
  getAll: () => api.get<UserProfile[]>('/profiles'),
  getById: (id: number) => api.get<UserProfile>(`/profiles/${id}`),
  create: (data: Omit<UserProfile, 'id'>) => api.post<UserProfile>('/profiles', data),
  update: (id: number, data: UserProfile) => api.put<UserProfile>(`/profiles/${id}`, data),
  delete: (id: number) => api.delete(`/profiles/${id}`),
  getCalorieNeed: (id: number) => api.get<number>(`/profiles/${id}/calorie-need`),
  getWaterNeed: (id: number) => api.get<number>(`/profiles/${id}/water-need`),
}

export default api
