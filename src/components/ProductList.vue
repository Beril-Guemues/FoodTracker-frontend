<template>
  <div class="product-list">
    <h2>📋 Unsere Produkte</h2>
    <ul>
      <li v-for="product in products" :key="product.id">
        <strong>{{ product.name }}</strong> -
        {{ product.calories }} kcal pro 100g |
        💪 Protein: {{ product.protein }}g |
        🍚 Kohlenhydrate: {{ product.carbs }}g
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'ProductList',
  data() {
    return {
      products: []
    }
  },
  async mounted() {
    try {
      // So wird die Umgebungsvariable genutzt!
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/products`);
      this.products = await response.json();
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    }
  }
}
</script>

<style scoped>
.product-list {
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
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
}
</style>
