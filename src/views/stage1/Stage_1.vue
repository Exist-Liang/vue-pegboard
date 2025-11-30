<template>
    <div class="container mt-4">
      <h2>Stage 1</h2>
      <ul>
        <li><router-link to="/stage1/legacy-home">Legacy Home</router-link></li>
        <li><router-link to="/stage1/news">News</router-link></li>
        <li><router-link to="/stage1/about">About</router-link></li>
      </ul>
  
      <router-view />
    </div>
  </template>
  
  <script>
  export default {
    name: 'Stage1Page'
  }
  </script>
  
  <style scoped>
  .stage1-nav {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  </style>