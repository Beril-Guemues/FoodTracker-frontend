<template>
  <div id="app">
    <h1>🍽️ FoodTracker</h1>
    <ProductList />
  </div>
</template>

<script>
import ProductList from './components/ProductList.vue'

export default {
  name: 'App',
  components: {
    ProductList
  }
}
</script>

<style>
#app {
  text-align: center;
  font-family: Arial, sans-serif;
}
</style>
