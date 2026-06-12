<template>
  <div class="product-list-container">
    <div class="form-container">
      <h3>➕ Neues Produkt hinzufügen</h3>
      <form @submit.prevent="saveProduct">
        <div class="form-group">
          <label>Produktname:</label>
          <input v-model="newProduct.name" type="text" placeholder="z.B. Banane" required />
        </div>

        <div class="form-group">
          <label>Kalorien (kcal):</label>
          <input v-model.number="newProduct.calories" type="number" placeholder="z.B. 89" required />
        </div>

        <button type="submit" class="btn-submit">In Datenbank speichern</button>
      </form>
    </div>

    <h2>🍽️ Meine Produkte</h2>
    <ul v-if="products.length > 0">
      <li v-for="product in products" :key="product.id">
        <strong>{{ product.name }}</strong> - {{ product.calories }} kcal
      </li>
    </ul>
    <p v-else class="empty-message">Lade Produkte...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const products = ref([])
const newProduct = ref({
  name: '',
  calories: 0
})

// 1. Basis-URL aus Render holen
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

// 2. Automatischer Schrägstrich-Schutz: Garantiert, dass die URL am Ende IMMER genau einen "/" hat
const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`

// 3. Daten live vom RENDER-BACKEND laden (GET)
const loadProducts = async () => {
  try {
    // Verbindet die bereinigte URL direkt mit "products" -> kein Doppel-Slash mehr!
    const response = await fetch(`${baseUrl}products`)
    if (response.ok) {
      products.value = await response.json()
    } else {
      console.error('Server-Fehler beim Laden:', response.status)
    }
  } catch (error) {
    console.error('Fehler beim Laden von der API:', error)
  }
}

// 4. Neues Produkt an das RENDER-BACKEND schicken (POST)
const saveProduct = async () => {
  try {
    const response = await fetch(`${baseUrl}products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newProduct.value)
    })

    if (response.ok) {
      alert('Erfolgreich in der Render-Datenbank gespeichert!')
      newProduct.value = { name: '', calories: 0 }
      await loadProducts()
    } else {
      alert('Fehler beim Speichern im Backend.')
    }
  } catch (error) {
    console.
