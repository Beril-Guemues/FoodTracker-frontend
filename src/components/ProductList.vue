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

// Dynamische URL aus den Render Environment Variables ziehen
const baseUrl = import.meta.env.VITE_API_BASE_URL

// 1. Daten live über die Umgebungsvariable laden (GET)
const loadProducts = async () => {
  try {
    const response = await fetch(`${baseUrl}/products`)
    if (response.ok) {
      products.value = await response.json()
    } else {
      console.error('Server antwortete mit Fehler:', response.status)
    }
  } catch (error) {
    console.error('Fehler beim Laden von der API:', error)
  }
}

// 2. Neues Produkt an die API schicken (POST)
const saveProduct = async () => {
  try {
    const response = await fetch(`${baseUrl}/products`, {
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
    console.error('Verbindungsfehler:', error)
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.product-list-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}
.form-container {
  background: #f9f9f9;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: left;
}
.form-group {
  margin-bottom: 10px;
}
label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}
input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.btn-submit {
  background-color: #218838;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  margin-top: 10px;
}
.btn-submit:hover {
  background-color: #1e7e34;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  background: #f5f5f5;
  margin: 10px 0;
  padding: 12px;
  border-radius: 8px;
  text-align: left;
}
.empty-message {
  color: #777;
  font-style: italic;
}
</style>
