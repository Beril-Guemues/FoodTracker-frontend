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
products: [
{ id: 1, name: 'Vollmilchschokolade', calories: 550, protein: 7.5, carbs: 55.0 },
{ id: 2, name: 'Hähnchenbrust', calories: 165, protein: 31.0, carbs: 0.0 },
{ id: 3, name: 'Apfel', calories: 52, protein: 0.3, carbs: 14.0 },
{ id: 4, name: 'Basmati Reis', calories: 130, protein: 2.7, carbs: 28.0 },
{ id: 5, name: 'Wasser', calories: 0, protein: 0.0, carbs: 0.0 }
]
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
