export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const API_ENDPOINTS = {
  products: `${API_URL}/products`,
  productsSearch: (query: string) => `${API_URL}/products/search?q=${encodeURIComponent(query)}`,
  productById: (id: number) => `${API_URL}/products/${id}`,
  foodEntries: `${API_URL}/foodentries`,
  foodEntriesDate: (date: string) => `${API_URL}/foodentries/date?date=${date}`,
  foodEntryById: (id: number) => `${API_URL}/foodentries/${id}`,
  goals: `${API_URL}/goals`,
  goalsByUser: (userId: number) => `${API_URL}/goals/user/${userId}`,
  goalById: (id: number) => `${API_URL}/goals/${id}`,
  profiles: `${API_URL}/profiles`,
  profileById: (id: number) => `${API_URL}/profiles/${id}`,
  profileCalorie: (id: number) => `${API_URL}/profiles/${id}/calorie-need`,
  profileWater: (id: number) => `${API_URL}/profiles/${id}/water-need`,
}
