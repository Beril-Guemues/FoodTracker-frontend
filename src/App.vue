<template>
  <div id="app">
    <header>
      <h1>🍽️ FoodTracker - Meine Produkte</h1>
    </header>
    <main>
      <!-- Hier wird deine neue Produktliste aufgerufen -->
      <ProductList />
    </main>
  </div>
</template>

<script setup>
// Hier importieren wir die Komponente, die wir gerade gebaut haben
import ProductList from './components/ProductList.vue'
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
header {
  margin-bottom: 30px;
}
</style>
