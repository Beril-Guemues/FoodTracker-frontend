<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style>
/* Hier kannst du optional Styles für die gesamte App reinpacken */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #ffffff;
}
</style>
